# Monitoring and Maintenance

## Overview

This guide covers monitoring, maintenance, and operational procedures for MedCare Pro in production environments. It includes system monitoring, performance optimization, backup strategies, and troubleshooting procedures.

## System Monitoring

### 1. Application Performance Monitoring (APM)

#### PM2 Monitoring

PM2 provides built-in monitoring for Node.js applications:

```bash
# Real-time monitoring dashboard
pm2 monit

# Application status
pm2 status

# Resource usage
pm2 show medcare-api

# Memory usage analysis
pm2 info medcare-api | grep memory

# CPU usage tracking
pm2 logs medcare-api --lines 100 | grep "CPU"
```

**PM2 Monitoring Configuration:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'medcare-api',
    script: './server/bin/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3333
    },
    // Monitoring configuration
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 5,
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Performance monitoring
    pmx: true,
    // Health check
    health_check_url: 'http://localhost:3333/api/health',
    health_check_grace_period: 3000
  }]
}
```

#### Custom Health Checks

```typescript
// Health check endpoint with detailed status
router.get('/api/system/health', async ({ response }) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // Database connectivity
    const dbCheck = await Database.rawQuery('SELECT 1 as ok');
    health.checks.database = {
      status: dbCheck[0]?.ok === 1 ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - startTime
    };

    // Memory usage
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      status: memUsage.heapUsed < 400 * 1024 * 1024 ? 'healthy' : 'warning', // 400MB threshold
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    };

    // Disk space
    const diskUsage = await checkDiskSpace('/');
    health.checks.disk = {
      status: diskUsage.free > 1024 * 1024 * 1024 ? 'healthy' : 'critical', // 1GB threshold
      free: `${Math.round(diskUsage.free / 1024 / 1024 / 1024)}GB`,
      total: `${Math.round(diskUsage.size / 1024 / 1024 / 1024)}GB`,
      percentage: `${Math.round((diskUsage.free / diskUsage.size) * 100)}%`
    };

    // External services
    health.checks.externalServices = await checkExternalServices();

    // Overall status
    const allChecks = Object.values(health.checks);
    if (allChecks.some(check => check.status === 'critical')) {
      health.status = 'critical';
    } else if (allChecks.some(check => check.status === 'unhealthy')) {
      health.status = 'unhealthy';
    } else if (allChecks.some(check => check.status === 'warning')) {
      health.status = 'warning';
    }

    return response.status(health.status === 'ok' ? 200 : 503).json(health);
  } catch (error) {
    return response.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

async function checkExternalServices() {
  const services = {};
  
  try {
    // Email service check
    const emailCheck = await axios.get('https://api.sendgrid.com/v3', {
      headers: { 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}` },
      timeout: 5000
    });
    services.email = { status: 'healthy' };
  } catch (error) {
    services.email = { status: 'unhealthy', error: error.message };
  }

  return services;
}
```

### 2. Database Monitoring

#### MySQL Performance Monitoring

```sql
-- Monitor active connections
SHOW PROCESSLIST;

-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log%';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Monitor table locks
SHOW OPEN TABLES WHERE In_use > 0;

-- Check InnoDB status
SHOW ENGINE INNODB STATUS;

-- Monitor database size
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
GROUP BY table_schema;

-- Monitor table sizes
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
  table_rows AS 'Rows'
FROM information_schema.tables 
WHERE table_schema = 'medcare_prod'
ORDER BY (data_length + index_length) DESC;
```

#### Database Health Check Script

```bash
#!/bin/bash
# database-health.sh

DB_HOST="localhost"
DB_USER="medcare_user"
DB_NAME="medcare_prod"
LOG_FILE="/var/log/medcare/db-health.log"

echo "$(date): Starting database health check" >> $LOG_FILE

# Check database connectivity
if mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SELECT 1;" > /dev/null 2>&1; then
    echo "$(date): Database connectivity: OK" >> $LOG_FILE
else
    echo "$(date): Database connectivity: FAILED" >> $LOG_FILE
    # Send alert
    curl -X POST "https://api.slack.com/api/chat.postMessage" \
      -H "Authorization: Bearer $SLACK_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"channel":"#alerts","text":"🚨 Database connectivity check failed!"}'
fi

# Check disk space for database
DB_SIZE=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "
  SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb 
  FROM information_schema.tables 
  WHERE table_schema = '$DB_NAME';" | tail -1)

echo "$(date): Database size: ${DB_SIZE}MB" >> $LOG_FILE

# Check for long-running queries
LONG_QUERIES=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "
  SELECT COUNT(*) as count 
  FROM information_schema.processlist 
  WHERE command != 'Sleep' AND time > 30;" | tail -1)

if [ "$LONG_QUERIES" -gt 0 ]; then
    echo "$(date): Warning: $LONG_QUERIES long-running queries detected" >> $LOG_FILE
fi

echo "$(date): Database health check completed" >> $LOG_FILE
```

### 3. System Resource Monitoring

#### CPU and Memory Monitoring

```bash
#!/bin/bash
# system-monitor.sh

# Get system metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f"), $3/$2 * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s", $5}' | sed 's/%//')
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1 | tr -d ' ')

echo "$(date): CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%, Load: ${LOAD_AVG}"

# Check thresholds
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "🚨 HIGH CPU USAGE: ${CPU_USAGE}%"
fi

if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    echo "🚨 HIGH MEMORY USAGE: ${MEMORY_USAGE}%"
fi

if [ "$DISK_USAGE" -gt 85 ]; then
    echo "🚨 HIGH DISK USAGE: ${DISK_USAGE}%"
fi
```

#### Log Monitoring

```bash
#!/bin/bash
# log-monitor.sh

LOG_DIR="/var/www/medcare/logs"
ERROR_THRESHOLD=10

# Count errors in the last hour
ERROR_COUNT=$(grep -c "ERROR\|FATAL\|Exception" $LOG_DIR/combined.log | tail -1)

if [ "$ERROR_COUNT" -gt "$ERROR_THRESHOLD" ]; then
    echo "🚨 High error rate detected: $ERROR_COUNT errors in the last hour"
    
    # Get recent errors
    tail -100 $LOG_DIR/err.log | mail -s "MedCare Errors Alert" admin@yourhospital.com
fi

# Check log file sizes
for log_file in $LOG_DIR/*.log; do
    size=$(du -m "$log_file" | cut -f1)
    if [ "$size" -gt 100 ]; then
        echo "⚠️ Large log file detected: $log_file (${size}MB)"
    fi
done
```

## Performance Optimization

### 1. Database Performance Tuning

#### Query Optimization

```sql
-- Identify slow queries
SELECT 
  sql_text,
  exec_count,
  avg_timer_wait/1000000000 as avg_exec_time_sec,
  format_bytes(avg_memory_used) as avg_memory_used
FROM performance_schema.events_statements_summary_by_digest 
WHERE schema_name = 'medcare_prod'
ORDER BY avg_timer_wait DESC 
LIMIT 10;

-- Index usage analysis
SELECT 
  t.table_name,
  s.index_name,
  s.cardinality,
  s.statistics
FROM information_schema.tables t
LEFT JOIN information_schema.statistics s ON t.table_name = s.table_name
WHERE t.table_schema = 'medcare_prod'
ORDER BY t.table_name, s.seq_in_index;

-- Missing indexes detection
SELECT 
  object_schema,
  object_name,
  index_name,
  sql_text
FROM performance_schema.events_statements_summary_by_digest 
WHERE sql_text LIKE '%WHERE%' 
AND sql_text NOT LIKE '%INDEX%'
ORDER BY sum_timer_wait DESC;
```

#### MySQL Configuration Tuning

```ini
# /etc/mysql/mysql.conf.d/medcare.cnf
[mysqld]
# Memory settings
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M

# Connection settings
max_connections = 500
connect_timeout = 60
wait_timeout = 28800

# Query cache (MySQL 5.7 and below)
query_cache_type = 1
query_cache_size = 64M

# InnoDB settings
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2
innodb_thread_concurrency = 8

# Slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
log_queries_not_using_indexes = 1
```

### 2. Application Performance

#### Node.js Optimization

```typescript
// Performance monitoring middleware
export function performanceMiddleware() {
  return async (ctx: HttpContext, next: () => Promise<void>) => {
    const start = Date.now();
    
    await next();
    
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${ctx.request.method()} ${ctx.request.url()} - ${duration}ms`);
    }
    
    // Add performance header
    ctx.response.header('X-Response-Time', `${duration}ms`);
    
    // Store metrics
    await PerformanceMetric.create({
      method: ctx.request.method(),
      url: ctx.request.url(),
      statusCode: ctx.response.getStatus(),
      responseTime: duration,
      timestamp: new Date()
    });
  };
}

// Memory usage monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
  });
}, 60000); // Every minute
```

#### Frontend Optimization

```typescript
// Bundle analysis
// package.json
{
  "scripts": {
    "analyze": "npm run build && npx webpack-bundle-analyzer dist/static/js/*.js"
  }
}

// Lazy loading implementation
const PatientManagement = lazy(() => import('./components/PatientManagement'));
const AppointmentScheduler = lazy(() => import('./components/AppointmentScheduler'));

// Performance monitoring
function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }, []);
}
```

## Backup and Recovery

### 1. Database Backup Strategy

#### Automated Backup Script

```bash
#!/bin/bash
# backup-database.sh

# Configuration
DB_HOST="localhost"
DB_USER="backup_user"
DB_PASSWORD="$DB_BACKUP_PASSWORD"
DB_NAME="medcare_prod"
BACKUP_DIR="/var/backups/medcare"
RETENTION_DAYS=30
S3_BUCKET="medcare-backups"

# Create timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="medcare_backup_$TIMESTAMP.sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
echo "$(date): Starting database backup..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --hex-blob \
  $DB_NAME > $BACKUP_PATH

if [ $? -eq 0 ]; then
    echo "$(date): Database backup created: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_PATH
    COMPRESSED_FILE="${BACKUP_PATH}.gz"
    
    # Upload to S3 (optional)
    aws s3 cp $COMPRESSED_FILE s3://$S3_BUCKET/database/
    
    if [ $? -eq 0 ]; then
        echo "$(date): Backup uploaded to S3"
    else
        echo "$(date): Failed to upload backup to S3"
    fi
    
    # Clean up old backups
    find $BACKUP_DIR -name "*.gz" -type f -mtime +$RETENTION_DAYS -delete
    echo "$(date): Cleaned up backups older than $RETENTION_DAYS days"
    
else
    echo "$(date): Database backup failed"
    exit 1
fi

echo "$(date): Backup process completed"
```

#### Point-in-Time Recovery Setup

```bash
# Enable binary logging in MySQL
echo "log-bin = /var/log/mysql/mysql-bin.log" >> /etc/mysql/mysql.conf.d/mysqld.cnf
echo "expire_logs_days = 7" >> /etc/mysql/mysql.conf.d/mysqld.cnf

# Restart MySQL
systemctl restart mysql

# Recovery process example
# 1. Restore from last full backup
gunzip medcare_backup_20240115_020000.sql.gz
mysql -u root -p medcare_prod < medcare_backup_20240115_020000.sql

# 2. Apply binary logs from backup time to desired point
mysqlbinlog --start-datetime="2024-01-15 02:00:00" \
            --stop-datetime="2024-01-15 14:30:00" \
            /var/log/mysql/mysql-bin.000001 | mysql -u root -p medcare_prod
```

### 2. File System Backup

```bash
#!/bin/bash
# backup-files.sh

SOURCE_DIR="/var/www/medcare"
BACKUP_DIR="/var/backups/medcare/files"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup using rsync
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'logs/*.log' \
  --exclude 'tmp/*' \
  $SOURCE_DIR/ $BACKUP_DIR/app_backup_$TIMESTAMP/

# Create tar archive
tar -czf $BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz -C $BACKUP_DIR app_backup_$TIMESTAMP/

# Remove uncompressed backup
rm -rf $BACKUP_DIR/app_backup_$TIMESTAMP/

echo "File system backup completed: app_backup_$TIMESTAMP.tar.gz"
```

## Log Management

### 1. Log Rotation Configuration

```bash
# /etc/logrotate.d/medcare
/var/www/medcare/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload medcare-api
    endscript
}

/var/log/nginx/medcare*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        nginx -s reload
    endscript
}
```

### 2. Centralized Logging (Optional)

#### ELK Stack Setup

```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

## Security Monitoring

### 1. Security Audit

```bash
#!/bin/bash
# security-audit.sh

LOG_FILE="/var/log/medcare/security-audit.log"

echo "$(date): Starting security audit" >> $LOG_FILE

# Check for failed login attempts
FAILED_LOGINS=$(grep "authentication failed" /var/www/medcare/logs/combined.log | wc -l)
if [ "$FAILED_LOGINS" -gt 50 ]; then
    echo "$(date): Warning: $FAILED_LOGINS failed login attempts detected" >> $LOG_FILE
fi

# Check for suspicious IP addresses
SUSPICIOUS_IPS=$(awk '/authentication failed/ {print $NF}' /var/www/medcare/logs/combined.log | sort | uniq -c | sort -nr | head -10)
echo "$(date): Top failed login IPs: $SUSPICIOUS_IPS" >> $LOG_FILE

# Check SSL certificate expiry
SSL_EXPIRY=$(openssl x509 -in /etc/ssl/certs/medcare.crt -noout -enddate | cut -d= -f2)
EXPIRY_SECONDS=$(date -d "$SSL_EXPIRY" +%s)
CURRENT_SECONDS=$(date +%s)
DAYS_TO_EXPIRY=$(( ($EXPIRY_SECONDS - $CURRENT_SECONDS) / 86400 ))

if [ "$DAYS_TO_EXPIRY" -lt 30 ]; then
    echo "$(date): Warning: SSL certificate expires in $DAYS_TO_EXPIRY days" >> $LOG_FILE
fi

# Check for unauthorized access attempts
UNAUTHORIZED_ACCESS=$(grep -c "401\|403" /var/log/nginx/access.log)
echo "$(date): Unauthorized access attempts: $UNAUTHORIZED_ACCESS" >> $LOG_FILE

echo "$(date): Security audit completed" >> $LOG_FILE
```

### 2. Intrusion Detection

```bash
#!/bin/bash
# intrusion-detection.sh

# Monitor for common attack patterns
ATTACK_PATTERNS=(
    "SELECT.*FROM.*WHERE"
    "<script"
    "javascript:"
    "../../../"
    "cmd.exe"
    "/etc/passwd"
    "union.*select"
)

for pattern in "${ATTACK_PATTERNS[@]}"; do
    matches=$(grep -ci "$pattern" /var/log/nginx/access.log)
    if [ "$matches" -gt 0 ]; then
        echo "$(date): Potential attack detected: $pattern ($matches occurrences)"
    fi
done
```

## Automated Maintenance

### 1. Maintenance Cron Jobs

```bash
# /etc/crontab

# Database backup (daily at 2 AM)
0 2 * * * root /var/www/medcare/scripts/backup-database.sh

# File backup (daily at 3 AM)
0 3 * * * root /var/www/medcare/scripts/backup-files.sh

# System health check (every 15 minutes)
*/15 * * * * root /var/www/medcare/scripts/health-check.sh

# Log cleanup (weekly)
0 4 * * 0 root /var/www/medcare/scripts/cleanup-logs.sh

# Security audit (daily at 6 AM)
0 6 * * * root /var/www/medcare/scripts/security-audit.sh

# Database optimization (weekly)
0 5 * * 0 root /var/www/medcare/scripts/optimize-database.sh

# SSL certificate check (daily)
0 7 * * * root /var/www/medcare/scripts/check-ssl.sh
```

### 2. Database Maintenance

```bash
#!/bin/bash
# optimize-database.sh

DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="$DB_ROOT_PASSWORD"
DB_NAME="medcare_prod"

echo "$(date): Starting database optimization"

# Analyze tables
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT CONCAT('ANALYZE TABLE ', table_schema, '.', table_name, ';') 
FROM information_schema.tables 
WHERE table_schema = '$DB_NAME';" | grep -v CONCAT > /tmp/analyze.sql

mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < /tmp/analyze.sql

# Optimize tables
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT CONCAT('OPTIMIZE TABLE ', table_schema, '.', table_name, ';') 
FROM information_schema.tables 
WHERE table_schema = '$DB_NAME';" | grep -v CONCAT > /tmp/optimize.sql

mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < /tmp/optimize.sql

# Clean up temporary files
rm /tmp/analyze.sql /tmp/optimize.sql

echo "$(date): Database optimization completed"
```

## Troubleshooting Guide

### 1. Common Issues

#### High Memory Usage

```bash
# Identify memory-consuming processes
ps aux --sort=-%mem | head -10

# Check PM2 memory usage
pm2 show medcare-api | grep memory

# Restart if memory usage is too high
if [ $(pm2 show medcare-api | grep "memory usage" | awk '{print $3}' | sed 's/M//') -gt 400 ]; then
    echo "Restarting due to high memory usage"
    pm2 restart medcare-api
fi
```

#### Database Connection Issues

```bash
# Check MySQL status
systemctl status mysql

# Check active connections
mysql -e "SHOW STATUS LIKE 'Threads_connected';"

# Check for locked tables
mysql -e "SHOW OPEN TABLES WHERE In_use > 0;"

# Kill long-running queries
mysql -e "
SELECT CONCAT('KILL ', id, ';') 
FROM INFORMATION_SCHEMA.PROCESSLIST 
WHERE command != 'Sleep' AND time > 300;
"
```

#### Application Errors

```bash
# Check recent errors
tail -100 /var/www/medcare/logs/err.log

# Check application status
pm2 status medcare-api

# View real-time logs
pm2 logs medcare-api --lines 50

# Restart application
pm2 restart medcare-api
```

### 2. Performance Issues

#### Slow Database Queries

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Check current queries
SHOW PROCESSLIST;

-- Kill slow queries
KILL QUERY <process_id>;

-- Analyze query performance
EXPLAIN SELECT * FROM patients WHERE organization_id = 'uuid';
```

#### High CPU Usage

```bash
# Identify CPU-intensive processes
top -o %CPU

# Check Node.js processes
ps aux | grep node

# Monitor in real-time
htop

# Check system load
uptime
```

This monitoring and maintenance guide provides comprehensive coverage of operational procedures for MedCare Pro, ensuring high availability, performance, and security in production environments.

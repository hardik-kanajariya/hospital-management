# Deployment Guide

## Overview

MedCare Pro can be deployed in various environments from development to production. This guide covers deployment strategies for different scenarios including local development, production servers, and cloud platforms.

## Technology Stack Deployment

### Frontend (React + Vite)
- **Development**: Vite dev server (port 5173)
- **Production**: Static files served by web server
- **Build**: `npm run build` generates optimized static files

### Backend (AdonisJS)
- **Development**: Node.js dev server (port 3333)
- **Production**: Node.js production server with PM2
- **Database**: MySQL with connection pooling

## Local Development Setup

### Prerequisites

- **Node.js**: 18.0+ (recommended: 20.x)
- **npm**: 9.0+
- **MySQL**: 8.0+
- **Git**: Latest version

### Environment Setup

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/hospital-management.git
cd hospital-management
```

2. **Install dependencies**:
```bash
# Install root dependencies (frontend)
npm install

# Install server dependencies
npm run server:install
```

3. **Environment configuration**:
```bash
# Copy environment file
cp .env.example .env

# Configure database settings in .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=medcare_db

# Configure app settings
APP_KEY=your-32-character-secret-key
APP_URL=http://localhost:3333
NODE_ENV=development
```

4. **Database setup**:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE medcare_db;"

# Run migrations
cd server
npm run migration:run

# Seed database (optional)
npm run seed
```

5. **Start development servers**:
```bash
# Start both frontend and backend
npm run start

# Or start separately
npm run dev        # Frontend (http://localhost:5173)
npm run server:dev # Backend (http://localhost:3333)
```

## Production Deployment

### Option 1: Traditional VPS/Server Deployment

#### Server Requirements

**Minimum Requirements:**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+

**Recommended for Production:**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS

#### Server Setup

1. **Install Node.js**:
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

2. **Install MySQL**:
```bash
sudo apt update
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
CREATE DATABASE medcare_prod;
CREATE USER 'medcare_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON medcare_prod.* TO 'medcare_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. **Install PM2** (Process Manager):
```bash
sudo npm install -g pm2
```

4. **Install Nginx**:
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Application Deployment

1. **Clone and setup**:
```bash
# Clone to production directory
cd /var/www
sudo git clone https://github.com/yourusername/hospital-management.git medcare
cd medcare
sudo chown -R $USER:$USER /var/www/medcare

# Install dependencies
npm install --production
cd server
npm install --production
```

2. **Environment configuration**:
```bash
# Create production environment file
cp .env.example .env

# Configure production settings
nano .env
```

Production `.env` configuration:
```bash
NODE_ENV=production
APP_URL=https://yourdomain.com
APP_KEY=your-secure-32-character-key

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=medcare_user
DB_PASSWORD=secure_password
DB_DATABASE=medcare_prod

# Security
HASH_DRIVER=scrypt
SESSION_DRIVER=cookie

# Mail (optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# File uploads
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
```

3. **Build frontend**:
```bash
npm run build
```

4. **Database setup**:
```bash
cd server
node ace migration:run --force
node ace db:seed # Optional: only if you want demo data
```

5. **Start application with PM2**:
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
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
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Create logs directory
mkdir logs

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

6. **Configure Nginx**:
```bash
sudo nano /etc/nginx/sites-available/medcare
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files
    location / {
        root /var/www/medcare/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # File uploads
    location /uploads {
        alias /var/www/medcare/server/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Security settings
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/medcare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate Setup

1. **Install Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain SSL certificate**:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Auto-renewal**:
```bash
sudo crontab -e
# Add line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Docker Deployment

#### Docker Setup

1. **Create Dockerfile for frontend**:
```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Create Dockerfile for backend**:
```dockerfile
# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3333

# Start application
CMD ["node", "bin/server.js"]
```

3. **Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    command: --default-authentication-plugin=mysql_native_password

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
      APP_KEY: ${APP_KEY}
      APP_URL: ${APP_URL}
    depends_on:
      - mysql
    volumes:
      - ./server/uploads:/app/uploads
    ports:
      - "3333:3333"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

4. **Environment file for Docker**:
```bash
# .env
DB_ROOT_PASSWORD=secure_root_password
DB_DATABASE=medcare_prod
DB_USER=medcare_user
DB_PASSWORD=secure_password
APP_KEY=your-secure-32-character-key
APP_URL=https://yourdomain.com
```

5. **Deploy with Docker Compose**:
```bash
docker-compose up -d
```

### Option 3: Cloud Platform Deployment

#### AWS Deployment

**Using AWS Elastic Beanstalk:**

1. **Install EB CLI**:
```bash
pip install awsebcli
```

2. **Initialize EB application**:
```bash
eb init medcare-hospital
eb create production
```

3. **Configure environment variables** in AWS Console
4. **Deploy**:
```bash
eb deploy
```

#### DigitalOcean App Platform

1. **Create app.yaml**:
```yaml
name: medcare-hospital
services:
- name: backend
  source_dir: server
  github:
    repo: yourusername/hospital-management
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DB_HOST
    value: ${DATABASE_HOST}
  - key: DB_PASSWORD
    value: ${DATABASE_PASSWORD}

- name: frontend
  source_dir: /
  github:
    repo: yourusername/hospital-management
    branch: main
  build_command: npm run build
  run_command: serve -s dist
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- engine: MYSQL
  name: medcare-db
  version: "8"
```

## Database Management

### Backup Strategy

1. **Automated daily backups**:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/medcare"
DB_NAME="medcare_prod"

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -type f -mtime +30 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

2. **Add to crontab**:
```bash
sudo crontab -e
# Add line for daily backup at 2 AM
0 2 * * * /var/www/medcare/scripts/backup.sh
```

### Database Migrations

```bash
# Run migrations in production
cd server
node ace migration:run --force

# Rollback if needed
node ace migration:rollback --batch=1

# Check migration status
node ace migration:status
```

## Monitoring and Logging

### Application Monitoring

1. **PM2 monitoring**:
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs medcare-api

# Restart application
pm2 restart medcare-api
```

2. **System monitoring with htop**:
```bash
sudo apt install htop
htop
```

### Log Management

1. **Configure log rotation**:
```bash
sudo nano /etc/logrotate.d/medcare
```

```bash
/var/www/medcare/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload medcare-api
    endscript
}
```

## Security Hardening

### Server Security

1. **Firewall configuration**:
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

2. **Fail2ban for SSH protection**:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. **Regular updates**:
```bash
# Add to crontab for automatic security updates
sudo crontab -e
# Add line:
0 6 * * * apt update && apt upgrade -y
```

### Application Security

1. **Environment variable security**:
```bash
# Secure .env file
chmod 600 .env
chown $USER:$USER .env
```

2. **Database security**:
```bash
# Remove test databases and users
mysql_secure_installation

# Create limited user for application
mysql -u root -p
CREATE USER 'medcare_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON medcare_prod.* TO 'medcare_app'@'localhost';
FLUSH PRIVILEGES;
```

## Performance Optimization

### Frontend Optimization

1. **Build optimization**:
```bash
# Production build with optimization
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js
```

2. **CDN setup** (optional):
- Upload static assets to CDN
- Update asset URLs in build

### Backend Optimization

1. **Database optimization**:
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_patients_organization_created ON patients(organization_id, created_at);
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX idx_medical_records_patient_date ON medical_records(patient_id, visit_date);
```

2. **Caching** (optional - Redis):
```bash
# Install Redis
sudo apt install redis-server

# Configure in .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Troubleshooting

### Common Issues

1. **Database connection errors**:
```bash
# Check MySQL service
sudo systemctl status mysql

# Check connection
mysql -u medcare_user -p medcare_prod
```

2. **Application not starting**:
```bash
# Check PM2 logs
pm2 logs medcare-api

# Check system resources
free -h
df -h
```

3. **Nginx issues**:
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Performance Issues

1. **High memory usage**:
```bash
# Monitor memory usage
htop

# Restart PM2 if needed
pm2 restart medcare-api
```

2. **Slow database queries**:
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow queries
SHOW PROCESSLIST;
```

## Scaling Considerations

### Horizontal Scaling

1. **Load balancer setup**:
- Multiple application servers
- Database replication
- Session store (Redis)
- File storage (S3/MinIO)

2. **Microservices architecture**:
- Separate services for different modules
- API gateway
- Message queues

### Vertical Scaling

1. **Resource monitoring**:
- CPU usage
- Memory consumption
- Database performance
- Network I/O

2. **Optimization strategies**:
- Database indexing
- Query optimization
- Caching layers
- CDN implementation

This deployment guide provides comprehensive coverage for deploying MedCare Pro in various environments, from simple development setups to production-ready systems with proper security, monitoring, and scaling considerations.

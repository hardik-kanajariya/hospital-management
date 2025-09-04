# Scalability and Performance Guide

## Overview

This guide covers strategies for scaling MedCare Pro to handle increased user load, data volume, and organizational growth. It includes horizontal and vertical scaling approaches, performance optimization techniques, and infrastructure considerations.

## Scaling Architecture

### 1. Horizontal Scaling Strategy

#### Load Balancer Configuration

**Nginx Load Balancer Setup:**

```nginx
# /etc/nginx/sites-available/medcare-lb
upstream medcare_backend {
    least_conn;
    
    # Application servers
    server 10.0.1.10:3333 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3333 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3333 weight=2 max_fails=3 fail_timeout=30s;
    
    # Health check
    keepalive 32;
}

upstream medcare_websocket {
    ip_hash; # Sticky sessions for WebSocket connections
    
    server 10.0.1.10:3334;
    server 10.0.1.11:3334;
    server 10.0.1.12:3334;
}

server {
    listen 443 ssl http2;
    server_name api.medcare.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/medcare.crt;
    ssl_certificate_key /etc/ssl/private/medcare.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Load balancer settings
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # WebSocket connections
    location /socket.io/ {
        proxy_pass http://medcare_websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://medcare_backend;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # Rate limiting
        limit_req zone=api burst=100 nodelay;
    }
    
    # Static files (if served by nginx)
    location /static/ {
        root /var/www/medcare/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
}
```

#### Docker Swarm Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  medcare-api:
    image: medcare/api:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          cpus: '1.5'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    environment:
      - NODE_ENV=production
      - PORT=3333
      - DB_HOST=medcare-db
      - REDIS_HOST=medcare-redis
    networks:
      - medcare-network
    volumes:
      - medcare-logs:/app/logs
    secrets:
      - db_password
      - jwt_secret

  medcare-db:
    image: mysql:8.0
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/db_root_password
      - MYSQL_DATABASE=medcare_prod
      - MYSQL_USER=medcare_user
      - MYSQL_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - medcare-db-data:/var/lib/mysql
      - ./config/mysql.cnf:/etc/mysql/conf.d/medcare.cnf
    networks:
      - medcare-network
    secrets:
      - db_root_password
      - db_password

  medcare-redis:
    image: redis:7-alpine
    deploy:
      replicas: 1
    command: redis-server --appendonly yes --requirepass $REDIS_PASSWORD
    volumes:
      - medcare-redis-data:/data
    networks:
      - medcare-network

  medcare-lb:
    image: nginx:alpine
    deploy:
      replicas: 2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    networks:
      - medcare-network
    depends_on:
      - medcare-api

networks:
  medcare-network:
    driver: overlay
    attachable: true

volumes:
  medcare-db-data:
  medcare-redis-data:
  medcare-logs:

secrets:
  db_root_password:
    external: true
  db_password:
    external: true
  jwt_secret:
    external: true
```

### 2. Database Scaling

#### Read Replicas Setup

```sql
-- Master configuration (my.cnf)
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON

-- Slave configuration (my.cnf)
[mysqld]
server-id = 2
relay-log = relay-bin
read-only = 1
gtid-mode = ON
enforce-gtid-consistency = ON
```

**Application Code for Read/Write Splitting:**

```typescript
// database/connections.ts
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  connection: Env.get('DB_CONNECTION'),
  
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: Env.get('DB_HOST'),
        port: Env.get('DB_PORT'),
        user: Env.get('DB_USER'),
        password: Env.get('DB_PASSWORD'),
        database: Env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: false,
    },
    
    // Read replica configuration
    mysql_read: {
      client: 'mysql2',
      connection: {
        host: Env.get('DB_READ_HOST', Env.get('DB_HOST')),
        port: Env.get('DB_READ_PORT', Env.get('DB_PORT')),
        user: Env.get('DB_READ_USER', Env.get('DB_USER')),
        password: Env.get('DB_READ_PASSWORD', Env.get('DB_PASSWORD')),
        database: Env.get('DB_READ_DATABASE', Env.get('DB_DATABASE')),
      },
      healthCheck: false,
      debug: false,
    }
  }
}

export default databaseConfig

// models/BaseModel.ts
import { BaseModel as LucidBaseModel } from '@ioc:Adonis/Lucid/Orm'
import Database from '@ioc:Adonis/Lucid/Database'

export default class BaseModel extends LucidBaseModel {
  // Use read replica for queries
  public static query(options: { useReadReplica?: boolean } = {}) {
    if (options.useReadReplica && process.env.NODE_ENV === 'production') {
      return Database.connection('mysql_read').from(this.table)
    }
    return super.query()
  }
  
  // Force write operations to master
  public static create(values: any) {
    return Database.connection('mysql').table(this.table).insert(values)
  }
  
  public static async findForRead(id: string) {
    return this.query({ useReadReplica: true }).where('id', id).first()
  }
}

// Usage in controllers
export default class PatientsController {
  public async index({ request }: HttpContext) {
    // Use read replica for listing
    const patients = await Patient.query({ useReadReplica: true })
      .where('organization_id', request.organizationId())
      .paginate(request.input('page', 1), 20)
    
    return patients
  }
  
  public async store({ request }: HttpContext) {
    // Write operations go to master
    const patient = await Patient.create(request.validated())
    return patient
  }
}
```

#### Database Sharding Strategy

```typescript
// database/ShardManager.ts
export class ShardManager {
  private static shards = {
    shard1: 'mysql_shard1',
    shard2: 'mysql_shard2',
    shard3: 'mysql_shard3'
  }
  
  // Shard by organization ID
  public static getShardForOrganization(organizationId: string): string {
    const hash = this.hashCode(organizationId)
    const shardIndex = Math.abs(hash) % Object.keys(this.shards).length
    return Object.values(this.shards)[shardIndex]
  }
  
  private static hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }
  
  // Get database connection for organization
  public static getConnectionForOrganization(organizationId: string) {
    const shard = this.getShardForOrganization(organizationId)
    return Database.connection(shard)
  }
}

// models/Patient.ts
export default class Patient extends BaseModel {
  public static async findByOrganization(organizationId: string, patientId: string) {
    const connection = ShardManager.getConnectionForOrganization(organizationId)
    return connection.from('patients')
      .where('organization_id', organizationId)
      .where('id', patientId)
      .first()
  }
}
```

### 3. Caching Strategy

#### Redis Cluster Setup

```yaml
# docker-compose.redis-cluster.yml
version: '3.8'

services:
  redis-node-1:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --port 7001
    ports:
      - "7001:7001"
    volumes:
      - redis-node-1:/data

  redis-node-2:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --port 7002
    ports:
      - "7002:7002"
    volumes:
      - redis-node-2:/data

  redis-node-3:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --port 7003
    ports:
      - "7003:7003"
    volumes:
      - redis-node-3:/data

volumes:
  redis-node-1:
  redis-node-2:
  redis-node-3:
```

#### Application-Level Caching

```typescript
// services/CacheService.ts
import Redis from '@ioc:Adonis/Addons/Redis'

export default class CacheService {
  // Multi-level caching strategy
  private static memoryCache = new Map<string, { data: any; expires: number }>()
  
  public static async get<T>(key: string): Promise<T | null> {
    // Level 1: Memory cache (fastest)
    const memoryItem = this.memoryCache.get(key)
    if (memoryItem && memoryItem.expires > Date.now()) {
      return memoryItem.data as T
    }
    
    // Level 2: Redis cache
    const redisData = await Redis.get(key)
    if (redisData) {
      const parsed = JSON.parse(redisData) as T
      
      // Store in memory cache for 1 minute
      this.memoryCache.set(key, {
        data: parsed,
        expires: Date.now() + 60000
      })
      
      return parsed
    }
    
    return null
  }
  
  public static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    // Store in Redis
    await Redis.setex(key, ttlSeconds, JSON.stringify(value))
    
    // Store in memory cache
    this.memoryCache.set(key, {
      data: value,
      expires: Date.now() + Math.min(ttlSeconds * 1000, 300000) // Max 5 minutes in memory
    })
  }
  
  public static async invalidate(pattern: string): Promise<void> {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    }
    
    // Clear Redis cache
    const keys = await Redis.keys(`*${pattern}*`)
    if (keys.length > 0) {
      await Redis.del(...keys)
    }
  }
  
  // Cache warming for frequently accessed data
  public static async warmCache(organizationId: string): Promise<void> {
    const cacheKeys = [
      `org:${organizationId}:users`,
      `org:${organizationId}:roles`,
      `org:${organizationId}:settings`,
      `org:${organizationId}:master-data`
    ]
    
    for (const key of cacheKeys) {
      const exists = await Redis.exists(key)
      if (!exists) {
        // Load and cache the data
        const data = await this.loadDataForCache(key, organizationId)
        if (data) {
          await this.set(key, data, 7200) // 2 hours
        }
      }
    }
  }
  
  private static async loadDataForCache(key: string, organizationId: string): Promise<any> {
    if (key.includes(':users')) {
      return await User.query().where('organization_id', organizationId).select(['id', 'name', 'email', 'role'])
    } else if (key.includes(':roles')) {
      return await Role.query().where('organization_id', organizationId)
    } else if (key.includes(':settings')) {
      return await OrganizationSetting.query().where('organization_id', organizationId)
    }
    return null
  }
}

// Caching middleware
export function cacheMiddleware(ttl: number = 300) {
  return async (ctx: HttpContext, next: () => Promise<void>) => {
    const cacheKey = `api:${ctx.request.method()}:${ctx.request.url()}:${ctx.auth.user?.organization_id}`
    
    // Try to get from cache
    const cached = await CacheService.get(cacheKey)
    if (cached) {
      return ctx.response.json(cached)
    }
    
    // Store original response method
    const originalJson = ctx.response.json
    let responseData: any
    
    // Override response method to capture data
    ctx.response.json = function(data: any) {
      responseData = data
      return originalJson.call(this, data)
    }
    
    await next()
    
    // Cache the response if successful
    if (ctx.response.getStatus() === 200 && responseData) {
      await CacheService.set(cacheKey, responseData, ttl)
    }
  }
}
```

### 4. CDN and Static Asset Optimization

#### CDN Configuration

```typescript
// config/cdn.ts
export default {
  enabled: Env.get('CDN_ENABLED', false),
  
  providers: {
    cloudflare: {
      zoneId: Env.get('CLOUDFLARE_ZONE_ID'),
      apiKey: Env.get('CLOUDFLARE_API_KEY'),
      email: Env.get('CLOUDFLARE_EMAIL'),
      baseUrl: Env.get('CDN_BASE_URL', 'https://cdn.medcare.com')
    },
    
    aws: {
      accessKeyId: Env.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: Env.get('AWS_SECRET_ACCESS_KEY'),
      region: Env.get('AWS_REGION', 'us-east-1'),
      bucket: Env.get('S3_BUCKET'),
      cloudFrontDistributionId: Env.get('CLOUDFRONT_DISTRIBUTION_ID')
    }
  }
}

// services/AssetService.ts
export default class AssetService {
  public static getAssetUrl(path: string): string {
    if (Env.get('CDN_ENABLED')) {
      return `${Env.get('CDN_BASE_URL')}/${path.replace(/^\//, '')}`
    }
    return path
  }
  
  // Image optimization
  public static getOptimizedImageUrl(
    path: string, 
    options: { width?: number; height?: number; quality?: number } = {}
  ): string {
    if (!Env.get('CDN_ENABLED')) {
      return path
    }
    
    const params = new URLSearchParams()
    if (options.width) params.append('w', options.width.toString())
    if (options.height) params.append('h', options.height.toString())
    if (options.quality) params.append('q', options.quality.toString())
    
    const baseUrl = this.getAssetUrl(path)
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
  }
}
```

## Performance Optimization

### 1. Database Query Optimization

#### Query Performance Monitoring

```typescript
// middleware/QueryProfiler.ts
export default class QueryProfiler {
  public static enable() {
    Database.on('query', (query) => {
      const start = Date.now()
      
      query.on('query-response', () => {
        const duration = Date.now() - start
        
        if (duration > 1000) { // Log slow queries
          console.warn('Slow query detected:', {
            sql: query.sql,
            bindings: query.bindings,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
          })
        }
        
        // Store query metrics
        this.storeQueryMetrics(query.sql, duration)
      })
    })
  }
  
  private static async storeQueryMetrics(sql: string, duration: number) {
    const queryHash = this.hashQuery(sql)
    await Redis.zadd('query_performance', duration, queryHash)
    await Redis.expire('query_performance', 3600) // 1 hour retention
  }
  
  private static hashQuery(sql: string): string {
    // Normalize query by removing values
    const normalized = sql.replace(/\$\d+/g, '?').replace(/\d+/g, 'N')
    return crypto.createHash('md5').update(normalized).digest('hex')
  }
  
  public static async getSlowQueries(limit: number = 10) {
    return Redis.zrevrange('query_performance', 0, limit - 1, 'WITHSCORES')
  }
}
```

#### Optimized Query Patterns

```typescript
// models/Patient.ts
export default class Patient extends BaseModel {
  // Efficient pagination with cursor-based approach
  public static async paginateWithCursor(
    organizationId: string,
    cursor?: string,
    limit: number = 20
  ) {
    const query = this.query()
      .where('organization_id', organizationId)
      .orderBy('created_at', 'desc')
      .limit(limit + 1) // Get one extra to check if there's a next page
    
    if (cursor) {
      query.where('created_at', '<', cursor)
    }
    
    const results = await query
    const hasNextPage = results.length > limit
    const items = hasNextPage ? results.slice(0, -1) : results
    
    return {
      items,
      hasNextPage,
      nextCursor: hasNextPage ? items[items.length - 1].created_at : null
    }
  }
  
  // Optimized search with full-text index
  public static async search(organizationId: string, query: string, filters: any = {}) {
    const searchQuery = this.query()
      .where('organization_id', organizationId)
      .whereRaw('MATCH(first_name, last_name, email, phone) AGAINST(? IN BOOLEAN MODE)', [`*${query}*`])
    
    // Apply filters efficiently
    if (filters.age_range) {
      searchQuery.whereBetween('age', [filters.age_range.min, filters.age_range.max])
    }
    
    if (filters.gender) {
      searchQuery.where('gender', filters.gender)
    }
    
    return searchQuery.paginate(filters.page || 1, 20)
  }
  
  // Bulk operations for better performance
  public static async bulkInsert(patients: any[]) {
    const chunks = this.chunk(patients, 1000) // Process in chunks of 1000
    
    for (const chunk of chunks) {
      await this.createMany(chunk)
    }
  }
  
  private static chunk(array: any[], size: number): any[][] {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}
```

### 2. Application Performance

#### Request Optimization

```typescript
// middleware/ResponseCompression.ts
import zlib from 'zlib'

export default class ResponseCompression {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    await next()
    
    const acceptEncoding = ctx.request.header('accept-encoding') || ''
    
    if (acceptEncoding.includes('gzip') && ctx.response.getBody()) {
      const body = JSON.stringify(ctx.response.getBody())
      
      if (body.length > 1024) { // Only compress responses > 1KB
        const compressed = zlib.gzipSync(body)
        
        ctx.response.header('Content-Encoding', 'gzip')
        ctx.response.header('Content-Length', compressed.length.toString())
        ctx.response.stream(compressed)
      }
    }
  }
}

// services/BatchProcessor.ts
export default class BatchProcessor {
  private static queues = new Map<string, any[]>()
  private static timers = new Map<string, NodeJS.Timeout>()
  
  // Batch similar operations
  public static async addToBatch(
    batchKey: string,
    operation: any,
    maxSize: number = 100,
    maxWait: number = 1000
  ) {
    if (!this.queues.has(batchKey)) {
      this.queues.set(batchKey, [])
    }
    
    const queue = this.queues.get(batchKey)!
    queue.push(operation)
    
    // Process immediately if batch is full
    if (queue.length >= maxSize) {
      await this.processBatch(batchKey)
      return
    }
    
    // Set timer for batch processing
    if (!this.timers.has(batchKey)) {
      const timer = setTimeout(() => {
        this.processBatch(batchKey)
      }, maxWait)
      
      this.timers.set(batchKey, timer)
    }
  }
  
  private static async processBatch(batchKey: string) {
    const queue = this.queues.get(batchKey)
    if (!queue || queue.length === 0) return
    
    const operations = queue.splice(0) // Empty the queue
    
    // Clear timer
    const timer = this.timers.get(batchKey)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(batchKey)
    }
    
    try {
      await this.executeBatch(batchKey, operations)
    } catch (error) {
      console.error(`Batch processing failed for ${batchKey}:`, error)
      // Optionally retry or handle failed operations
    }
  }
  
  private static async executeBatch(batchKey: string, operations: any[]) {
    switch (batchKey) {
      case 'notifications':
        await this.processNotificationBatch(operations)
        break
      case 'audit_logs':
        await this.processAuditLogBatch(operations)
        break
      case 'analytics':
        await this.processAnalyticsBatch(operations)
        break
    }
  }
  
  private static async processNotificationBatch(notifications: any[]) {
    // Group by type and send in bulk
    const grouped = notifications.reduce((acc, notification) => {
      const key = `${notification.type}_${notification.channel}`
      if (!acc[key]) acc[key] = []
      acc[key].push(notification)
      return acc
    }, {})
    
    for (const [key, batch] of Object.entries(grouped)) {
      await NotificationService.sendBulk(batch as any[])
    }
  }
}
```

### 3. Frontend Performance

#### Code Splitting and Lazy Loading

```typescript
// router/routes.tsx
import { lazy, Suspense } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Lazy load major modules
const PatientManagement = lazy(() => import('@/components/hospital/PatientManagement'))
const AppointmentScheduler = lazy(() => import('@/components/hospital/AppointmentScheduler'))
const MedicalRecords = lazy(() => import('@/components/hospital/MedicalRecords'))
const BillingModule = lazy(() => import('@/components/hospital/BillingModule'))

// Route-based code splitting
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/patients/*" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PatientManagement />
        </Suspense>
      } />
      
      <Route path="/appointments/*" element={
        <Suspense fallback={<LoadingSpinner />}>
          <AppointmentScheduler />
        </Suspense>
      } />
      
      <Route path="/records/*" element={
        <Suspense fallback={<LoadingSpinner />}>
          <MedicalRecords />
        </Suspense>
      } />
      
      <Route path="/billing/*" element={
        <Suspense fallback={<LoadingSpinner />}>
          <BillingModule />
        </Suspense>
      } />
    </Routes>
  )
}

// Component-level optimization
export const OptimizedPatientList = memo(() => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Virtual scrolling for large lists
  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10
  })
  
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      searchPatients(query)
    }, 300),
    []
  )
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      {virtualizer.getVirtualItems().map((virtualRow) => (
        <div
          key={virtualRow.key}
          style={{
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`
          }}
        >
          <PatientCard patient={patients[virtualRow.index]} />
        </div>
      ))}
    </div>
  )
})
```

#### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts', 'd3'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          api: ['@tanstack/react-query', 'axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', '@radix-ui/react-dialog']
  }
})
```

## Infrastructure Scaling

### 1. Auto-scaling Configuration

#### AWS Auto Scaling

```yaml
# aws-autoscaling.yml
AWSTemplateFormatVersion: '2010-09-09'

Resources:
  MedCareAutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      VPCZoneIdentifier:
        - subnet-12345
        - subnet-67890
      LaunchTemplate:
        LaunchTemplateId: !Ref MedCareLaunchTemplate
        Version: !GetAtt MedCareLaunchTemplate.LatestVersionNumber
      MinSize: 2
      MaxSize: 10
      DesiredCapacity: 3
      TargetGroupARNs:
        - !Ref MedCareTargetGroup
      HealthCheckType: ELB
      HealthCheckGracePeriod: 300
      
  MedCareLaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    Properties:
      LaunchTemplateData:
        ImageId: ami-12345678  # Ubuntu 22.04 LTS
        InstanceType: t3.medium
        SecurityGroupIds:
          - !Ref MedCareSecurityGroup
        UserData:
          Fn::Base64: !Sub |
            #!/bin/bash
            apt-get update
            apt-get install -y docker.io docker-compose
            systemctl start docker
            systemctl enable docker
            
            # Deploy application
            cd /opt/medcare
            docker-compose up -d
            
            # Install CloudWatch agent
            wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
            dpkg -i amazon-cloudwatch-agent.deb
            
  CPUScaleUpPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AdjustmentType: ChangeInCapacity
      AutoScalingGroupName: !Ref MedCareAutoScalingGroup
      Cooldown: 300
      ScalingAdjustment: 1
      
  CPUScaleDownPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AdjustmentType: ChangeInCapacity
      AutoScalingGroupName: !Ref MedCareAutoScalingGroup
      Cooldown: 300
      ScalingAdjustment: -1
      
  CPUAlarmHigh:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmDescription: Scale up on high CPU
      MetricName: CPUUtilization
      Namespace: AWS/EC2
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 70
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: AutoScalingGroupName
          Value: !Ref MedCareAutoScalingGroup
      AlarmActions:
        - !Ref CPUScaleUpPolicy
        
  CPUAlarmLow:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmDescription: Scale down on low CPU
      MetricName: CPUUtilization
      Namespace: AWS/EC2
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 25
      ComparisonOperator: LessThanThreshold
      Dimensions:
        - Name: AutoScalingGroupName
          Value: !Ref MedCareAutoScalingGroup
      AlarmActions:
        - !Ref CPUScaleDownPolicy
```

### 2. Kubernetes Deployment

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medcare-api
  labels:
    app: medcare-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: medcare-api
  template:
    metadata:
      labels:
        app: medcare-api
    spec:
      containers:
      - name: medcare-api
        image: medcare/api:latest
        ports:
        - containerPort: 3333
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: medcare-secrets
              key: db-host
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3333
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3333
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: medcare-api-service
spec:
  selector:
    app: medcare-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3333
  type: LoadBalancer

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: medcare-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: medcare-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

This comprehensive scalability and performance guide ensures MedCare Pro can handle enterprise-level loads while maintaining optimal performance and user experience.

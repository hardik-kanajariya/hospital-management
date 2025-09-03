---
sidebar_position: 2
---

# Docker Deployment

Deploy MedCare Pro Hospital Management System using Docker containers for easy scalability, portability, and consistent environments across development, staging, and production.

## 🐳 Docker Overview

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Nginx Proxy   │────│  React Frontend │    │  Node.js API    │
│   (Port 80/443) │    │   (Port 3000)   │────│   (Port 3333)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────┬───────┘
                                                        │
        ┌─────────────────┐    ┌─────────────────┐      │
        │                 │    │                 │      │
        │  MySQL Database │────│  Redis Cache    │──────┘
        │   (Port 3306)   │    │   (Port 6379)   │
        │                 │    │                 │
        └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Docker Setup

### Prerequisites
- Docker 20.0+ installed
- Docker Compose 2.0+ installed
- 4GB+ RAM available
- 10GB+ disk space

### One-Command Deployment
```bash
# Clone and deploy
git clone https://github.com/medcarepro/hospital-management.git
cd hospital-management
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Project Structure
```
hospital-management/
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── Dockerfile.frontend         # Frontend container build
├── server/
│   └── Dockerfile              # Backend container build
├── nginx/
│   ├── nginx.conf              # Nginx configuration
│   └── ssl/                    # SSL certificates
├── mysql/
│   ├── init/                   # Database initialization
│   └── config/                 # MySQL configuration
└── docker/
    ├── scripts/                # Helper scripts
    └── env/                    # Environment templates
```

## 🔧 Configuration Files

### Frontend Dockerfile
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:1.21-alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Create nginx user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx nginx

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

USER nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile
```dockerfile
# server/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodejs nodejs

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "build/bin/server.js"]
```

### Health Check Script
```javascript
// server/healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3333,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR', err);
  process.exit(1);
});

request.end();
```

## 🐛 Development Environment

### docker-compose.yml
```yaml
version: '3.8'

services:
  # Frontend Development Server
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      target: builder
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:3333
    command: npm run dev
    depends_on:
      - backend

  # Backend Development Server
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3333:3333"
    volumes:
      - ./server:/app
      - /app/node_modules
      - ./uploads:/app/uploads
    environment:
      NODE_ENV: development
      DB_HOST: database
      DB_PORT: 3306
      DB_USER: medcare_user
      DB_PASSWORD: medcare_dev_password
      DB_DATABASE: medcare_pro_dev
      REDIS_HOST: redis
      REDIS_PORT: 6379
    command: npm run dev
    depends_on:
      - database
      - redis

  # MySQL Database
  database:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: medcare_pro_dev
      MYSQL_USER: medcare_user
      MYSQL_PASSWORD: medcare_dev_password
    volumes:
      - mysql_dev_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
      - ./mysql/config/my.cnf:/etc/mysql/conf.d/my.cnf
    command: --default-authentication-plugin=mysql_native_password

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    command: redis-server --appendonly yes

  # Adminer (Database Management)
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - database

volumes:
  mysql_dev_data:
  redis_dev_data:
```

## 🏭 Production Environment

### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/ssl/certs:ro
      - nginx_cache:/var/cache/nginx
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API Server
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      PORT: 3333
      DB_HOST: database
      DB_PORT: 3306
      DB_USER: medcare_user
      DB_PASSWORD_FILE: /run/secrets/db_password
      DB_DATABASE: medcare_pro
      REDIS_HOST: redis
      REDIS_PORT: 6379
      APP_KEY_FILE: /run/secrets/app_key
    secrets:
      - db_password
      - app_key
    volumes:
      - uploads:/app/uploads
      - logs:/app/logs
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # MySQL Database
  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/mysql_root_password
      MYSQL_DATABASE: medcare_pro
      MYSQL_USER: medcare_user
      MYSQL_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - mysql_root_password
      - db_password
    volumes:
      - mysql_prod_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d:ro
      - ./mysql/config/prod.cnf:/etc/mysql/conf.d/my.cnf:ro
      - ./backups:/backups
    command: --default-authentication-plugin=mysql_native_password
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_prod_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Database Backup Service
  backup:
    image: mysql:8.0
    environment:
      MYSQL_HOST: database
      MYSQL_USER: medcare_user
      MYSQL_PASSWORD_FILE: /run/secrets/db_password
      MYSQL_DATABASE: medcare_pro
    secrets:
      - db_password
    volumes:
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh:ro
    command: /bin/bash -c "chmod +x /backup.sh && /backup.sh"
    depends_on:
      - database
    restart: unless-stopped

secrets:
  db_password:
    file: ./secrets/db_password.txt
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
  app_key:
    file: ./secrets/app_key.txt

volumes:
  mysql_prod_data:
    driver: local
  redis_prod_data:
    driver: local
  uploads:
    driver: local
  logs:
    driver: local
  nginx_cache:
    driver: local

networks:
  default:
    name: medcare_network
```

## 🔐 Security Configuration

### Secrets Management
```bash
# Create secrets directory
mkdir -p secrets

# Generate strong passwords
openssl rand -base64 32 > secrets/db_password.txt
openssl rand -base64 32 > secrets/mysql_root_password.txt
openssl rand -base64 32 > secrets/app_key.txt

# Set proper permissions
chmod 600 secrets/*.txt
```

### Nginx Production Configuration
```nginx
# nginx/nginx.prod.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend
    server {
        listen 80;
        listen 443 ssl http2;
        server_name _;
        
        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;
        
        root /usr/share/nginx/html;
        index index.html;
        
        # Frontend routes
        location / {
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
        
        # API routes
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend:3333;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Login endpoint with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend:3333;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 🚀 Deployment Commands

### Development Deployment
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild containers
docker-compose up -d --build

# Stop all services
docker-compose down
```

### Production Deployment
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Scale backend service
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Rolling update
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# View production logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

## 📊 Monitoring and Maintenance

### Container Health Monitoring
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Monitor resource usage
docker stats

# View container logs
docker-compose -f docker-compose.prod.yml logs backend

# Execute commands in containers
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate
```

### Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_HOST=${MYSQL_HOST:-database}
MYSQL_USER=${MYSQL_USER:-medcare_user}
MYSQL_DATABASE=${MYSQL_DATABASE:-medcare_pro}

# Wait for database
until mysqladmin ping -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$(cat /run/secrets/db_password)" --silent; do
    echo "Waiting for database..."
    sleep 5
done

# Create backup
mysqldump -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$(cat /run/secrets/db_password)" "$MYSQL_DATABASE" | gzip > "$BACKUP_DIR/backup_${DATE}.sql.gz"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_${DATE}.sql.gz"
```

## 🔧 Troubleshooting

### Common Issues

**Container won't start**
```bash
# Check container logs
docker-compose logs [service_name]

# Check container status
docker-compose ps

# Inspect container
docker inspect [container_id]
```

**Database connection issues**
```bash
# Test database connectivity
docker-compose exec backend npm run db:check

# Access database directly
docker-compose exec database mysql -u medcare_user -p medcare_pro
```

**Performance issues**
```bash
# Monitor resource usage
docker stats

# Check container resource limits
docker-compose -f docker-compose.prod.yml config
```

### Maintenance Commands
```bash
# Update images
docker-compose pull
docker-compose -f docker-compose.prod.yml up -d

# Clean unused resources
docker system prune -f

# Clean unused volumes (be careful!)
docker volume prune -f

# Backup volumes
docker run --rm -v mysql_prod_data:/data -v $(pwd):/backup ubuntu tar czf /backup/mysql_backup.tar.gz /data
```

## 📈 Scaling and Performance

### Horizontal Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=5

# Load balancer configuration needed for multiple backends
```

### Performance Optimization
- Use multi-stage builds to reduce image size
- Implement health checks for all services
- Configure resource limits and reservations
- Use external load balancer for high availability
- Implement container orchestration with Kubernetes for large deployments

---

**Docker deployment questions?** Check our [troubleshooting guide](../troubleshooting) or contact support@medcarepro.com for assistance.

---
sidebar_position: 10
---

# Troubleshooting Guide

Common issues and their solutions when working with MedCare Pro Hospital Management System.

## 🚨 Installation Issues

### Node.js Version Problems

**Issue**: "Node.js version is not supported"
```bash
Error: The engine "node" is incompatible with this module. Expected version ">=18.0.0"
```

**Solution**:
```bash
# Check current Node.js version
node --version

# Install Node.js 18+ using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or download from official website
# https://nodejs.org/en/download/
```

### Database Connection Issues

**Issue**: "Database connection failed"
```bash
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution**:
```bash
# Check if MySQL is running
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Start MySQL service
sudo systemctl start mysql  # Linux
brew services start mysql  # macOS

# Test connection manually
mysql -u your_username -p -h localhost

# Check environment variables
cat server/.env | grep DB_
```

### Permission Errors

**Issue**: "Permission denied" when running commands
```bash
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution**:
```bash
# Fix npm permissions (recommended method)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Or use sudo (not recommended for production)
sudo npm install -g package-name
```

## 🖥️ Development Server Issues

### Port Already in Use

**Issue**: "Port 5173 is already in use"
```bash
Error: Port 5173 is already in use
```

**Solution**:
```bash
# Find process using the port
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill the process
kill -9 PID  # Replace PID with actual process ID

# Or use different port
npm run dev -- --port 3000
```

### Frontend Build Errors

**Issue**: "Build failed with TypeScript errors"
```bash
Error: Type 'string | undefined' is not assignable to type 'string'
```

**Solution**:
```bash
# Clean node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npx tsc --noEmit

# Update dependencies
npm update

# If persistent, check for type definitions
npm install @types/node @types/react @types/react-dom
```

## 🗄️ Database Issues

### Migration Failures

**Issue**: "Migration failed"
```bash
Error: Unknown column 'organization_id' in 'field list'
```

**Solution**:
```bash
# Check migration status
cd server
node ace migration:status

# Rollback problematic migration
node ace migration:rollback --batch=1

# Re-run migrations
node ace migration:run

# Reset database (development only)
node ace migration:reset
node ace migration:run
```

### Seeder Issues

**Issue**: "Seeder data conflicts"
```bash
Error: Duplicate entry 'superadmin@medcarepro.com' for key 'email'
```

**Solution**:
```bash
# Clear existing data
node ace migration:reset

# Or manually clean specific tables
mysql -u username -p database_name
DELETE FROM users WHERE email = 'superadmin@medcarepro.com';

# Run migrations and seeders fresh
node ace migration:run
node ace db:seed
```

### Database Performance

**Issue**: "Slow database queries"

**Solution**:
```sql
-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';

-- Analyze query performance
EXPLAIN SELECT * FROM appointments WHERE patient_id = 'uuid';

-- Add missing indexes
CREATE INDEX idx_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);

-- Optimize tables
OPTIMIZE TABLE appointments;
```

## 🔐 Authentication Issues

### JWT Token Problems

**Issue**: "Invalid or expired token"
```bash
Error: jwt malformed
```

**Solution**:
```bash
# Check APP_KEY in environment
grep APP_KEY server/.env

# Generate new APP_KEY
node ace generate:key

# Clear browser localStorage
localStorage.clear()  # In browser console

# Check token expiration settings
grep JWT server/.env
```

### Session Issues

**Issue**: "User session not persistent"

**Solution**:
```bash
# Check Redis connection
redis-cli ping  # Should return PONG

# Verify session configuration
grep SESSION server/.env

# Clear Redis cache
redis-cli FLUSHALL

# Check cookie settings in browser
# Developer Tools > Application > Cookies
```

## 📡 API Issues

### CORS Errors

**Issue**: "CORS policy blocking requests"
```bash
Access to fetch at 'http://localhost:3333/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**:
```typescript
// server/config/cors.ts
export default {
  enabled: true,
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90
}
```

### API Rate Limiting

**Issue**: "Too many requests"
```bash
Error 429: Too Many Requests
```

**Solution**:
```bash
# Check rate limiting configuration
grep RATE_LIMIT server/.env

# Temporarily disable rate limiting (development)
# Comment out rate limiting middleware

# For production, implement proper caching
# Use Redis for distributed rate limiting
```

## 🎨 Frontend Issues

### Styling Problems

**Issue**: "Tailwind CSS not working"

**Solution**:
```bash
# Check Tailwind configuration
cat tailwind.config.js

# Ensure PostCSS is configured
cat postcss.config.js

# Rebuild with Tailwind
npm run build

# Clear browser cache
Ctrl+Shift+R  # Hard refresh
```

### Component Rendering Issues

**Issue**: "React component not updating"

**Solution**:
```javascript
// Check for key prop in lists
{items.map((item, index) => (
  <div key={item.id}>{item.name}</div>  // Use unique ID, not index
))}

// Verify state updates
const [state, setState] = useState(initialValue)
setState(newValue)  // Make sure newValue is different reference for objects

// Check useEffect dependencies
useEffect(() => {
  // Effect code
}, [dependency1, dependency2])  // Include all dependencies
```

## 📱 Mobile/Responsive Issues

### Mobile Layout Problems

**Issue**: "Layout broken on mobile devices"

**Solution**:
```css
/* Check viewport meta tag */
<meta name="viewport" content="width=device-width, initial-scale=1.0">

/* Use proper responsive breakpoints */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}

/* Test with browser dev tools */
/* F12 > Toggle device toolbar */
```

### Touch Events Not Working

**Issue**: "Touch interactions not responding"

**Solution**:
```javascript
// Add touch event listeners
element.addEventListener('touchstart', handleTouch, { passive: true })
element.addEventListener('touchmove', handleTouch, { passive: true })
element.addEventListener('touchend', handleTouch, { passive: true })

// Use CSS touch-action property
.touch-element {
  touch-action: manipulation;
}
```

## 🔧 Performance Issues

### Slow Page Loading

**Issue**: "Pages loading slowly"

**Solution**:
```bash
# Analyze bundle size
npm run build -- --analyze

# Implement code splitting
const LazyComponent = React.lazy(() => import('./Component'))

# Optimize images
# Use WebP format
# Implement lazy loading

# Enable compression
# Configure gzip in server
```

### Memory Leaks

**Issue**: "Application consuming too much memory"

**Solution**:
```javascript
// Clean up event listeners
useEffect(() => {
  const handler = () => {}
  window.addEventListener('resize', handler)
  
  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])

// Cancel API requests
useEffect(() => {
  const controller = new AbortController()
  
  fetch('/api/data', { signal: controller.signal })
  
  return () => {
    controller.abort()
  }
}, [])
```

## 🐛 Common Error Messages

### "Cannot read property of undefined"

```javascript
// Use optional chaining
const name = user?.profile?.name ?? 'Unknown'

// Add proper null checks
if (user && user.profile && user.profile.name) {
  console.log(user.profile.name)
}
```

### "Module not found"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check import paths
import Component from './Component'  // Relative path
import Component from '@/components/Component'  // Alias path
```

### "Hydration failed"

```javascript
// Ensure server and client render the same content
// Use useEffect for client-only code
useEffect(() => {
  setIsClient(true)
}, [])

if (!isClient) return null
```

## 🔍 Debugging Tools

### Browser Developer Tools

```bash
# Console for errors and debugging
F12 > Console

# Network tab for API requests
F12 > Network

# Application tab for storage
F12 > Application > Local Storage / Session Storage
```

### Server Debugging

```bash
# Check server logs
tail -f server/logs/app.log

# Debug with Node.js inspector
node --inspect ace serve

# Use PM2 for process monitoring
pm2 logs
pm2 monit
```

### Database Debugging

```bash
# Enable MySQL query logging
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/queries.log';

# Monitor database performance
SHOW PROCESSLIST;
SHOW STATUS;
```

## 📞 Getting Help

### Before Contacting Support

1. **Check the logs**: Look for error messages in browser console and server logs
2. **Reproduce the issue**: Document steps to reproduce the problem
3. **Check environment**: Verify Node.js version, database status, etc.
4. **Try basic solutions**: Clear cache, restart services, check configurations

### Support Channels

- 📧 **Email**: support@medcarepro.com
- 🐛 **Bug Reports**: GitHub Issues
- 📖 **Documentation**: Complete guides in this documentation
- 💬 **Community**: Stack Overflow with tag `medcare-pro`

### Information to Include

- **Environment**: OS, Node.js version, browser
- **Error messages**: Complete error text and stack traces
- **Steps to reproduce**: Detailed steps that lead to the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If relevant, include screenshots

---

**Still having issues?** Don't hesitate to reach out to our support team at support@medcarepro.com with detailed information about your problem.

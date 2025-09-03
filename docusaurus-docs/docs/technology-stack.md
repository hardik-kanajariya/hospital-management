# Technology Stack Documentation - MedCare Hospital Management System

> **Last Updated**: September 3, 2025  
> **Based on**: Package.json analysis and codebase inspection

## Architecture Overview

MedCare follows a modern **Full-Stack JavaScript** architecture with clear separation between frontend, backend, and database layers. The system is designed for scalability, maintainability, and performance.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   React 19      │◄──►│   AdonisJS 6    │◄──►│    MySQL 8      │
│   TypeScript    │    │   Node.js       │    │                 │
│   Tailwind CSS  │    │   TypeScript    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Technology Stack

### Core Framework
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "~5.7.2"
}
```

**React 19** - Latest React version with:
- Concurrent features for better performance
- Automatic batching
- Suspense improvements
- Server Components ready

### Build & Development Tools
```json
{
  "vite": "^6.3.5",
  "@vitejs/plugin-react": "^4.3.4",
  "@vitejs/plugin-react-swc": "^3.10.1"
}
```

**Vite 6.3.5** - Next-generation frontend tooling:
- Lightning-fast Hot Module Replacement (HMR)
- Native ES modules
- Optimized production builds
- Tree-shaking and code splitting
- SWC integration for faster compilation

### Styling & UI Framework
```json
{
  "tailwindcss": "^4.1.11",
  "@tailwindcss/container-queries": "^0.1.1",
  "@tailwindcss/vite": "^4.1.11"
}
```

**Tailwind CSS 4.1.11** - Utility-first CSS framework:
- Latest version with container queries
- Vite integration for optimal performance
- Custom design system
- Responsive design utilities
- Dark mode support

### UI Component Library (shadcn/ui)
```json
{
  "@radix-ui/react-*": "^1.x.x"
}
```

**Radix UI Components** - Unstyled, accessible components:
- Accordion, Alert Dialog, Avatar, Checkbox
- Dropdown Menu, Dialog, Navigation Menu
- Popover, Progress, Radio Group, Select
- Slider, Switch, Tabs, Toggle, Tooltip
- Complete accessibility support
- Keyboard navigation
- Screen reader compatible

### State Management & Data Fetching
```json
{
  "@tanstack/react-query": "^5.83.1",
  "axios": "^1.11.0"
}
```

**TanStack React Query 5.83.1** - Powerful data synchronization:
- Server state management
- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- Pagination support
- Offline support

### Form Management
```json
{
  "react-hook-form": "^7.54.2",
  "@hookform/resolvers": "^4.1.3",
  "zod": "^3.25.76"
}
```

**React Hook Form + Zod** - Type-safe form validation:
- Minimal re-renders
- Built-in validation
- TypeScript integration
- Schema-based validation with Zod
- Easy integration with UI components

### Routing
```json
{
  "react-router-dom": "^7.8.2"
}
```

**React Router 7.8.2** - Latest routing solution:
- Data loading patterns
- Nested routing
- Code splitting support
- Type-safe route parameters

### Icon Libraries
```json
{
  "@phosphor-icons/react": "^2.1.7",
  "lucide-react": "^0.484.0",
  "@heroicons/react": "^2.2.0"
}
```

**Multiple Icon Libraries**:
- **Phosphor Icons**: Modern icon family with 6,000+ icons
- **Lucide React**: Beautiful & consistent icon pack
- **Heroicons**: Hand-crafted SVG icons by Tailwind team

### Data Visualization
```json
{
  "recharts": "^2.15.1",
  "d3": "^7.9.0"
}
```

**Recharts 2.15.1** - React charting library:
- Built on D3.js
- Responsive charts
- Line, Bar, Pie, Area charts
- Custom chart components
- Animation support

### Animation & Interactions
```json
{
  "framer-motion": "^12.6.2",
  "three": "^0.175.0"
}
```

**Framer Motion 12.6.2** - Production-ready motion library:
- Declarative animations
- Gesture recognition
- Layout animations
- SVG path animations

### Utility Libraries
```json
{
  "date-fns": "^3.6.0",
  "uuid": "^11.1.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.2",
  "class-variance-authority": "^0.7.1"
}
```

**Utility Libraries**:
- **date-fns**: Modern date utility library
- **uuid**: RFC4122 UUIDs generator
- **clsx**: Tiny utility for constructing className strings
- **tailwind-merge**: Merge Tailwind CSS classes without conflicts
- **cva**: Class variance authority for component variants

### Additional Features
```json
{
  "react-error-boundary": "^6.0.0",
  "sonner": "^2.0.1",
  "next-themes": "^0.4.6",
  "input-otp": "^1.4.2",
  "cmdk": "^1.1.1"
}
```

- **Error Boundaries**: Graceful error handling
- **Sonner**: Beautiful toast notifications
- **Next Themes**: Theme switching
- **Input OTP**: One-time password input
- **CMDK**: Command palette component

## Backend Technology Stack

### Core Framework
```json
{
  "@adonisjs/core": "^6.18.0",
  "typescript": "~5.8"
}
```

**AdonisJS 6.18.0** - Full-featured Node.js framework:
- TypeScript-first approach
- Built-in ORM (Lucid)
- Authentication system
- Validation system
- Mail system
- File storage

### Database & ORM
```json
{
  "@adonisjs/lucid": "^21.6.1",
  "mysql2": "^3.14.3"
}
```

**Lucid ORM 21.6.1** - Active Record ORM:
- MySQL adapter
- Migration system
- Model relationships
- Query builder
- Connection pooling
- Database transactions

**MySQL 8.0** - Relational database:
- ACID compliance
- Full-text search
- JSON data type support
- Performance optimization
- Replication support

### Authentication & Security
```json
{
  "@adonisjs/auth": "^9.4.0",
  "@adonisjs/cors": "^2.2.1",
  "@adonisjs/limiter": "^2.4.0",
  "bcryptjs": "^3.0.2",
  "helmet": "^8.1.0"
}
```

**Security Stack**:
- **AdonisJS Auth**: JWT token management
- **CORS**: Cross-origin resource sharing
- **Rate Limiter**: API request throttling
- **bcryptjs**: Password hashing
- **Helmet**: Security headers

### Validation & Data Processing
```json
{
  "@adonisjs/validator": "^13.0.2",
  "@vinejs/vine": "^3.0.1"
}
```

**VineJS 3.0.1** - Schema validation library:
- Type-safe validation
- Custom validation rules
- Async validation support
- Localization ready

### Communication
```json
{
  "@adonisjs/mail": "^9.2.2",
  "socket.io": "^4.8.1"
}
```

**Communication Features**:
- **Mail System**: Email sending capabilities
- **Socket.IO**: Real-time communication
- WebSocket support
- Event-driven architecture

### Utilities & Middleware
```json
{
  "luxon": "^3.7.1",
  "moment": "^2.30.1",
  "uuid": "^11.1.0",
  "compression": "^1.8.1",
  "morgan": "^1.10.1"
}
```

**Backend Utilities**:
- **Luxon**: Date/time manipulation
- **Moment**: Legacy date support
- **UUID**: Unique identifier generation
- **Compression**: Response compression
- **Morgan**: HTTP request logger

## Database Architecture

### Database Management System
```
MySQL 8.0+
├── Full ACID compliance
├── InnoDB storage engine
├── UTF8MB4 character set
├── Foreign key constraints
├── Indexes for performance
└── JSON data type support
```

### Key Database Features
- **Transactions**: ACID-compliant transactions
- **Relationships**: Foreign key constraints
- **Indexing**: Performance-optimized indexes
- **JSON Support**: Native JSON data type
- **Full-text Search**: Advanced search capabilities
- **Migrations**: Version-controlled schema changes
- **Soft Deletes**: Safe record archival

### Current Database Tables
```sql
-- Core System Tables
users, organizations, roles, permissions
user_role_data, role_fields, role_permissions

-- Hospital Management Tables  
patients, appointments, medical_records
bills, inventories, lab_tests, beds
prescriptions, notifications

-- Scheduling Tables
doctor_schedules, doctor_availability

-- Configuration Tables
master_data, system_settings

-- Audit & Security Tables
access_tokens, audit_logs
super_dupar_admins, super_dupar_admin_access_tokens
```

## Development & Build Tools

### Package Management
```json
{
  "workspaces": {
    "packages": ["packages/*"]
  }
}
```

**npm Workspaces** - Monorepo management:
- Shared dependencies
- Parallel script execution
- Cross-package linking

### Code Quality
```json
{
  "eslint": "^9.28.0",
  "@eslint/js": "^9.21.0",
  "typescript-eslint": "^8.38.0"
}
```

**ESLint 9** - Latest linting:
- TypeScript integration
- React hooks rules
- Custom rule configuration
- Automatic fixing

### Development Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b --noCheck && vite build",
    "server:dev": "cd server && npm run dev",
    "start": "concurrently --names \"CLIENT,SERVER\" --prefix-colors \"cyan,yellow\" \"npm run dev\" \"npm run server:dev\""
  }
}
```

**Development Workflow**:
- Concurrent frontend/backend development
- Hot module replacement
- TypeScript compilation
- Automatic restarts

## Deployment Architecture

### Production Build
```bash
npm run build:full  # Builds both frontend and backend
```

**Build Process**:
- TypeScript compilation
- Vite production build
- Asset optimization
- Tree shaking
- Code splitting

### Environment Configuration
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medcare
DB_USER=username
DB_PASSWORD=password

# Application
NODE_ENV=production
JWT_SECRET=secret_key
API_BASE_URL=https://api.medcare.com

# External Services
MAIL_HOST=smtp.gmail.com
SMS_API_KEY=api_key
```

### Deployment Options
- **Traditional Hosting**: VPS, dedicated servers
- **Cloud Platforms**: AWS, Google Cloud, Azure
- **Containerization**: Docker ready
- **CDN Support**: Static asset delivery

## Performance Optimizations

### Frontend Performance
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: Responsive images
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: React Query caching
- **Compression**: Gzip compression

### Backend Performance
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Database connections
- **Response Compression**: Gzip middleware
- **Caching**: Redis ready
- **Rate Limiting**: API protection

### Database Performance
- **Indexes**: Strategic index placement
- **Query Optimization**: Efficient queries
- **Relationship Loading**: Eager/lazy loading
- **Pagination**: Large dataset handling

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-based Access**: Granular permissions
- **Password Hashing**: bcrypt encryption
- **Session Management**: Secure sessions

### Data Protection
- **Input Validation**: VineJS validation
- **SQL Injection Prevention**: ORM protection
- **XSS Protection**: Helmet middleware
- **CORS Configuration**: Cross-origin security

### API Security
- **Rate Limiting**: Request throttling
- **Authentication Middleware**: Protected routes
- **Error Handling**: Secure error responses
- **Audit Logging**: Security event tracking

## Browser Support

### Supported Browsers
- **Chrome**: 90+ (Recommended)
- **Firefox**: 90+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Android 8+

### Progressive Web App
- **Service Worker**: Offline capability
- **Web App Manifest**: Installation support
- **Responsive Design**: Mobile-first approach

## Scalability Considerations

### Horizontal Scaling
- **Stateless Backend**: Load balancer ready
- **Database Scaling**: Read replicas
- **CDN Integration**: Static asset distribution
- **Microservices Ready**: Modular architecture

### Vertical Scaling
- **Resource Optimization**: Memory/CPU efficient
- **Database Optimization**: Query performance
- **Caching Strategies**: Multiple cache layers

---

## Technology Decisions Rationale

### Why React 19?
- Latest features and performance improvements
- Concurrent rendering for better UX
- Strong TypeScript integration
- Large ecosystem and community

### Why AdonisJS 6?
- TypeScript-first Node.js framework
- Built-in features reduce dependencies
- Laravel-like elegance for Node.js
- Excellent ORM and validation

### Why MySQL 8?
- Proven reliability in healthcare
- ACID compliance for data integrity
- JSON support for flexible schemas
- Strong backup and recovery tools

### Why Tailwind CSS?
- Utility-first approach for consistency
- Excellent performance with purging
- Easy customization and theming
- Great developer experience

This technology stack provides a solid foundation for a modern, scalable hospital management system with room for future enhancements and integrations.

# Q-Mobility Lead Management Platform
## Technical Architecture Document

### Document Information
- **Document Version**: 2.0 - ✅ PRODUCTION READY  
- **Date**: August 2025 (Updated)
- **Project**: Q-Mobility Lead Management Platform
- **Classification**: Internal Use
- **Document Owner**: Q-Mobility Architecture Team
- **Stakeholders**: Development Team, DevOps Team, System Architects, Technical Leadership

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [System Context](#3-system-context)
4. [Application Architecture](#4-application-architecture)
5. [Data Architecture](#5-data-architecture)
6. [Infrastructure Architecture](#6-infrastructure-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Integration Architecture](#8-integration-architecture)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Monitoring and Observability](#10-monitoring-and-observability)
11. [Performance Architecture](#11-performance-architecture)
12. [Disaster Recovery](#12-disaster-recovery)

---

## 1. Executive Summary

### 1.1 Purpose
This Technical Architecture Document defines the comprehensive technical design for the Q-Mobility Lead Management Platform, providing detailed specifications for development, deployment, and operational teams.

### 1.2 Architecture Principles
- **Scalability**: Horizontal scaling capability to support business growth
- **Security**: Defense-in-depth security strategy with comprehensive protection
- **Maintainability**: Modular design with clear separation of concerns
- **Performance**: Sub-2-second response times with 99.9% availability
- **Reliability**: Fault-tolerant design with automatic recovery mechanisms

### 1.3 Technology Stack Overview
```
Frontend:    React 18 + TypeScript + Tailwind CSS
Backend:     Node.js + Express.js + TypeScript
Database:    PostgreSQL 14+ with Drizzle ORM
Hosting:     Replit Cloud Platform
Auth:        Replit OAuth + Passport.js
Monitoring:  Built-in Replit monitoring + Custom metrics
```

### 1.4 Key Architectural Decisions
- **Single Page Application (SPA)**: React-based SPA for optimal user experience
- **RESTful API**: Standard REST API design for external integrations
- **Microservice-Ready**: Modular design allowing future microservice adoption
- **Cloud-Native**: Built for cloud deployment with auto-scaling capabilities

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Web Browser (React SPA)  │  Mobile Browser (PWA)         │
│  - React 18 + TypeScript  │  - Responsive Design          │
│  - Tailwind CSS           │  - Touch Optimized           │
│  - TanStack Query          │  - Offline Capability        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│           Load Balancer (Replit Infrastructure)            │
├─────────────────────────────────────────────────────────────┤
│  Express.js API Server    │  Static File Server           │
│  - RESTful API Endpoints  │  - React Build Assets         │
│  - Authentication         │  - CDN Distribution           │
│  - Business Logic         │  - Asset Optimization         │
│  - Request Validation     │  - Gzip Compression           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL/Connection Pool
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database      │  Session Store                 │
│  - Transactional Data     │  - Express Sessions           │
│  - Drizzle ORM            │  - PostgreSQL Backend         │
│  - Connection Pooling     │  - Secure Cookie Storage      │
│  - Automated Backups      │  - Session Timeout            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Patterns

#### 2.2.1 Three-Tier Architecture
- **Presentation Tier**: React SPA with responsive UI components
- **Business Logic Tier**: Express.js API with service layer
- **Data Tier**: PostgreSQL with ORM abstraction

#### 2.2.2 Model-View-Controller (MVC)
- **Model**: Drizzle ORM models and database schemas
- **View**: React components and user interface
- **Controller**: Express.js route handlers and middleware

#### 2.2.3 Repository Pattern
- **Data Access Layer**: Centralized database operations
- **Service Layer**: Business logic abstraction
- **API Layer**: HTTP request/response handling

### 2.3 System Boundaries

#### 2.3.1 Internal Systems
- Lead Management Core
- User Authentication System
- Analytics and Reporting Engine
- Vehicle Fleet Integration
- Configuration Management

#### 2.3.2 External Systems
- Replit OAuth Provider
- Email Service (SendGrid)
- File Storage (Replit Storage)
- SMS Gateway (Future Integration)
- Payment Gateway (Future Integration)

---

## 3. System Context

### 3.1 System Context Diagram

```
                    ┌─────────────────┐
                    │   Q-Mobility    │
                    │  Staff & Mgmt   │
                    └─────────┬───────┘
                              │
                              │ Web Interface
                              ▼
    ┌─────────────┐    ┌─────────────────────┐    ┌─────────────┐
    │   Replit    │◄───┤   Q-Mobility Lead   ├───►│  SendGrid   │
    │ OAuth Svc   │    │ Management Platform │    │Email Service│
    └─────────────┘    └─────────────────────┘    └─────────────┘
                                  │
                                  │ Database Connection
                                  ▼
                          ┌─────────────┐
                          │ PostgreSQL  │
                          │  Database   │
                          └─────────────┘
```

### 3.2 External Dependencies

#### 3.2.1 Replit Platform Services
- **OAuth Authentication**: User identity and access management
- **Cloud Hosting**: Application runtime and infrastructure
- **Database Service**: Managed PostgreSQL database
- **File Storage**: Document and image storage
- **CDN**: Content delivery for static assets

#### 3.2.2 Third-Party Services
- **SendGrid**: Email delivery and template management
- **Future Integrations**: SMS gateway, payment processing, fleet management APIs

### 3.3 Integration Points

#### 3.3.1 Authentication Integration
```javascript
// Replit OAuth Integration Flow
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────►│   Express   │────►│ Replit OAuth│
│             │     │   Server    │     │   Service   │
│             │◄────┤             │◄────┤             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ PostgreSQL  │
                    │Session Store│
                    └─────────────┘
```

#### 3.3.2 Email Integration
```javascript
// Email Service Integration
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Lead System │────►│Email Service│────►│  SendGrid   │
│             │     │  Wrapper    │     │     API     │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 4. Application Architecture

### 4.1 Frontend Architecture

#### 4.1.1 Component Architecture

```
src/
├── components/
│   ├── ui/                 # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── table.tsx
│   ├── layout/             # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── forms/              # Form components
│   │   ├── lead-form.tsx
│   │   ├── user-form.tsx
│   │   └── vehicle-form.tsx
│   ├── charts/             # Data visualization
│   │   ├── dashboard-charts.tsx
│   │   ├── performance-chart.tsx
│   │   └── trend-chart.tsx
│   └── features/           # Feature-specific components
│       ├── lead-management/
│       ├── user-management/
│       ├── analytics/
│       └── vehicle-management/
├── pages/                  # Page components
│   ├── dashboard.tsx
│   ├── leads.tsx
│   ├── analytics.tsx
│   ├── admin.tsx
│   └── login.tsx
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useLeads.ts
│   ├── useAnalytics.ts
│   └── useDebounce.ts
├── lib/                    # Utility libraries
│   ├── api.ts
│   ├── utils.ts
│   ├── validations.ts
│   └── queryClient.ts
├── types/                  # TypeScript definitions
│   ├── auth.ts
│   ├── leads.ts
│   ├── analytics.ts
│   └── common.ts
└── services/               # API service layer
    ├── authService.ts
    ├── leadService.ts
    ├── analyticsService.ts
    └── vehicleService.ts
```

#### 4.1.2 State Management Strategy

```typescript
// Global State Architecture
┌─────────────────────────────────────────────────┐
│               Client State Management            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Server State (TanStack Query)                  │
│  ├── API Data Caching                          │
│  ├── Background Refetching                     │
│  ├── Optimistic Updates                        │
│  └── Error Handling                            │
│                                                 │
│  Local Component State (React Hooks)           │
│  ├── useState for component state              │
│  ├── useReducer for complex state              │
│  ├── useContext for shared state               │
│  └── Custom hooks for reusable logic           │
│                                                 │
│  Form State (React Hook Form)                  │
│  ├── Form validation                           │
│  ├── Field state management                    │
│  ├── Error handling                            │
│  └── Submit handling                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 4.1.3 Component Communication

```typescript
// Component Communication Patterns

// Parent to Child - Props
interface LeadTableProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  filters: FilterState;
}

// Child to Parent - Callbacks
const handleLeadUpdate = (leadId: string, updates: Partial<Lead>) => {
  onLeadUpdate(leadId, updates);
};

// Sibling Components - Context
const LeadsContext = createContext<LeadsContextType>();

// Global State - TanStack Query
const { data: leads, mutate } = useQuery({
  queryKey: ['/api/leads'],
  queryFn: fetchLeads
});
```

### 4.2 Backend Architecture

#### 4.2.1 Server Structure

```
server/
├── index.ts                # Application entry point
├── app.ts                  # Express app configuration
├── routes/                 # API route handlers
│   ├── auth.ts
│   ├── leads.ts
│   ├── users.ts
│   ├── analytics.ts
│   ├── branches.ts
│   └── vehicles.ts
├── middleware/             # Express middleware
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   ├── cors.ts
│   └── rateLimit.ts
├── services/               # Business logic layer
│   ├── authService.ts
│   ├── leadService.ts
│   ├── userService.ts
│   ├── analyticsService.ts
│   └── emailService.ts
├── models/                 # Data models & validation
│   ├── user.ts
│   ├── lead.ts
│   ├── branch.ts
│   └── vehicle.ts
├── storage/                # Data access layer
│   ├── storage.ts
│   ├── userStorage.ts
│   ├── leadStorage.ts
│   └── analyticsStorage.ts
├── utils/                  # Utility functions
│   ├── encryption.ts
│   ├── validation.ts
│   ├── dateUtils.ts
│   └── emailTemplates.ts
├── config/                 # Configuration management
│   ├── database.ts
│   ├── auth.ts
│   └── environment.ts
└── db/                     # Database management
    ├── connection.ts
    ├── migrations/
    └── seeds/
```

#### 4.2.2 API Architecture

```typescript
// RESTful API Design Pattern

// Route → Controller → Service → Storage → Database

// Example: Lead Management Flow
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Route     │───►│ Controller  │───►│  Service    │
│ GET /leads  │    │ validateReq │    │ businessLogic│
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
┌─────────────┐    ┌─────────────┐    ┌─────▼─────┐
│  Database   │◄───┤   Storage   │◄───┤   Model    │
│ PostgreSQL  │    │   Layer     │    │Validation  │
└─────────────┘    └─────────────┘    └───────────┘
```

#### 4.2.3 Service Layer Design

```typescript
// Service Layer Architecture
export class LeadService {
  constructor(
    private leadStorage: ILeadStorage,
    private emailService: EmailService,
    private analyticsService: AnalyticsService
  ) {}

  async createLead(leadData: CreateLeadRequest): Promise<Lead> {
    // 1. Validate business rules
    await this.validateLeadData(leadData);
    
    // 2. Check for duplicates
    const duplicate = await this.leadStorage.findDuplicate(leadData);
    if (duplicate) {
      throw new DuplicateLeadError();
    }
    
    // 3. Create lead record
    const lead = await this.leadStorage.create(leadData);
    
    // 4. Send notifications
    await this.emailService.sendLeadConfirmation(lead);
    
    // 5. Update analytics
    await this.analyticsService.recordLeadCreation(lead);
    
    return lead;
  }
}
```

#### 4.2.4 Middleware Pipeline

```typescript
// Express Middleware Pipeline
app.use(helmet());                    // Security headers
app.use(cors(corsOptions));          // CORS configuration
app.use(morgan('combined'));         // Request logging
app.use(express.json({ limit: '10mb' })); // Body parser
app.use(compression());              // Response compression
app.use(rateLimit(rateLimitOptions)); // Rate limiting
app.use(session(sessionOptions));    // Session management
app.use(passport.initialize());      // Passport authentication
app.use(passport.session());         // Passport session

// Route-specific middleware
app.use('/api/auth', authRoutes);
app.use('/api/leads', isAuthenticated, leadRoutes);
app.use('/api/admin', isAuthenticated, isAdmin, adminRoutes);

// Error handling middleware
app.use(errorHandler);
```

---

## 5. Data Architecture

### 5.1 Database Design

#### 5.1.1 Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Branches  │    │    Users    │    │    Leads    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │───┐│ id (PK)     │───┐│ id (PK)     │
│ name        │   ││ email       │   ││ full_name   │
│ location    │   ││ role        │   ││ email       │
│ manager_id  │───┘│ branch_id   │   ││ phone       │
│ created_at  │    │ created_at  │   ││ status      │
└─────────────┘    └─────────────┘   ││ assigned_to │──┘
                                     ││ branch_id   │───┐
                   ┌─────────────┐   ││ created_at  │   │
                   │Communications│  │└─────────────┘   │
                   ├─────────────┤  │                  │
                   │ id (PK)     │  │┌─────────────┐   │
                   │ lead_id     │──┘│  Car Types  │   │
                   │ user_id     │───┐├─────────────┤   │
                   │ type        │   ││ id (PK)     │   │
                   │ content     │   ││ name        │   │
                   │ created_at  │   ││ description │   │
                   └─────────────┘   │└─────────────┘   │
                                     │                  │
   ┌─────────────┐    ┌─────────────┐│┌─────────────┐   │
   │  Car Plates │    │ Car Models  │││ Car Makes   │   │
   ├─────────────┤    ├─────────────┤││├─────────────┤   │
   │ id (PK)     │    │ id (PK)     │││ id (PK)     │   │
   │ plate_number│    │ name        │││ name        │   │
   │ model_id    │────│ make_id     │││ type_id     │───┘
   │ branch_id   │───┐│ year        │││ created_at  │
   │ status      │   ││ created_at  │││└─────────────┘
   └─────────────┘   │└─────────────┘│┘
                     └────────────────┘
```

#### 5.1.2 Data Model Specifications

```sql
-- Core Business Entities

-- Users table with role-based access
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    role user_role NOT NULL DEFAULT 'staff',
    branch_id VARCHAR REFERENCES branches(id),
    profile_image_url VARCHAR,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Branches for multi-location support
CREATE TABLE branches (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    address TEXT,
    phone VARCHAR,
    email VARCHAR,
    manager_id VARCHAR REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads - core business entity
CREATE TABLE leads (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR NOT NULL,
    email VARCHAR,
    phone VARCHAR NOT NULL,
    vehicle_type VARCHAR,
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    rental_period_days INTEGER GENERATED ALWAYS AS 
        (rental_end_date - rental_start_date + 1) STORED,
    pickup_location VARCHAR,
    dropoff_location VARCHAR,
    special_requirements TEXT,
    status lead_status DEFAULT 'new',
    source_type lead_source DEFAULT 'website',
    priority lead_priority DEFAULT 'normal',
    assigned_to VARCHAR REFERENCES users(id),
    branch_id VARCHAR REFERENCES branches(id),
    is_archived BOOLEAN DEFAULT false,
    notes TEXT,
    conversion_date TIMESTAMP,
    estimated_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Communication tracking
CREATE TABLE communications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id VARCHAR REFERENCES leads(id) ON DELETE CASCADE,
    user_id VARCHAR REFERENCES users(id),
    type communication_type NOT NULL,
    direction communication_direction NOT NULL,
    subject VARCHAR,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5.1.3 Database Optimization

```sql
-- Performance Indexes

-- User lookup optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch_role ON users(branch_id, role);
CREATE INDEX idx_users_active ON users(is_active, last_login);

-- Lead management optimization
CREATE INDEX idx_leads_status_branch ON leads(status, branch_id);
CREATE INDEX idx_leads_assigned_date ON leads(assigned_to, created_at DESC);
CREATE INDEX idx_leads_rental_dates ON leads(rental_start_date, rental_end_date);
CREATE INDEX idx_leads_search ON leads USING gin(to_tsvector('english', 
    full_name || ' ' || email || ' ' || phone));

-- Communication history optimization
CREATE INDEX idx_communications_lead_date ON communications(lead_id, created_at DESC);
CREATE INDEX idx_communications_user_type ON communications(user_id, type);

-- Analytics optimization
CREATE INDEX idx_leads_analytics ON leads(status, source_type, branch_id, created_at);
CREATE INDEX idx_leads_conversion ON leads(status, conversion_date) 
    WHERE status = 'converted';

-- Partial indexes for active records
CREATE INDEX idx_active_leads ON leads(status, created_at) WHERE NOT is_archived;
CREATE INDEX idx_active_users ON users(role, branch_id) WHERE is_active;
```

### 5.2 Data Access Layer

#### 5.2.1 ORM Configuration

```typescript
// Drizzle ORM Configuration
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Connection configuration
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

export const db = drizzle({ 
    client: pool, 
    schema: * as schema,
    logger: process.env.NODE_ENV === 'development'
});

// Connection health monitoring
export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        await db.execute(sql`SELECT 1`);
        return true;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
}
```

#### 5.2.2 Repository Pattern Implementation

```typescript
// Base Repository Interface
export interface IRepository<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
    findById(id: string): Promise<T | undefined>;
    findMany(filters: Partial<T>): Promise<T[]>;
    create(data: CreateT): Promise<T>;
    update(id: string, data: UpdateT): Promise<T>;
    delete(id: string): Promise<boolean>;
    count(filters?: Partial<T>): Promise<number>;
}

// Lead Repository Implementation
export class LeadRepository implements IRepository<Lead, CreateLead, UpdateLead> {
    constructor(private db: Database) {}

    async findById(id: string): Promise<Lead | undefined> {
        const [lead] = await this.db
            .select()
            .from(leads)
            .where(eq(leads.id, id))
            .limit(1);
        return lead;
    }

    async findWithFilters(filters: LeadFilters): Promise<LeadsResponse> {
        let query = this.db.select().from(leads);

        // Apply filters
        const conditions: SQL[] = [];
        
        if (filters.status && filters.status !== 'all') {
            conditions.push(eq(leads.status, filters.status));
        }
        
        if (filters.branchId) {
            conditions.push(eq(leads.branch_id, filters.branchId));
        }
        
        if (filters.assignedTo) {
            conditions.push(eq(leads.assigned_to, filters.assignedTo));
        }
        
        if (filters.dateRange) {
            const { start, end } = filters.dateRange;
            conditions.push(
                and(
                    gte(leads.created_at, start),
                    lte(leads.created_at, end)
                )
            );
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        // Apply pagination
        const offset = (filters.page - 1) * filters.limit;
        const results = await query
            .orderBy(desc(leads.created_at))
            .limit(filters.limit)
            .offset(offset);

        const total = await this.count(filters);

        return {
            leads: results,
            total,
            page: filters.page,
            totalPages: Math.ceil(total / filters.limit)
        };
    }
}
```

### 5.3 Data Migration Strategy

#### 5.3.1 Migration Framework

```typescript
// Migration Infrastructure
export interface Migration {
    id: string;
    description: string;
    up: (db: Database) => Promise<void>;
    down: (db: Database) => Promise<void>;
}

// Migration execution
export class MigrationRunner {
    constructor(private db: Database) {}

    async runMigrations(): Promise<void> {
        await this.ensureMigrationTable();
        
        const pendingMigrations = await this.getPendingMigrations();
        
        for (const migration of pendingMigrations) {
            console.log(`Running migration: ${migration.id}`);
            
            try {
                await this.db.transaction(async (tx) => {
                    await migration.up(tx);
                    await this.recordMigration(tx, migration.id);
                });
                
                console.log(`Migration completed: ${migration.id}`);
            } catch (error) {
                console.error(`Migration failed: ${migration.id}`, error);
                throw error;
            }
        }
    }
}
```

#### 5.3.2 Sample Migrations

```typescript
// Initial schema migration
export const migration_001_initial_schema: Migration = {
    id: '001_initial_schema',
    description: 'Create initial database schema',
    
    async up(db: Database) {
        // Create custom types
        await db.execute(sql`
            CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
            CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'quoted', 'negotiating', 'converted', 'declined');
            CREATE TYPE lead_source AS ENUM ('website', 'phone', 'walk_in', 'referral', 'social_media', 'email', 'other');
        `);
        
        // Create tables
        await db.execute(sql`
            CREATE TABLE branches (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL,
                location VARCHAR NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        
        // ... more table creation
    },
    
    async down(db: Database) {
        await db.execute(sql`DROP TABLE IF EXISTS branches CASCADE;`);
        await db.execute(sql`DROP TYPE IF EXISTS user_role;`);
        // ... cleanup
    }
};
```

---

## 6. Infrastructure Architecture

### 6.1 Hosting Architecture

#### 6.1.1 Replit Cloud Platform

```
┌─────────────────────────────────────────────────────────────┐
│                    Replit Cloud Infrastructure              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Load Balancer │    │      CDN        │                │
│  │   - Auto SSL    │    │   - Static      │                │
│  │   - Health Chk  │    │     Assets      │                │
│  │   - Failover    │    │   - Gzip        │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                         │
│           ▼                       │                         │
│  ┌─────────────────────────────────┴─────┐                 │
│  │        Application Containers          │                 │
│  │  ┌─────────────┐  ┌─────────────┐    │                 │
│  │  │   Node.js   │  │   Node.js   │    │                 │
│  │  │  Instance   │  │  Instance   │    │                 │
│  │  │     #1      │  │     #2      │    │                 │
│  │  └─────────────┘  └─────────────┘    │                 │
│  └─────────────────────────────────────────┘                 │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────┐                │
│  │          Database Service               │                │
│  │  ┌─────────────┐  ┌─────────────┐     │                │
│  │  │ PostgreSQL  │  │  Automated  │     │                │
│  │  │   Primary   │  │   Backups   │     │                │
│  │  └─────────────┘  └─────────────┘     │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 6.1.2 Auto-Scaling Configuration

```yaml
# Replit Scaling Configuration
scaling:
  instances:
    min: 1
    max: 5
    target_cpu: 70%
    target_memory: 80%
  
  health_check:
    path: /health
    interval: 30s
    timeout: 10s
    retries: 3
  
  deployment:
    strategy: rolling
    max_unavailable: 1
    max_surge: 1
```

### 6.2 Network Architecture

#### 6.2.1 Network Topology

```
                    Internet
                        │
                        ▼
              ┌─────────────────┐
              │   Cloudflare    │
              │   (Optional)    │
              │  - DDoS Protect │
              │  - Rate Limit   │
              └─────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │ Replit Gateway  │
              │  - SSL Term     │
              │  - Load Balance │
              │  - Health Check │
              └─────────────────┘
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
    ┌───────────┐ ┌───────────┐ ┌───────────┐
    │   App     │ │   App     │ │   App     │
    │Instance 1 │ │Instance 2 │ │Instance 3 │
    └───────────┘ └───────────┘ └───────────┘
           │            │            │
           └────────────┼────────────┘
                        ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │    Database     │
              └─────────────────┘
```

#### 6.2.2 Security Network Configuration

```typescript
// CORS Configuration
const corsOptions = {
    origin: [
        'https://q-mobility-platform.replit.app',
        process.env.FRONTEND_URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "*.replit.com"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "*.replit.com"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

### 6.3 Storage Architecture

#### 6.3.1 File Storage Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Storage Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Application Data                                           │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   PostgreSQL    │    │   Session       │                │
│  │   Database      │    │   Storage       │                │
│  │  - Leads        │    │  - User Sessions│                │
│  │  - Users        │    │  - Auth Tokens  │                │
│  │  - Analytics    │    │  - CSRF Tokens  │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  File Storage                                               │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Static Assets  │    │   User Files    │                │
│  │  - CSS/JS       │    │  - Documents    │                │
│  │  - Images       │    │  - Images       │                │
│  │  - Fonts        │    │  - Attachments  │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 6.3.2 Backup Strategy

```typescript
// Automated Backup Configuration
export interface BackupConfig {
    database: {
        frequency: 'daily' | 'hourly';
        retention: number; // days
        location: 'local' | 'cloud';
        encryption: boolean;
    };
    files: {
        frequency: 'daily' | 'weekly';
        retention: number;
        compression: boolean;
    };
}

const backupConfig: BackupConfig = {
    database: {
        frequency: 'daily',
        retention: 30,
        location: 'cloud',
        encryption: true
    },
    files: {
        frequency: 'weekly',
        retention: 90,
        compression: true
    }
};
```

---

## 7. Security Architecture

### 7.1 Security Framework

#### 7.1.1 Defense in Depth Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layer Stack                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 7: Application Security                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Input Valid   │    │   Output Encode │                │
│  │   CSRF Protect  │    │   XSS Prevent   │                │
│  │   SQL Injection │    │   Auth/Authz    │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  Layer 6: Session Security                                 │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Secure Cookie  │    │   Session Mgmt  │                │
│  │   HTTPOnly      │    │   Timeout       │                │
│  │   SameSite      │    │   Rotation      │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  Layer 5: Transport Security                               │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │     TLS 1.3     │    │   HSTS Header   │                │
│  │  Perfect Forward│    │   Cert Pinning  │                │
│  │    Secrecy      │    │   Secure Proto  │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  Layer 4: Network Security                                 │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Rate Limiting │    │   DDoS Protect  │                │
│  │   IP Filtering  │    │   Firewall      │                │
│  │   Geo Blocking  │    │   Intrusion Det │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 7.1.2 Authentication Architecture

```typescript
// Multi-Factor Authentication Flow
export class AuthenticationService {
    async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
        // Step 1: Validate credentials
        const user = await this.validateCredentials(credentials);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        // Step 2: Check account status
        if (!user.isActive) {
            throw new AccountDisabledError();
        }

        // Step 3: Check for 2FA requirement
        if (user.requires2FA) {
            return {
                status: 'requires_2fa',
                tempToken: this.generateTempToken(user.id),
                user: null
            };
        }

        // Step 4: Create session
        const session = await this.createSession(user);
        
        // Step 5: Log successful login
        await this.auditLogger.logLogin(user.id, credentials.ipAddress);

        return {
            status: 'authenticated',
            user,
            session
        };
    }

    async verify2FA(tempToken: string, code: string): Promise<AuthResult> {
        // Verify temporary token
        const userId = await this.verifyTempToken(tempToken);
        
        // Verify 2FA code
        const isValidCode = await this.verify2FACode(userId, code);
        if (!isValidCode) {
            throw new Invalid2FACodeError();
        }

        // Complete authentication
        const user = await this.userService.findById(userId);
        const session = await this.createSession(user);

        return {
            status: 'authenticated',
            user,
            session
        };
    }
}
```

### 7.2 Authorization Framework

#### 7.2.1 Role-Based Access Control (RBAC)

```typescript
// Permission System Architecture
export interface Permission {
    resource: string;
    action: string;
    scope?: string;
}

export interface Role {
    name: string;
    permissions: Permission[];
    inherits?: string[];
}

// Role Definitions
const ROLES: Record<string, Role> = {
    admin: {
        name: 'Administrator',
        permissions: [
            { resource: '*', action: '*' }, // Full access
        ]
    },
    
    manager: {
        name: 'Branch Manager',
        permissions: [
            { resource: 'leads', action: '*', scope: 'branch' },
            { resource: 'users', action: 'read|create|update', scope: 'branch' },
            { resource: 'analytics', action: 'read', scope: 'branch' },
            { resource: 'vehicles', action: '*', scope: 'branch' }
        ]
    },
    
    staff: {
        name: 'Staff Member',
        permissions: [
            { resource: 'leads', action: 'read|update', scope: 'assigned' },
            { resource: 'leads', action: 'create', scope: 'branch' },
            { resource: 'communications', action: '*', scope: 'assigned' },
            { resource: 'vehicles', action: 'read', scope: 'branch' }
        ]
    }
};

// Authorization Middleware
export function authorize(requiredPermission: Permission) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const hasPermission = await this.checkPermission(
            user,
            requiredPermission,
            req.params
        );

        if (!hasPermission) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    };
}
```

#### 7.2.2 Data Access Control

```typescript
// Data Filtering Based on User Context
export class DataAccessService {
    async getLeadsForUser(user: User, filters: LeadFilters): Promise<Lead[]> {
        let query = this.db.select().from(leads);
        
        // Apply role-based filtering
        switch (user.role) {
            case 'admin':
                // Admin sees all leads
                break;
                
            case 'manager':
                // Manager sees branch leads
                query = query.where(eq(leads.branchId, user.branchId));
                break;
                
            case 'staff':
                // Staff sees only assigned leads
                query = query.where(
                    or(
                        eq(leads.assignedTo, user.id),
                        and(
                            eq(leads.branchId, user.branchId),
                            isNull(leads.assignedTo)
                        )
                    )
                );
                break;
        }
        
        // Apply additional filters
        if (filters.status) {
            query = query.where(eq(leads.status, filters.status));
        }
        
        return await query.execute();
    }
}
```

### 7.3 Data Protection

#### 7.3.1 Encryption Strategy

```typescript
// Data Encryption Service
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyDerivation = 'pbkdf2';
    
    async encryptSensitiveData(data: string): Promise<EncryptedData> {
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(12);
        const key = crypto.pbkdf2Sync(
            process.env.ENCRYPTION_KEY!,
            salt,
            100000,
            32,
            'sha256'
        );
        
        const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            data: encrypted,
            salt: salt.toString('hex'),
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }
    
    async decryptSensitiveData(encryptedData: EncryptedData): Promise<string> {
        const salt = Buffer.from(encryptedData.salt, 'hex');
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        
        const key = crypto.pbkdf2Sync(
            process.env.ENCRYPTION_KEY!,
            salt,
            100000,
            32,
            'sha256'
        );
        
        const decipher = crypto.createDecipherGCM(this.algorithm, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}
```

#### 7.3.2 Audit Logging

```typescript
// Comprehensive Audit System
export class AuditLogger {
    async logUserAction(action: AuditAction): Promise<void> {
        const auditEntry: AuditEntry = {
            id: generateId(),
            userId: action.userId,
            action: action.type,
            resource: action.resource,
            resourceId: action.resourceId,
            changes: action.changes,
            ipAddress: action.ipAddress,
            userAgent: action.userAgent,
            timestamp: new Date(),
            result: action.result
        };

        await this.db.insert(auditLog).values(auditEntry);
        
        // Also log to external security system if configured
        if (process.env.SECURITY_LOG_ENDPOINT) {
            await this.sendToSecuritySystem(auditEntry);
        }
    }

    async getAuditTrail(filters: AuditFilters): Promise<AuditEntry[]> {
        let query = this.db.select().from(auditLog);
        
        if (filters.userId) {
            query = query.where(eq(auditLog.userId, filters.userId));
        }
        
        if (filters.resource) {
            query = query.where(eq(auditLog.resource, filters.resource));
        }
        
        if (filters.dateRange) {
            query = query.where(
                and(
                    gte(auditLog.timestamp, filters.dateRange.start),
                    lte(auditLog.timestamp, filters.dateRange.end)
                )
            );
        }
        
        return await query
            .orderBy(desc(auditLog.timestamp))
            .limit(filters.limit || 100)
            .execute();
    }
}
```

---

## 8. Integration Architecture

### 8.1 External Service Integration

#### 8.1.1 Email Service Integration

```typescript
// SendGrid Email Service Integration
export class EmailService {
    private client: MailService;
    
    constructor() {
        this.client = new MailService();
        this.client.setApiKey(process.env.SENDGRID_API_KEY!);
    }

    async sendLeadNotification(lead: Lead, assignedUser: User): Promise<void> {
        const email = {
            to: assignedUser.email,
            from: {
                email: 'noreply@qmobility.com',
                name: 'Q-Mobility System'
            },
            templateId: 'lead-assignment-template',
            dynamicTemplateData: {
                userName: assignedUser.firstName,
                leadName: lead.fullName,
                leadPhone: lead.phone,
                vehicleType: lead.vehicleType,
                rentalDates: `${lead.rentalStartDate} to ${lead.rentalEndDate}`,
                dashboardUrl: `${process.env.FRONTEND_URL}/leads/${lead.id}`
            }
        };

        try {
            await this.client.send(email);
            console.log(`Email sent to ${assignedUser.email} for lead ${lead.id}`);
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new EmailDeliveryError(error.message);
        }
    }

    async sendWelcomeEmail(user: User, temporaryPassword: string): Promise<void> {
        const email = {
            to: user.email,
            from: {
                email: 'noreply@qmobility.com',
                name: 'Q-Mobility System'
            },
            subject: 'Welcome to Q-Mobility Lead Management System',
            html: this.generateWelcomeEmailTemplate(user, temporaryPassword)
        };

        await this.client.send(email);
    }
}
```

#### 8.1.2 Authentication Service Integration

```typescript
// Replit OAuth Integration
export class ReplitAuthService {
    private strategy: Strategy;
    
    constructor() {
        this.setupOAuthStrategy();
    }

    private async setupOAuthStrategy(): Promise<void> {
        const config = await client.discovery(
            new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
            process.env.REPL_ID!
        );

        this.strategy = new Strategy(
            {
                config,
                scope: "openid email profile offline_access",
                callbackURL: `${process.env.BASE_URL}/api/auth/callback`,
            },
            this.handleAuthCallback.bind(this)
        );

        passport.use('replit', this.strategy);
    }

    private async handleAuthCallback(
        tokens: TokenEndpointResponse & TokenEndpointResponseHelpers,
        verified: AuthenticateCallback
    ): Promise<void> {
        try {
            const claims = tokens.claims();
            
            // Upsert user in database
            let user = await this.userService.findByExternalId(claims.sub);
            
            if (!user) {
                user = await this.userService.create({
                    externalId: claims.sub,
                    email: claims.email,
                    firstName: claims.first_name,
                    lastName: claims.last_name,
                    profileImageUrl: claims.profile_image_url,
                    role: 'staff' // Default role
                });
            }

            // Update last login
            await this.userService.updateLastLogin(user.id);
            
            verified(null, user);
        } catch (error) {
            console.error('OAuth callback error:', error);
            verified(error, null);
        }
    }
}
```

### 8.2 API Gateway Pattern

#### 8.2.1 API Gateway Implementation

```typescript
// Centralized API Gateway
export class APIGateway {
    private routes: Map<string, RouteHandler> = new Map();
    private middlewares: Middleware[] = [];

    constructor() {
        this.setupGlobalMiddleware();
        this.setupRoutes();
    }

    private setupGlobalMiddleware(): void {
        // Request logging
        this.use(morgan('combined'));
        
        // Security headers
        this.use(helmet());
        
        // CORS configuration
        this.use(cors(corsOptions));
        
        // Rate limiting
        this.use(rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP'
        }));
        
        // Request size limiting
        this.use(express.json({ limit: '10mb' }));
        
        // Request validation
        this.use(this.validateRequest.bind(this));
    }

    private setupRoutes(): void {
        // Health check endpoint
        this.addRoute('GET', '/health', this.healthCheck.bind(this));
        
        // API versioning
        this.addRoute('*', '/api/v1/*', this.handleAPIv1.bind(this));
        
        // Static file serving
        this.addRoute('GET', '/*', this.serveStatic.bind(this));
    }

    private async healthCheck(req: Request, res: Response): Promise<void> {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version,
            environment: process.env.NODE_ENV,
            services: {
                database: await this.checkDatabaseHealth(),
                email: await this.checkEmailService(),
                storage: await this.checkStorageService()
            }
        };

        const isHealthy = Object.values(health.services).every(status => status);
        res.status(isHealthy ? 200 : 503).json(health);
    }
}
```

#### 8.2.2 Service Discovery

```typescript
// Service Registry for Future Microservices
export class ServiceRegistry {
    private services: Map<string, ServiceConfig> = new Map();

    registerService(name: string, config: ServiceConfig): void {
        this.services.set(name, {
            ...config,
            registeredAt: new Date(),
            lastHeartbeat: new Date()
        });
        
        console.log(`Service registered: ${name} at ${config.endpoint}`);
    }

    async discoverService(name: string): Promise<ServiceConfig | null> {
        const service = this.services.get(name);
        
        if (!service) {
            return null;
        }

        // Check if service is healthy
        const isHealthy = await this.checkServiceHealth(service);
        
        if (!isHealthy) {
            this.services.delete(name);
            return null;
        }

        return service;
    }

    private async checkServiceHealth(service: ServiceConfig): Promise<boolean> {
        try {
            const response = await fetch(`${service.endpoint}/health`, {
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.error(`Health check failed for ${service.name}:`, error);
            return false;
        }
    }
}
```

---

## 9. Deployment Architecture

### 9.1 Deployment Pipeline

#### 9.1.1 CI/CD Pipeline Architecture

```yaml
# Deployment Pipeline Configuration
name: Q-Mobility Deployment Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

stages:
  # Stage 1: Code Quality & Security
  quality_gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: ESLint analysis
        run: npm run lint
      
      - name: TypeScript compilation
        run: npm run type-check
      
      - name: Security vulnerability scan
        run: npm audit --audit-level moderate
      
      - name: Unit tests
        run: npm run test:unit
        
      - name: Integration tests
        run: npm run test:integration

  # Stage 2: Build & Package
  build:
    needs: quality_gate
    runs-on: ubuntu-latest
    steps:
      - name: Build frontend
        run: npm run build
      
      - name: Build backend
        run: npm run build:server
      
      - name: Create deployment package
        run: npm run package
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: deployment-package
          path: dist/

  # Stage 3: Deploy to Staging
  deploy_staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          npm run deploy:staging
      
      - name: Run smoke tests
        run: npm run test:smoke:staging

  # Stage 4: Deploy to Production
  deploy_production:
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          # Blue-green deployment
          npm run deploy:production
      
      - name: Health check
        run: npm run health-check:production
      
      - name: Rollback on failure
        if: failure()
        run: npm run rollback:production
```

#### 9.1.2 Environment Configuration

```typescript
// Environment-Specific Configuration
export interface EnvironmentConfig {
    name: string;
    database: DatabaseConfig;
    auth: AuthConfig;
    email: EmailConfig;
    monitoring: MonitoringConfig;
    security: SecurityConfig;
}

export const environments: Record<string, EnvironmentConfig> = {
    development: {
        name: 'development',
        database: {
            url: process.env.DEV_DATABASE_URL,
            poolSize: 5,
            ssl: false,
            debug: true
        },
        auth: {
            sessionSecret: process.env.DEV_SESSION_SECRET,
            tokenExpiry: '24h',
            requireHTTPS: false
        },
        email: {
            provider: 'sendgrid',
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: 'dev@qmobility.com'
        },
        monitoring: {
            enabled: true,
            level: 'debug',
            performance: true
        },
        security: {
            rateLimitEnabled: false,
            csrfEnabled: false,
            helmetEnabled: true
        }
    },
    
    staging: {
        name: 'staging',
        database: {
            url: process.env.STAGING_DATABASE_URL,
            poolSize: 10,
            ssl: true,
            debug: false
        },
        auth: {
            sessionSecret: process.env.STAGING_SESSION_SECRET,
            tokenExpiry: '8h',
            requireHTTPS: true
        },
        email: {
            provider: 'sendgrid',
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: 'staging@qmobility.com'
        },
        monitoring: {
            enabled: true,
            level: 'info',
            performance: true
        },
        security: {
            rateLimitEnabled: true,
            csrfEnabled: true,
            helmetEnabled: true
        }
    },
    
    production: {
        name: 'production',
        database: {
            url: process.env.DATABASE_URL,
            poolSize: 20,
            ssl: true,
            debug: false
        },
        auth: {
            sessionSecret: process.env.SESSION_SECRET,
            tokenExpiry: '4h',
            requireHTTPS: true
        },
        email: {
            provider: 'sendgrid',
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: 'noreply@qmobility.com'
        },
        monitoring: {
            enabled: true,
            level: 'warn',
            performance: true
        },
        security: {
            rateLimitEnabled: true,
            csrfEnabled: true,
            helmetEnabled: true
        }
    }
};
```

### 9.2 Blue-Green Deployment

#### 9.2.1 Deployment Strategy

```typescript
// Blue-Green Deployment Manager
export class BlueGreenDeploymentManager {
    private currentEnvironment: 'blue' | 'green' = 'blue';
    
    async deploy(packagePath: string): Promise<DeploymentResult> {
        const targetEnvironment = this.currentEnvironment === 'blue' ? 'green' : 'blue';
        
        try {
            // Step 1: Deploy to inactive environment
            console.log(`Deploying to ${targetEnvironment} environment...`);
            await this.deployToEnvironment(targetEnvironment, packagePath);
            
            // Step 2: Run health checks
            console.log(`Running health checks on ${targetEnvironment}...`);
            const healthCheck = await this.performHealthCheck(targetEnvironment);
            
            if (!healthCheck.passed) {
                throw new HealthCheckFailedError(healthCheck.errors);
            }
            
            // Step 3: Run smoke tests
            console.log(`Running smoke tests on ${targetEnvironment}...`);
            const smokeTest = await this.runSmokeTests(targetEnvironment);
            
            if (!smokeTest.passed) {
                throw new SmokeTestFailedError(smokeTest.errors);
            }
            
            // Step 4: Switch traffic
            console.log(`Switching traffic to ${targetEnvironment}...`);
            await this.switchTraffic(targetEnvironment);
            
            // Step 5: Update current environment
            this.currentEnvironment = targetEnvironment;
            
            console.log(`Deployment completed successfully to ${targetEnvironment}`);
            
            return {
                success: true,
                environment: targetEnvironment,
                timestamp: new Date(),
                version: await this.getDeployedVersion(targetEnvironment)
            };
            
        } catch (error) {
            console.error(`Deployment failed:`, error);
            
            // Automatic rollback on failure
            await this.rollback();
            
            throw error;
        }
    }
    
    async rollback(): Promise<void> {
        const previousEnvironment = this.currentEnvironment === 'blue' ? 'green' : 'blue';
        
        console.log(`Rolling back to ${previousEnvironment} environment...`);
        await this.switchTraffic(previousEnvironment);
        
        this.currentEnvironment = previousEnvironment;
        console.log(`Rollback completed to ${previousEnvironment}`);
    }
}
```

### 9.3 Database Migration Strategy

#### 9.3.1 Zero-Downtime Migration

```typescript
// Database Migration Manager
export class DatabaseMigrationManager {
    async runMigrations(): Promise<MigrationResult> {
        const pendingMigrations = await this.getPendingMigrations();
        
        if (pendingMigrations.length === 0) {
            return { success: true, migrationsRun: 0 };
        }
        
        console.log(`Found ${pendingMigrations.length} pending migrations`);
        
        for (const migration of pendingMigrations) {
            await this.runSafeMigration(migration);
        }
        
        return {
            success: true,
            migrationsRun: pendingMigrations.length
        };
    }
    
    private async runSafeMigration(migration: Migration): Promise<void> {
        console.log(`Running migration: ${migration.id}`);
        
        // Step 1: Backup current schema
        await this.createSchemaBackup(migration.id);
        
        try {
            // Step 2: Run migration in transaction
            await this.db.transaction(async (tx) => {
                await migration.up(tx);
                await this.recordMigration(tx, migration.id);
            });
            
            // Step 3: Verify migration
            await this.verifyMigration(migration);
            
            console.log(`Migration completed: ${migration.id}`);
            
        } catch (error) {
            console.error(`Migration failed: ${migration.id}`, error);
            
            // Step 4: Rollback on failure
            await this.rollbackMigration(migration);
            
            throw error;
        }
    }
}
```

---

## 10. Monitoring and Observability

### 10.1 Application Monitoring

#### 10.1.1 Performance Monitoring

```typescript
// Performance Monitoring Service
export class PerformanceMonitoringService {
    private metrics: Map<string, MetricCollector> = new Map();
    
    constructor() {
        this.setupMetricCollectors();
        this.startMetricCollection();
    }
    
    private setupMetricCollectors(): void {
        // Response time metrics
        this.metrics.set('response_time', new ResponseTimeCollector());
        
        // Database query metrics
        this.metrics.set('db_queries', new DatabaseQueryCollector());
        
        // Memory usage metrics
        this.metrics.set('memory_usage', new MemoryUsageCollector());
        
        // CPU usage metrics
        this.metrics.set('cpu_usage', new CPUUsageCollector());
        
        // User activity metrics
        this.metrics.set('user_activity', new UserActivityCollector());
    }
    
    async collectMetrics(): Promise<PerformanceMetrics> {
        const timestamp = new Date();
        const metrics: PerformanceMetrics = {
            timestamp,
            responseTime: await this.getResponseTimeMetrics(),
            databasePerformance: await this.getDatabaseMetrics(),
            systemResources: await this.getSystemResourceMetrics(),
            userActivity: await this.getUserActivityMetrics()
        };
        
        // Store metrics for analysis
        await this.storeMetrics(metrics);
        
        // Check for alerts
        await this.checkAlerts(metrics);
        
        return metrics;
    }
    
    private async checkAlerts(metrics: PerformanceMetrics): Promise<void> {
        const alerts: Alert[] = [];
        
        // Response time alerts
        if (metrics.responseTime.average > 2000) {
            alerts.push({
                type: 'performance',
                severity: 'warning',
                message: `Average response time: ${metrics.responseTime.average}ms`,
                threshold: 2000
            });
        }
        
        // Database performance alerts
        if (metrics.databasePerformance.slowQueries > 5) {
            alerts.push({
                type: 'database',
                severity: 'critical',
                message: `${metrics.databasePerformance.slowQueries} slow queries detected`,
                threshold: 5
            });
        }
        
        // Memory usage alerts
        if (metrics.systemResources.memoryUsage > 85) {
            alerts.push({
                type: 'resource',
                severity: 'warning',
                message: `High memory usage: ${metrics.systemResources.memoryUsage}%`,
                threshold: 85
            });
        }
        
        // Send alerts if any
        if (alerts.length > 0) {
            await this.sendAlerts(alerts);
        }
    }
}
```

#### 10.1.2 Error Tracking

```typescript
// Error Tracking and Reporting
export class ErrorTrackingService {
    private errorBuffer: ErrorReport[] = [];
    private readonly bufferSize = 100;
    
    captureError(error: Error, context: ErrorContext): void {
        const errorReport: ErrorReport = {
            id: generateId(),
            timestamp: new Date(),
            message: error.message,
            stack: error.stack,
            type: error.constructor.name,
            context: {
                userId: context.userId,
                requestId: context.requestId,
                endpoint: context.endpoint,
                userAgent: context.userAgent,
                ipAddress: context.ipAddress,
                additionalData: context.additionalData
            },
            fingerprint: this.generateFingerprint(error),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version
        };
        
        // Add to buffer
        this.errorBuffer.push(errorReport);
        
        // Maintain buffer size
        if (this.errorBuffer.length > this.bufferSize) {
            this.errorBuffer.shift();
        }
        
        // Log error
        console.error('Error captured:', errorReport);
        
        // Send to external error tracking service
        this.sendToErrorTrackingService(errorReport);
        
        // Check for critical errors
        if (this.isCriticalError(error)) {
            this.handleCriticalError(errorReport);
        }
    }
    
    private generateFingerprint(error: Error): string {
        const key = `${error.constructor.name}:${error.message}:${this.getStackHash(error.stack)}`;
        return crypto.createHash('md5').update(key).digest('hex');
    }
    
    private isCriticalError(error: Error): boolean {
        const criticalErrors = [
            'DatabaseConnectionError',
            'AuthenticationServiceError',
            'FileSystemError',
            'SecurityViolationError'
        ];
        
        return criticalErrors.includes(error.constructor.name);
    }
    
    private async handleCriticalError(errorReport: ErrorReport): Promise<void> {
        // Send immediate alert
        await this.sendCriticalAlert(errorReport);
        
        // Log to security monitoring
        await this.logSecurityEvent(errorReport);
        
        // Trigger incident response if needed
        if (this.shouldTriggerIncidentResponse(errorReport)) {
            await this.triggerIncidentResponse(errorReport);
        }
    }
}
```

### 10.2 Business Intelligence

#### 10.2.1 Analytics Dashboard

```typescript
// Real-time Analytics Service
export class AnalyticsService {
    async generateDashboardData(user: User, timeRange: TimeRange): Promise<DashboardData> {
        const data: DashboardData = {
            timestamp: new Date(),
            timeRange,
            overview: await this.getOverviewMetrics(user, timeRange),
            leadMetrics: await this.getLeadMetrics(user, timeRange),
            performanceMetrics: await this.getPerformanceMetrics(user, timeRange),
            trendsData: await this.getTrendsData(user, timeRange)
        };
        
        return data;
    }
    
    private async getOverviewMetrics(user: User, timeRange: TimeRange): Promise<OverviewMetrics> {
        const baseQuery = this.getBaseLeadQuery(user);
        const timeFilter = this.getTimeFilter(timeRange);
        
        const [
            totalLeads,
            newLeads,
            convertedLeads,
            revenue
        ] = await Promise.all([
            baseQuery.where(timeFilter).count(),
            baseQuery.where(and(eq(leads.status, 'new'), timeFilter)).count(),
            baseQuery.where(and(eq(leads.status, 'converted'), timeFilter)).count(),
            this.calculateRevenue(user, timeRange)
        ]);
        
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
        
        return {
            totalLeads,
            newLeads,
            convertedLeads,
            conversionRate,
            revenue
        };
    }
    
    private async getLeadMetrics(user: User, timeRange: TimeRange): Promise<LeadMetrics> {
        const statusDistribution = await this.getStatusDistribution(user, timeRange);
        const sourceDistribution = await this.getSourceDistribution(user, timeRange);
        const responseTimeMetrics = await this.getResponseTimeMetrics(user, timeRange);
        
        return {
            statusDistribution,
            sourceDistribution,
            responseTimeMetrics,
            topPerformers: await this.getTopPerformers(user, timeRange)
        };
    }
    
    private async getTrendsData(user: User, timeRange: TimeRange): Promise<TrendsData> {
        const interval = this.getIntervalForTimeRange(timeRange);
        
        const leadTrends = await this.db
            .select({
                date: sql`DATE_TRUNC(${interval}, created_at)`,
                count: sql`COUNT(*)`,
                conversions: sql`COUNT(*) FILTER (WHERE status = 'converted')`
            })
            .from(leads)
            .where(
                and(
                    this.getBaseLeadFilter(user),
                    this.getTimeFilter(timeRange)
                )
            )
            .groupBy(sql`DATE_TRUNC(${interval}, created_at)`)
            .orderBy(sql`DATE_TRUNC(${interval}, created_at)`);
        
        return {
            leadTrends: leadTrends.map(trend => ({
                date: trend.date,
                leads: trend.count,
                conversions: trend.conversions,
                conversionRate: trend.count > 0 ? (trend.conversions / trend.count) * 100 : 0
            }))
        };
    }
}
```

### 10.3 System Health Monitoring

#### 10.3.1 Health Check Framework

```typescript
// Comprehensive Health Check System
export class HealthCheckService {
    private checks: Map<string, HealthCheck> = new Map();
    
    constructor() {
        this.registerHealthChecks();
    }
    
    private registerHealthChecks(): void {
        // Database connectivity
        this.checks.set('database', {
            name: 'Database Connection',
            check: this.checkDatabase.bind(this),
            timeout: 5000,
            critical: true
        });
        
        // Email service
        this.checks.set('email', {
            name: 'Email Service',
            check: this.checkEmailService.bind(this),
            timeout: 10000,
            critical: false
        });
        
        // File storage
        this.checks.set('storage', {
            name: 'File Storage',
            check: this.checkFileStorage.bind(this),
            timeout: 5000,
            critical: false
        });
        
        // Memory usage
        this.checks.set('memory', {
            name: 'Memory Usage',
            check: this.checkMemoryUsage.bind(this),
            timeout: 1000,
            critical: true
        });
        
        // CPU usage
        this.checks.set('cpu', {
            name: 'CPU Usage',
            check: this.checkCPUUsage.bind(this),
            timeout: 1000,
            critical: false
        });
    }
    
    async performHealthCheck(): Promise<HealthCheckResult> {
        const results: Map<string, CheckResult> = new Map();
        const startTime = Date.now();
        
        // Run all health checks in parallel
        const checkPromises = Array.from(this.checks.entries()).map(
            async ([name, check]) => {
                try {
                    const result = await Promise.race([
                        check.check(),
                        this.timeout(check.timeout)
                    ]);
                    
                    results.set(name, {
                        name: check.name,
                        status: 'healthy',
                        responseTime: Date.now() - startTime,
                        details: result
                    });
                } catch (error) {
                    results.set(name, {
                        name: check.name,
                        status: 'unhealthy',
                        responseTime: Date.now() - startTime,
                        error: error.message
                    });
                }
            }
        );
        
        await Promise.all(checkPromises);
        
        // Determine overall health
        const overallHealth = this.determineOverallHealth(results);
        
        return {
            status: overallHealth,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            checks: Object.fromEntries(results)
        };
    }
    
    private determineOverallHealth(results: Map<string, CheckResult>): 'healthy' | 'degraded' | 'unhealthy' {
        let hasUnhealthy = false;
        let hasDegraded = false;
        
        for (const [name, result] of results) {
            const check = this.checks.get(name)!;
            
            if (result.status === 'unhealthy') {
                if (check.critical) {
                    return 'unhealthy';
                } else {
                    hasDegraded = true;
                }
            }
        }
        
        return hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';
    }
}
```

---

## 11. Performance Architecture

### 11.1 Frontend Performance

#### 11.1.1 Code Splitting Strategy

```typescript
// Dynamic Import Strategy for Code Splitting
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/ui/loading';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/dashboard'));
const LeadManagement = lazy(() => import('@/pages/lead-management'));
const Analytics = lazy(() => import('@/pages/analytics'));
const AdminPanel = lazy(() => import('@/pages/admin'));

// Route-based code splitting
export function AppRouter() {
    return (
        <Suspense fallback={<Loading />}>
            <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/leads" component={LeadManagement} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/admin" component={AdminPanel} />
            </Switch>
        </Suspense>
    );
}

// Component-level lazy loading
const HeavyChart = lazy(() => import('@/components/heavy-chart'));

export function AnalyticsPage() {
    const [showChart, setShowChart] = useState(false);
    
    return (
        <div>
            <h1>Analytics</h1>
            <button onClick={() => setShowChart(true)}>
                Load Chart
            </button>
            
            {showChart && (
                <Suspense fallback={<div>Loading chart...</div>}>
                    <HeavyChart />
                </Suspense>
            )}
        </div>
    );
}
```

#### 11.1.2 Caching Strategy

```typescript
// TanStack Query Caching Configuration
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 5 minutes
            staleTime: 5 * 60 * 1000,
            
            // Keep cached data for 10 minutes after component unmount
            cacheTime: 10 * 60 * 1000,
            
            // Retry failed requests 3 times
            retry: 3,
            
            // Background refetch on window focus
            refetchOnWindowFocus: true,
            
            // Background refetch on network reconnect
            refetchOnReconnect: true
        },
        mutations: {
            // Retry failed mutations once
            retry: 1
        }
    }
});

// Prefetching strategy
export function usePrefetchStrategy() {
    const queryClient = useQueryClient();
    
    useEffect(() => {
        // Prefetch likely-to-be-needed data
        queryClient.prefetchQuery({
            queryKey: ['/api/leads/stats'],
            queryFn: () => fetch('/api/leads/stats').then(res => res.json())
        });
        
        // Prefetch user's assigned leads
        queryClient.prefetchQuery({
            queryKey: ['/api/leads', { assigned: true }],
            queryFn: () => fetch('/api/leads?assigned=true').then(res => res.json())
        });
    }, [queryClient]);
}

// Optimistic updates for better UX
export function useOptimisticLeadUpdate() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateLead,
        onMutate: async (updatedLead) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['/api/leads'] });
            
            // Snapshot previous value
            const previousLeads = queryClient.getQueryData(['/api/leads']);
            
            // Optimistically update
            queryClient.setQueryData(['/api/leads'], (old: any) => ({
                ...old,
                leads: old.leads.map((lead: Lead) =>
                    lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
                )
            }));
            
            return { previousLeads };
        },
        onError: (err, newLead, context) => {
            // Rollback on error
            queryClient.setQueryData(['/api/leads'], context?.previousLeads);
        },
        onSettled: () => {
            // Always refetch after mutation
            queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        }
    });
}
```

### 11.2 Backend Performance

#### 11.2.1 Database Optimization

```typescript
// Connection Pool Optimization
export const createDatabasePool = () => {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20, // Maximum connections in pool
        min: 5,  // Minimum connections in pool
        idle: 10000, // Close connections after 10 seconds of inactivity
        acquire: 60000, // Max time to wait for connection
        evict: 1000, // How often to run eviction
        handleDisconnects: true,
        retry: {
            max: 3
        }
    });
};

// Query optimization with prepared statements
export class OptimizedLeadRepository {
    private preparedStatements: Map<string, PreparedStatement> = new Map();
    
    constructor(private db: Database) {
        this.preparStatements();
    }
    
    private preparStatements(): void {
        // Prepare frequently used queries
        this.preparedStatements.set('findLeadsByStatus', 
            this.db.prepare(sql`
                SELECT * FROM leads 
                WHERE status = $1 AND branch_id = $2 
                ORDER BY created_at DESC 
                LIMIT $3 OFFSET $4
            `)
        );
        
        this.preparedStatements.set('getLeadStats',
            this.db.prepare(sql`
                SELECT 
                    status,
                    COUNT(*) as count,
                    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours
                FROM leads 
                WHERE branch_id = $1 AND created_at >= $2
                GROUP BY status
            `)
        );
    }
    
    async findLeadsByStatus(
        status: string, 
        branchId: string, 
        limit: number, 
        offset: number
    ): Promise<Lead[]> {
        const stmt = this.preparedStatements.get('findLeadsByStatus')!;
        return await stmt.all(status, branchId, limit, offset);
    }
}

// Batch operations for better performance
export class BatchOperationService {
    async batchUpdateLeadStatus(
        updates: Array<{ id: string; status: string }>
    ): Promise<void> {
        // Use transaction for batch operations
        await this.db.transaction(async (tx) => {
            // Batch updates in chunks of 100
            const chunkSize = 100;
            
            for (let i = 0; i < updates.length; i += chunkSize) {
                const chunk = updates.slice(i, i + chunkSize);
                
                // Build batch update query
                const values = chunk.map(update => 
                    `('${update.id}', '${update.status}')`
                ).join(',');
                
                await tx.execute(sql`
                    UPDATE leads 
                    SET status = updates.status, updated_at = NOW()
                    FROM (VALUES ${values}) AS updates(id, status)
                    WHERE leads.id = updates.id
                `);
            }
        });
    }
}
```

#### 11.2.2 Caching Layer

```typescript
// Multi-Level Caching Strategy
export class CachingService {
    private memoryCache: Map<string, CacheEntry> = new Map();
    private readonly maxMemoryCacheSize = 1000;
    private readonly defaultTTL = 300000; // 5 minutes
    
    async get<T>(key: string): Promise<T | null> {
        // Level 1: Memory cache
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && !this.isExpired(memoryEntry)) {
            return memoryEntry.value as T;
        }
        
        // Level 2: Database cache table (for distributed caching)
        const dbEntry = await this.getFromDatabaseCache(key);
        if (dbEntry && !this.isExpired(dbEntry)) {
            // Store in memory cache for next time
            this.setInMemoryCache(key, dbEntry.value, dbEntry.expiresAt);
            return dbEntry.value as T;
        }
        
        return null;
    }
    
    async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
        const expiresAt = new Date(Date.now() + ttl);
        
        // Store in memory cache
        this.setInMemoryCache(key, value, expiresAt);
        
        // Store in database cache for persistence
        await this.setInDatabaseCache(key, value, expiresAt);
    }
    
    private setInMemoryCache(key: string, value: any, expiresAt: Date): void {
        // Implement LRU eviction
        if (this.memoryCache.size >= this.maxMemoryCacheSize) {
            const oldestKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(oldestKey);
        }
        
        this.memoryCache.set(key, {
            value,
            expiresAt,
            createdAt: new Date()
        });
    }
    
    async invalidate(pattern: string): Promise<void> {
        // Clear from memory cache
        for (const key of this.memoryCache.keys()) {
            if (key.includes(pattern)) {
                this.memoryCache.delete(key);
            }
        }
        
        // Clear from database cache
        await this.clearDatabaseCacheByPattern(pattern);
    }
}

// Cache-aside pattern for lead data
export class CachedLeadService {
    constructor(
        private leadRepository: LeadRepository,
        private cache: CachingService
    ) {}
    
    async getLeadById(id: string): Promise<Lead | null> {
        const cacheKey = `lead:${id}`;
        
        // Try cache first
        let lead = await this.cache.get<Lead>(cacheKey);
        
        if (!lead) {
            // Cache miss - fetch from database
            lead = await this.leadRepository.findById(id);
            
            if (lead) {
                // Cache for 10 minutes
                await this.cache.set(cacheKey, lead, 600000);
            }
        }
        
        return lead;
    }
    
    async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
        // Update database
        const updatedLead = await this.leadRepository.update(id, updates);
        
        // Invalidate cache
        await this.cache.invalidate(`lead:${id}`);
        
        // Invalidate related caches
        await this.cache.invalidate('leads:stats');
        await this.cache.invalidate('leads:list');
        
        return updatedLead;
    }
}
```

---

## 12. Disaster Recovery

### 12.1 Backup Strategy

#### 12.1.1 Automated Backup System

```typescript
// Comprehensive Backup Management
export class BackupManager {
    private backupScheduler: NodeCron;
    
    constructor() {
        this.setupBackupSchedules();
    }
    
    private setupBackupSchedules(): void {
        // Daily database backup at 2 AM
        cron.schedule('0 2 * * *', async () => {
            await this.performDatabaseBackup('daily');
        });
        
        // Weekly full backup on Sundays at 1 AM
        cron.schedule('0 1 * * 0', async () => {
            await this.performFullBackup();
        });
        
        // Hourly incremental backup during business hours
        cron.schedule('0 8-18 * * 1-5', async () => {
            await this.performIncrementalBackup();
        });
    }
    
    async performDatabaseBackup(type: 'daily' | 'weekly' | 'incremental'): Promise<BackupResult> {
        const timestamp = new Date().toISOString();
        const backupId = `${type}-${timestamp}`;
        
        try {
            console.log(`Starting ${type} database backup: ${backupId}`);
            
            // Create backup
            const backupPath = await this.createDatabaseDump(backupId);
            
            // Compress backup
            const compressedPath = await this.compressBackup(backupPath);
            
            // Encrypt backup
            const encryptedPath = await this.encryptBackup(compressedPath);
            
            // Upload to cloud storage
            const cloudPath = await this.uploadToCloudStorage(encryptedPath, backupId);
            
            // Verify backup integrity
            await this.verifyBackupIntegrity(cloudPath);
            
            // Clean up local files
            await this.cleanupLocalFiles([backupPath, compressedPath, encryptedPath]);
            
            // Record backup metadata
            await this.recordBackupMetadata({
                id: backupId,
                type,
                timestamp: new Date(timestamp),
                size: await this.getFileSize(cloudPath),
                cloudPath,
                verified: true
            });
            
            console.log(`Backup completed successfully: ${backupId}`);
            
            return {
                success: true,
                backupId,
                cloudPath,
                size: await this.getFileSize(cloudPath)
            };
            
        } catch (error) {
            console.error(`Backup failed: ${backupId}`, error);
            
            // Send alert on backup failure
            await this.sendBackupAlert(backupId, error);
            
            throw error;
        }
    }
    
    private async createDatabaseDump(backupId: string): Promise<string> {
        const backupPath = `/tmp/backup-${backupId}.sql`;
        
        await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${backupPath}`);
        
        return backupPath;
    }
    
    private async verifyBackupIntegrity(backupPath: string): Promise<boolean> {
        try {
            // Test restore to temporary database
            const testDbName = `test_restore_${Date.now()}`;
            
            await execAsync(`createdb ${testDbName}`);
            await execAsync(`pg_restore -d ${testDbName} ${backupPath}`);
            
            // Verify data integrity
            const sampleQuery = await this.db.execute(
                sql`SELECT COUNT(*) FROM leads`,
                { database: testDbName }
            );
            
            // Clean up test database
            await execAsync(`dropdb ${testDbName}`);
            
            return sampleQuery.rows.length > 0;
            
        } catch (error) {
            console.error('Backup verification failed:', error);
            return false;
        }
    }
}
```

### 12.2 Recovery Procedures

#### 12.2.1 Point-in-Time Recovery

```typescript
// Point-in-Time Recovery System
export class RecoveryManager {
    async performPointInTimeRecovery(
        targetTimestamp: Date,
        recoveryType: 'full' | 'selective'
    ): Promise<RecoveryResult> {
        const recoveryId = `recovery-${Date.now()}`;
        
        try {
            console.log(`Starting point-in-time recovery to: ${targetTimestamp}`);
            
            // Step 1: Find appropriate backup
            const baseBackup = await this.findBaseBackup(targetTimestamp);
            if (!baseBackup) {
                throw new Error('No suitable backup found');
            }
            
            // Step 2: Create recovery environment
            const recoveryEnv = await this.createRecoveryEnvironment(recoveryId);
            
            // Step 3: Restore base backup
            await this.restoreBackup(baseBackup, recoveryEnv);
            
            // Step 4: Apply WAL files up to target timestamp
            await this.applyWALFiles(recoveryEnv, baseBackup.timestamp, targetTimestamp);
            
            // Step 5: Verify data consistency
            const consistencyCheck = await this.verifyDataConsistency(recoveryEnv);
            if (!consistencyCheck.passed) {
                throw new Error('Data consistency check failed');
            }
            
            // Step 6: Switch to recovered database (if full recovery)
            if (recoveryType === 'full') {
                await this.switchToRecoveredDatabase(recoveryEnv);
            }
            
            console.log(`Recovery completed successfully: ${recoveryId}`);
            
            return {
                success: true,
                recoveryId,
                targetTimestamp,
                actualTimestamp: consistencyCheck.timestamp,
                dataLoss: this.calculateDataLoss(targetTimestamp, consistencyCheck.timestamp)
            };
            
        } catch (error) {
            console.error(`Recovery failed: ${recoveryId}`, error);
            
            // Clean up failed recovery
            await this.cleanupFailedRecovery(recoveryId);
            
            throw error;
        }
    }
    
    async performSelectiveRecovery(
        targetTimestamp: Date,
        tables: string[]
    ): Promise<RecoveryResult> {
        // Similar to point-in-time recovery but only for specific tables
        const recoveryId = `selective-recovery-${Date.now()}`;
        
        try {
            // Create temporary recovery database
            const tempDb = await this.createTemporaryDatabase(recoveryId);
            
            // Restore full backup to temporary database
            const backup = await this.findBaseBackup(targetTimestamp);
            await this.restoreBackup(backup, tempDb);
            
            // Apply WAL files
            await this.applyWALFiles(tempDb, backup.timestamp, targetTimestamp);
            
            // Export specific tables
            for (const table of tables) {
                await this.exportTable(tempDb, table);
                await this.importTable(process.env.DATABASE_URL, table);
            }
            
            // Clean up temporary database
            await this.dropTemporaryDatabase(tempDb);
            
            return {
                success: true,
                recoveryId,
                targetTimestamp,
                tablesRecovered: tables
            };
            
        } catch (error) {
            console.error(`Selective recovery failed: ${recoveryId}`, error);
            throw error;
        }
    }
}
```

### 12.3 Business Continuity

#### 12.3.1 Failover Strategy

```typescript
// Automated Failover System
export class FailoverManager {
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private isFailoverInProgress = false;
    
    constructor() {
        this.startHealthMonitoring();
    }
    
    private startHealthMonitoring(): void {
        this.healthCheckInterval = setInterval(async () => {
            if (!this.isFailoverInProgress) {
                await this.performHealthCheck();
            }
        }, 30000); // Check every 30 seconds
    }
    
    private async performHealthCheck(): Promise<void> {
        try {
            const healthResult = await this.checkSystemHealth();
            
            if (!healthResult.isHealthy) {
                console.warn('System health check failed:', healthResult.issues);
                
                if (this.shouldTriggerFailover(healthResult)) {
                    await this.initiateFailover(healthResult);
                }
            }
        } catch (error) {
            console.error('Health check error:', error);
        }
    }
    
    private shouldTriggerFailover(healthResult: HealthResult): boolean {
        const criticalIssues = healthResult.issues.filter(issue => issue.critical);
        
        // Trigger failover if:
        // 1. Database is unreachable for more than 2 minutes
        // 2. More than 50% of API endpoints are failing
        // 3. Memory usage exceeds 95%
        // 4. Critical service dependencies are down
        
        return criticalIssues.length > 0 && (
            healthResult.databaseDownTime > 120000 || // 2 minutes
            healthResult.apiFailureRate > 0.5 ||
            healthResult.memoryUsage > 95 ||
            healthResult.criticalServicesDown > 0
        );
    }
    
    async initiateFailover(healthResult: HealthResult): Promise<FailoverResult> {
        if (this.isFailoverInProgress) {
            throw new Error('Failover already in progress');
        }
        
        this.isFailoverInProgress = true;
        const failoverId = `failover-${Date.now()}`;
        
        try {
            console.log(`Initiating failover: ${failoverId}`);
            
            // Step 1: Send critical alert
            await this.sendCriticalAlert(failoverId, healthResult);
            
            // Step 2: Activate maintenance mode
            await this.activateMaintenanceMode();
            
            // Step 3: Attempt automatic recovery
            const recoveryResult = await this.attemptAutomaticRecovery(healthResult);
            
            if (recoveryResult.success) {
                // Recovery successful - resume normal operations
                await this.deactivateMaintenanceMode();
                
                console.log(`Automatic recovery successful: ${failoverId}`);
                
                return {
                    success: true,
                    failoverId,
                    recoveryType: 'automatic',
                    downtime: recoveryResult.downtime
                };
            }
            
            // Step 4: If automatic recovery fails, initiate manual failover procedures
            await this.initiateManualFailoverProcedures(failoverId, healthResult);
            
            return {
                success: false,
                failoverId,
                recoveryType: 'manual',
                requiresIntervention: true
            };
            
        } catch (error) {
            console.error(`Failover failed: ${failoverId}`, error);
            throw error;
        } finally {
            this.isFailoverInProgress = false;
        }
    }
    
    private async attemptAutomaticRecovery(healthResult: HealthResult): Promise<RecoveryAttemptResult> {
        const startTime = Date.now();
        
        // Try different recovery strategies based on the type of failure
        
        if (healthResult.databaseIssues.length > 0) {
            // Database recovery
            const dbRecovery = await this.attemptDatabaseRecovery();
            if (dbRecovery.success) {
                return { success: true, downtime: Date.now() - startTime };
            }
        }
        
        if (healthResult.memoryUsage > 95) {
            // Memory cleanup
            const memoryRecovery = await this.attemptMemoryCleanup();
            if (memoryRecovery.success) {
                return { success: true, downtime: Date.now() - startTime };
            }
        }
        
        if (healthResult.apiFailureRate > 0.5) {
            // Application restart
            const appRecovery = await this.attemptApplicationRestart();
            if (appRecovery.success) {
                return { success: true, downtime: Date.now() - startTime };
            }
        }
        
        return { success: false, downtime: Date.now() - startTime };
    }
}
```

---

## Appendices

### Appendix A: Technology Stack Details

#### A.1 Frontend Technologies
- **React 18**: Latest React version with concurrent features
- **TypeScript 4.9+**: Static typing for JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: High-quality React component library
- **TanStack Query**: Server state management
- **React Hook Form**: Form library with validation
- **Wouter**: Lightweight routing library

#### A.2 Backend Technologies
- **Node.js 18+**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript development
- **Drizzle ORM**: Type-safe database toolkit
- **PostgreSQL**: Relational database management system
- **Passport.js**: Authentication middleware
- **Helmet**: Security middleware for Express
- **Winston**: Logging library

#### A.3 Development Tools
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Husky**: Git hooks for code quality
- **GitHub Actions**: CI/CD pipeline

### Appendix B: Database Schema Reference

#### B.1 Complete Schema Diagram
[Detailed database schema with all tables, relationships, indexes, and constraints]

#### B.2 Migration Scripts
[Complete set of database migration scripts for schema evolution]

#### B.3 Seed Data Scripts
[Scripts for populating development and testing databases with sample data]

### Appendix C: API Documentation

#### C.1 Authentication Endpoints
[Complete REST API documentation for authentication services]

#### C.2 Lead Management Endpoints
[Complete REST API documentation for lead management operations]

#### C.3 Analytics Endpoints
[Complete REST API documentation for analytics and reporting]

### Appendix D: Security Specifications

#### D.1 Security Requirements Matrix
[Detailed security requirements mapped to implementation details]

#### D.2 Threat Model
[Comprehensive threat analysis and mitigation strategies]

#### D.3 Compliance Requirements
[Data protection and regulatory compliance specifications]

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Next Review: Quarterly*  
*Document Owner: Q-Mobility Architecture Team*  
*Classification: Internal Use Only*
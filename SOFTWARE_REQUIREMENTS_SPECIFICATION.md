# Q-Mobility Lead Management Platform
## Software Requirements Specification (SRS)

### Document Information
- **Document Version**: 2.0 - ✅ PRODUCTION READY
- **Date**: August 2025 (Updated)
- **Project**: Q-Mobility Lead Management Platform
- **Classification**: Internal Use
- **Document Owner**: Q-Mobility Development Team
- **Stakeholders**: Development Team, QA Team, Business Analysts, Product Owner

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture](#6-system-architecture)
7. [Database Requirements](#7-database-requirements)
8. [Security Requirements](#8-security-requirements)
9. [Quality Assurance](#9-quality-assurance)
10. [Deployment Requirements](#10-deployment-requirements)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a detailed technical specification for the Q-Mobility Lead Management Platform. It defines the functional and non-functional requirements, system architecture, and technical constraints for the development team.

### 1.2 Document Scope
This document covers:
- Detailed functional requirements for all system components
- Technical architecture and design specifications
- Database schema and data requirements
- User interface specifications
- Integration requirements
- Security and performance specifications

### 1.3 Intended Audience
- Development Team
- Quality Assurance Team
- System Architects
- Database Administrators
- DevOps Engineers
- Project Managers

### 1.4 Product Overview
The Q-Mobility Lead Management Platform is a web-based application built using modern technologies:
- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration
- **Deployment**: Replit hosting platform

---

## 2. Overall Description

### 2.1 Product Perspective
The system is a standalone web application that integrates with existing Q-Mobility infrastructure:
- **External Systems**: Fleet management system, email services, SMS gateway
- **User Access**: Web browser-based interface with mobile responsiveness
- **Data Storage**: Centralized PostgreSQL database
- **Hosting**: Cloud-based hosting on Replit platform

### 2.2 Product Functions
Major system functions include:
- Lead capture and management
- User authentication and authorization
- Real-time analytics and reporting
- Fleet integration and vehicle management
- Multi-branch operations support
- Data export and reporting
- System administration

### 2.3 User Classes and Characteristics

#### Administrator
- **Technical Expertise**: High
- **System Usage**: Daily, administrative tasks
- **Key Functions**: System configuration, user management, global reporting

#### Branch Manager
- **Technical Expertise**: Medium
- **System Usage**: Daily, operational oversight
- **Key Functions**: Branch operations, staff management, local reporting

#### Sales Staff
- **Technical Expertise**: Low to Medium
- **System Usage**: Daily, lead processing
- **Key Functions**: Lead management, customer communication, quote generation

#### Branch Staff
- **Technical Expertise**: Low
- **System Usage**: Daily, data entry and basic operations
- **Key Functions**: Lead entry, basic reporting, customer service

### 2.4 Operating Environment

#### Client Environment
- **Operating Systems**: Windows 10+, macOS 10.14+, iOS 12+, Android 8+
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Screen Resolution**: Minimum 1024x768, optimized for 1920x1080
- **Network**: Broadband internet connection (minimum 1 Mbps)

#### Server Environment
- **Platform**: Replit cloud hosting
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL 14+
- **Storage**: Cloud-based with automatic backups
- **CDN**: Content delivery network for static assets

---

## 3. System Features

### 3.1 User Authentication and Authorization

#### 3.1.1 Feature Description
Secure user authentication system with role-based access control supporting multiple user types and permission levels.

#### 3.1.2 Functional Requirements

##### FR-AUTH-001: User Login
- **Input**: Email address and password
- **Processing**: 
  - Validate credentials against user database
  - Generate secure session token
  - Log authentication attempt
- **Output**: Authenticated user session or error message
- **Priority**: High

##### FR-AUTH-002: Session Management
- **Input**: User session token
- **Processing**:
  - Validate session token
  - Refresh token if near expiration
  - Maintain session state
- **Output**: Valid session or redirect to login
- **Priority**: High

##### FR-AUTH-003: Role-Based Access Control
- **Input**: User role and requested resource
- **Processing**:
  - Check user permissions against resource requirements
  - Apply role hierarchy rules
  - Log access attempts
- **Output**: Allow access or display access denied message
- **Priority**: High

##### FR-AUTH-004: Password Security
- **Input**: User password
- **Processing**:
  - Hash password using bcrypt
  - Enforce password complexity rules
  - Track failed login attempts
- **Output**: Secure password storage or validation result
- **Priority**: High

#### 3.1.3 Business Rules
- Maximum 3 failed login attempts before account lockout
- Session timeout after 8 hours of inactivity
- Password must contain minimum 8 characters with mixed case and numbers
- Role hierarchy: Admin > Manager > Staff

### 3.2 Lead Management System

#### 3.2.1 Feature Description
Comprehensive lead lifecycle management from initial capture through conversion, including automated routing, status tracking, and communication logging.

#### 3.2.2 Functional Requirements

##### FR-LEAD-001: Lead Creation
- **Input**: Customer information (name, email, phone, rental requirements)
- **Processing**:
  - Validate required fields
  - Check for duplicate leads
  - Generate unique lead ID
  - Apply automatic categorization
  - Trigger assignment workflow
- **Output**: Created lead record with unique ID
- **Priority**: High

##### FR-LEAD-002: Lead Assignment
- **Input**: Lead details and staff availability
- **Processing**:
  - Apply assignment rules based on location, vehicle type, staff workload
  - Consider staff specializations and availability
  - Send notification to assigned staff
  - Log assignment activity
- **Output**: Lead assigned to specific staff member
- **Priority**: High

##### FR-LEAD-003: Lead Status Management
- **Input**: Lead ID and new status
- **Processing**:
  - Validate status transition rules
  - Update lead record with timestamp
  - Trigger any automated workflows
  - Send notifications as required
- **Output**: Updated lead status
- **Priority**: High

##### FR-LEAD-004: Communication Tracking
- **Input**: Communication details (type, content, timestamp)
- **Processing**:
  - Create communication record linked to lead
  - Update last contact timestamp
  - Track communication frequency
  - Store communication content
- **Output**: Logged communication record
- **Priority**: Medium

##### FR-LEAD-005: Lead Search and Filtering
- **Input**: Search criteria (name, phone, email, date range, status)
- **Processing**:
  - Query database with provided criteria
  - Apply user access permissions
  - Sort results by relevance
  - Paginate results for performance
- **Output**: Filtered lead list
- **Priority**: Medium

#### 3.2.3 Lead Status Workflow
```
New → Contacted → Quoted → Negotiating → Converted
  ↓       ↓         ↓         ↓          ↓
Declined ← Declined ← Declined ← Declined ← Completed
```

#### 3.2.4 Business Rules
- Lead must have minimum required fields: name, phone, rental dates
- Lead ownership can only be changed by managers or above
- Leads older than 30 days without activity are marked as stale
- High-priority leads require response within 30 minutes

### 3.3 Analytics and Reporting

#### 3.3.1 Feature Description
Real-time analytics dashboard and comprehensive reporting system providing insights into lead performance, conversion rates, and operational metrics.

#### 3.3.2 Functional Requirements

##### FR-ANALYTICS-001: Real-Time Dashboard
- **Input**: User role and date range
- **Processing**:
  - Aggregate data from multiple sources
  - Calculate KPIs and metrics
  - Generate visualizations
  - Apply role-based data filtering
- **Output**: Interactive dashboard with charts and metrics
- **Priority**: High

##### FR-ANALYTICS-002: Performance Metrics
- **Input**: Date range and metric type
- **Processing**:
  - Calculate conversion rates by various dimensions
  - Analyze response times and processing durations
  - Track staff performance metrics
  - Generate trend analysis
- **Output**: Performance reports and visualizations
- **Priority**: High

##### FR-ANALYTICS-003: Custom Reports
- **Input**: Report parameters and filters
- **Processing**:
  - Query database with specified criteria
  - Format data according to report template
  - Apply calculations and aggregations
  - Generate export file if requested
- **Output**: Formatted report or export file
- **Priority**: Medium

##### FR-ANALYTICS-004: Data Export
- **Input**: Export criteria and format selection
- **Processing**:
  - Extract data based on criteria
  - Format data for selected export type (Excel, CSV, PDF)
  - Apply data access permissions
  - Generate downloadable file
- **Output**: Export file ready for download
- **Priority**: Medium

#### 3.3.3 Key Performance Indicators
- Total leads captured
- Conversion rate by source, staff, branch
- Average response time
- Lead processing duration
- Revenue per lead
- Staff productivity metrics

### 3.4 Fleet Integration

#### 3.4.1 Feature Description
Integration with vehicle fleet management system to provide real-time availability, pricing, and vehicle information for accurate customer quotes and reservations.

#### 3.4.2 Functional Requirements

##### FR-FLEET-001: Vehicle Availability Lookup
- **Input**: Date range, location, vehicle category
- **Processing**:
  - Query fleet management system API
  - Filter available vehicles by criteria
  - Calculate availability periods
  - Apply business rules for customer eligibility
- **Output**: List of available vehicles with details
- **Priority**: High

##### FR-FLEET-002: Pricing Calculation
- **Input**: Vehicle type, rental period, customer category
- **Processing**:
  - Apply base pricing rules
  - Calculate dynamic pricing adjustments
  - Apply discounts and promotions
  - Include taxes and fees
- **Output**: Detailed pricing breakdown
- **Priority**: High

##### FR-FLEET-003: Quote Generation
- **Input**: Customer requirements and vehicle selection
- **Processing**:
  - Generate formatted quote document
  - Include terms and conditions
  - Calculate total cost
  - Store quote for future reference
- **Output**: Professional quote document
- **Priority**: Medium

##### FR-FLEET-004: Vehicle Management
- **Input**: Vehicle information and status updates
- **Processing**:
  - Maintain vehicle database
  - Track vehicle assignments
  - Update availability status
  - Manage maintenance schedules
- **Output**: Updated vehicle records
- **Priority**: Medium

#### 3.4.3 Vehicle Categories
- Economy cars
- Compact cars
- Mid-size cars
- Full-size cars
- Luxury cars
- SUVs
- Vans
- Specialty vehicles

### 3.5 Multi-Branch Operations

#### 3.5.1 Feature Description
Support for multiple branch locations with branch-specific data isolation, cross-branch visibility for management, and hierarchical access control.

#### 3.5.2 Functional Requirements

##### FR-BRANCH-001: Branch Configuration
- **Input**: Branch details (name, location, contact information)
- **Processing**:
  - Create branch record
  - Set up default configurations
  - Initialize branch-specific settings
  - Assign initial administrator
- **Output**: Configured branch ready for operations
- **Priority**: High

##### FR-BRANCH-002: Branch-Specific Data Access
- **Input**: User credentials and data request
- **Processing**:
  - Determine user's branch affiliation
  - Apply branch-based data filtering
  - Enforce cross-branch access rules
  - Log data access attempts
- **Output**: Branch-appropriate data view
- **Priority**: High

##### FR-BRANCH-003: Cross-Branch Reporting
- **Input**: Management user credentials and report request
- **Processing**:
  - Validate management-level access
  - Aggregate data across multiple branches
  - Apply appropriate data permissions
  - Generate consolidated reports
- **Output**: Multi-branch consolidated reports
- **Priority**: Medium

##### FR-BRANCH-004: Branch User Management
- **Input**: User details and branch assignment
- **Processing**:
  - Create user account
  - Assign to specific branch
  - Set appropriate role and permissions
  - Send account activation notification
- **Output**: Branch-assigned user account
- **Priority**: Medium

#### 3.5.3 Branch Hierarchy
```
Headquarters (All Branches)
├── Doha Main Branch
├── Doha Airport Branch
├── West Bay Branch
└── Al Khor Branch
```

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Web Application Interface
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with responsive design
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

#### 4.1.2 Mobile Interface
- **Responsive Design**: Mobile-first approach with breakpoints
- **Touch Optimization**: Touch-friendly controls and gestures
- **Performance**: Optimized for mobile network conditions
- **PWA Features**: Offline capability and app-like experience

#### 4.1.3 Accessibility Requirements
- **WCAG 2.1**: Level AA compliance
- **Screen Readers**: Compatible with NVDA, JAWS, VoiceOver
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Minimum 4.5:1 contrast ratio

### 4.2 Hardware Interfaces

#### 4.2.1 Client Hardware
- **Minimum RAM**: 4GB for desktop, 2GB for mobile
- **Storage**: 100MB available space for cached data
- **Network**: Broadband internet connection
- **Input Devices**: Keyboard, mouse, touch screen support

#### 4.2.2 Server Hardware
- **Hosting Platform**: Replit cloud infrastructure
- **Scalability**: Auto-scaling based on demand
- **Storage**: SSD-based storage with automatic backups
- **Network**: High-availability network with CDN

### 4.3 Software Interfaces

#### 4.3.1 Database Interface
- **Database**: PostgreSQL 14+
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Connection pooling with automatic failover
- **Backup**: Automated daily backups with point-in-time recovery

#### 4.3.2 Authentication Interface
- **Provider**: Replit OAuth integration
- **Protocol**: OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: JWT tokens with refresh mechanism

#### 4.3.3 Email Interface
- **Service**: SendGrid email service
- **Features**: Transactional emails, templates, tracking
- **Authentication**: API key-based authentication
- **Rate Limiting**: Configured rate limits for email sending

#### 4.3.4 File Storage Interface
- **Provider**: Replit file storage
- **Features**: File upload, download, and management
- **Security**: Encrypted storage with access controls
- **Formats**: Support for common file formats (PDF, images, documents)

### 4.4 Communication Interfaces

#### 4.4.1 HTTP/HTTPS Protocol
- **API Design**: RESTful API with JSON payloads
- **Security**: HTTPS only with TLS 1.2+
- **Authentication**: Bearer token authentication
- **Rate Limiting**: Request rate limiting for API protection

#### 4.4.2 WebSocket Protocol
- **Real-time Updates**: Live dashboard updates
- **Notifications**: Real-time user notifications
- **Connection Management**: Automatic reconnection handling
- **Security**: Authenticated WebSocket connections

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

#### 5.1.1 Response Time Requirements
- **Page Load Time**: Initial page load ≤ 3 seconds
- **API Response Time**: 95% of API calls ≤ 2 seconds
- **Database Queries**: Complex queries ≤ 5 seconds
- **Search Operations**: Search results ≤ 1 second

#### 5.1.2 Throughput Requirements
- **Concurrent Users**: Support 100 concurrent users
- **API Requests**: 1000 requests per minute
- **Database Transactions**: 500 transactions per minute
- **File Uploads**: 10 concurrent file uploads

#### 5.1.3 Scalability Requirements
- **User Growth**: Scale to 500 concurrent users
- **Data Growth**: Handle 100,000+ lead records
- **Geographic Scaling**: Support multiple data centers
- **Feature Scaling**: Modular architecture for feature additions

### 5.2 Availability Requirements

#### 5.2.1 System Uptime
- **Business Hours**: 99.9% uptime (8 AM - 8 PM Qatar time)
- **Overall Availability**: 99.5% uptime (24/7)
- **Planned Maintenance**: Maximum 4 hours per month
- **Emergency Maintenance**: Maximum 2 hours per incident

#### 5.2.2 Disaster Recovery
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 1 hour
- **Backup Frequency**: Daily automated backups
- **Backup Retention**: 30 days for regular backups, 1 year for monthly backups

### 5.3 Reliability Requirements

#### 5.3.1 Error Handling
- **System Errors**: Graceful error handling with user-friendly messages
- **Data Validation**: Client-side and server-side validation
- **Transaction Integrity**: ACID compliance for database transactions
- **Rollback Capability**: Automatic rollback on transaction failures

#### 5.3.2 Data Integrity
- **Data Validation**: Comprehensive input validation
- **Referential Integrity**: Database constraints and foreign key relationships
- **Audit Trail**: Complete audit logging for data changes
- **Data Backup**: Regular automated backups with integrity verification

### 5.4 Security Requirements

#### 5.4.1 Authentication and Authorization
- **Multi-Factor Authentication**: Support for 2FA
- **Session Security**: Secure session management with timeout
- **Password Policy**: Strong password requirements
- **Role-Based Access**: Granular permission system

#### 5.4.2 Data Protection
- **Encryption at Rest**: AES-256 encryption for stored data
- **Encryption in Transit**: TLS 1.2+ for all communications
- **Personal Data**: GDPR-compliant data handling
- **Access Logging**: Complete audit trail for data access

#### 5.4.3 System Security
- **Input Validation**: Protection against injection attacks
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Appropriate HTTP security headers

### 5.5 Usability Requirements

#### 5.5.1 User Experience
- **Learning Curve**: New users productive within 2 hours
- **Navigation**: Intuitive navigation with breadcrumbs
- **Help System**: Context-sensitive help and documentation
- **Error Messages**: Clear, actionable error messages

#### 5.5.2 Accessibility
- **WCAG Compliance**: WCAG 2.1 Level AA compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Compatible with major screen readers
- **Language Support**: English and Arabic language support

### 5.6 Maintainability Requirements

#### 5.6.1 Code Quality
- **Code Standards**: TypeScript strict mode with ESLint
- **Documentation**: Comprehensive code documentation
- **Testing**: 80%+ code coverage with automated tests
- **Version Control**: Git-based version control with branching strategy

#### 5.6.2 System Monitoring
- **Application Monitoring**: Real-time application performance monitoring
- **Error Tracking**: Automated error reporting and alerting
- **Log Management**: Centralized logging with log rotation
- **Health Checks**: Automated system health monitoring

---

## 6. System Architecture

### 6.1 High-Level Architecture

#### 6.1.1 Architecture Overview
The system follows a three-tier architecture pattern:
- **Presentation Tier**: React-based web application
- **Application Tier**: Node.js/Express.js API server
- **Data Tier**: PostgreSQL database with Redis caching

#### 6.1.2 Architectural Principles
- **Separation of Concerns**: Clear separation between presentation, business logic, and data layers
- **Scalability**: Horizontal scaling capability with load balancing
- **Security**: Security-first design with defense in depth
- **Maintainability**: Modular design with clear interfaces

### 6.2 Frontend Architecture

#### 6.2.1 Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── forms/          # Form components
│   ├── charts/         # Chart and visualization components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── services/           # API service layer
```

#### 6.2.2 State Management
- **Server State**: TanStack Query for server state management
- **Client State**: React hooks for local component state
- **Form State**: React Hook Form for form management
- **Global State**: Context API for global application state

#### 6.2.3 Routing
- **Router**: Wouter for client-side routing
- **Route Protection**: Authentication-based route guards
- **Code Splitting**: Lazy loading for performance optimization
- **Deep Linking**: Support for bookmarkable URLs

### 6.3 Backend Architecture

#### 6.3.1 API Structure
```
server/
├── routes/             # API route handlers
├── middleware/         # Express middleware
├── services/           # Business logic services
├── models/             # Data models and validation
├── utils/              # Utility functions
├── config/             # Configuration management
└── db/                 # Database configuration and migrations
```

#### 6.3.2 API Design
- **RESTful Design**: Standard REST API patterns
- **JSON Communication**: JSON request/response format
- **Status Codes**: Appropriate HTTP status codes
- **Error Handling**: Consistent error response format

#### 6.3.3 Middleware Stack
- **Authentication**: Passport.js for authentication
- **Authorization**: Custom role-based authorization
- **Validation**: Zod for request validation
- **Logging**: Winston for application logging
- **Rate Limiting**: Express rate limit for API protection

### 6.4 Database Architecture

#### 6.4.1 Database Design
- **Primary Database**: PostgreSQL for transactional data
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Automated database migrations
- **Indexing**: Optimized indexes for query performance

#### 6.4.2 Data Models
```
Users → Branches → Leads → Communications
  ↓        ↓         ↓         ↓
Roles   Settings  Vehicles  Attachments
```

#### 6.4.3 Performance Optimization
- **Connection Pooling**: Database connection pooling
- **Query Optimization**: Optimized queries with proper indexing
- **Caching**: Redis caching for frequently accessed data
- **Monitoring**: Database performance monitoring

---

## 7. Database Requirements

### 7.1 Database Schema

#### 7.1.1 Core Tables

##### Users Table
```sql
users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    role user_role NOT NULL,
    branch_id VARCHAR REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```

##### Branches Table
```sql
branches (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    phone VARCHAR,
    email VARCHAR,
    manager_id VARCHAR REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```

##### Leads Table
```sql
leads (
    id VARCHAR PRIMARY KEY,
    full_name VARCHAR NOT NULL,
    email VARCHAR,
    phone VARCHAR NOT NULL,
    vehicle_type VARCHAR,
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    rental_period_days INTEGER,
    pickup_location VARCHAR,
    special_requirements TEXT,
    status lead_status DEFAULT 'new',
    source_type lead_source DEFAULT 'website',
    priority lead_priority DEFAULT 'normal',
    assigned_to VARCHAR REFERENCES users(id),
    branch_id VARCHAR REFERENCES branches(id),
    is_archived BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```

##### Communications Table
```sql
communications (
    id VARCHAR PRIMARY KEY,
    lead_id VARCHAR REFERENCES leads(id),
    user_id VARCHAR REFERENCES users(id),
    type communication_type NOT NULL,
    content TEXT NOT NULL,
    direction communication_direction NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)
```

#### 7.1.2 Configuration Tables

##### Vehicles Table
```sql
car_types (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

car_makes (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    type_id VARCHAR REFERENCES car_types(id),
    is_active BOOLEAN DEFAULT true
);

car_models (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    make_id VARCHAR REFERENCES car_makes(id),
    year INTEGER,
    is_active BOOLEAN DEFAULT true
);

car_plates (
    id VARCHAR PRIMARY KEY,
    plate_number VARCHAR UNIQUE NOT NULL,
    model_id VARCHAR REFERENCES car_models(id),
    branch_id VARCHAR REFERENCES branches(id),
    status vehicle_status DEFAULT 'available',
    is_active BOOLEAN DEFAULT true
)
```

##### Field Configurations Table
```sql
field_configurations (
    id VARCHAR PRIMARY KEY,
    field_name VARCHAR NOT NULL,
    is_required BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```

##### Privacy Settings Table
```sql
privacy_settings (
    id VARCHAR PRIMARY KEY,
    setting_name VARCHAR NOT NULL,
    setting_value BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```

#### 7.1.3 Session Management Table
```sql
sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
)
```

### 7.2 Database Indexes

#### 7.2.1 Performance Indexes
```sql
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_role ON users(role);

-- Leads indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_branch_id ON leads(branch_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_rental_dates ON leads(rental_start_date, rental_end_date);

-- Communications indexes
CREATE INDEX idx_communications_lead_id ON communications(lead_id);
CREATE INDEX idx_communications_user_id ON communications(user_id);
CREATE INDEX idx_communications_created_at ON communications(created_at);

-- Sessions index
CREATE INDEX idx_sessions_expire ON sessions(expire);
```

#### 7.2.2 Composite Indexes
```sql
-- Lead search optimization
CREATE INDEX idx_leads_search ON leads(status, branch_id, assigned_to, created_at);

-- Communication history optimization
CREATE INDEX idx_communications_history ON communications(lead_id, created_at DESC);

-- Vehicle availability optimization
CREATE INDEX idx_vehicle_availability ON car_plates(status, branch_id, is_active);
```

### 7.3 Data Constraints

#### 7.3.1 Check Constraints
```sql
-- Date validation
ALTER TABLE leads ADD CONSTRAINT check_rental_dates 
    CHECK (rental_end_date >= rental_start_date);

-- Phone format validation
ALTER TABLE leads ADD CONSTRAINT check_phone_format 
    CHECK (phone ~ '^[+]?[0-9\s\-()]+$');

-- Email format validation
ALTER TABLE users ADD CONSTRAINT check_email_format 
    CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

#### 7.3.2 Foreign Key Constraints
```sql
-- User branch assignment
ALTER TABLE users ADD CONSTRAINT fk_users_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- Lead assignment
ALTER TABLE leads ADD CONSTRAINT fk_leads_assigned_to
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Communication tracking
ALTER TABLE communications ADD CONSTRAINT fk_communications_lead
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
```

### 7.4 Data Types and Enums

#### 7.4.1 Custom Enums
```sql
-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');

-- Lead status
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'quoted', 'negotiating', 'converted', 'declined');

-- Lead source
CREATE TYPE lead_source AS ENUM ('website', 'phone', 'walk_in', 'referral', 'social_media', 'email', 'other');

-- Lead priority
CREATE TYPE lead_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Communication type
CREATE TYPE communication_type AS ENUM ('call', 'email', 'sms', 'meeting', 'note');

-- Communication direction
CREATE TYPE communication_direction AS ENUM ('inbound', 'outbound', 'internal');

-- Vehicle status
CREATE TYPE vehicle_status AS ENUM ('available', 'rented', 'maintenance', 'unavailable');
```

---

## 8. Security Requirements

### 8.1 Authentication Security

#### 8.1.1 Password Security
- **Hashing Algorithm**: bcrypt with salt rounds ≥ 12
- **Password Policy**: Minimum 8 characters, mixed case, numbers, special characters
- **Password Storage**: Never store plaintext passwords
- **Password Reset**: Secure password reset with time-limited tokens

#### 8.1.2 Session Security
- **Session Storage**: Server-side session storage in PostgreSQL
- **Session Tokens**: Cryptographically secure random tokens
- **Session Timeout**: 8-hour inactivity timeout
- **Concurrent Sessions**: Limit concurrent sessions per user

#### 8.1.3 Multi-Factor Authentication
- **2FA Support**: Time-based one-time passwords (TOTP)
- **Backup Codes**: Single-use backup codes for account recovery
- **Device Management**: Trusted device management
- **Force 2FA**: Mandatory 2FA for administrator accounts

### 8.2 Authorization Security

#### 8.2.1 Role-Based Access Control
- **Principle of Least Privilege**: Users have minimum necessary permissions
- **Role Hierarchy**: Clear role hierarchy with inheritance
- **Resource-Based Permissions**: Granular permissions per resource
- **Dynamic Authorization**: Runtime permission checking

#### 8.2.2 Data Access Control
- **Branch Isolation**: Branch-level data isolation for staff users
- **Manager Override**: Manager access to branch data
- **Admin Access**: Administrative access to all data
- **Audit Logging**: Complete audit trail for all data access

### 8.3 Data Security

#### 8.3.1 Encryption
- **Data at Rest**: AES-256 encryption for sensitive data
- **Data in Transit**: TLS 1.2+ for all communications
- **Key Management**: Secure key storage and rotation
- **Database Encryption**: Transparent data encryption (TDE)

#### 8.3.2 Data Privacy
- **Personal Data**: GDPR-compliant handling of personal information
- **Data Minimization**: Collect only necessary data
- **Data Retention**: Automated data retention and deletion policies
- **Consent Management**: User consent tracking and management

### 8.4 Application Security

#### 8.4.1 Input Validation
- **Server-Side Validation**: All inputs validated on server
- **Client-Side Validation**: User experience enhancement only
- **Sanitization**: Input sanitization to prevent injection attacks
- **File Upload Security**: Secure file upload with type validation

#### 8.4.2 API Security
- **Rate Limiting**: Request rate limiting per user/IP
- **API Authentication**: Bearer token authentication
- **CORS Policy**: Restrictive CORS policy
- **SQL Injection Prevention**: Parameterized queries only

#### 8.4.3 Cross-Site Security
- **XSS Prevention**: Content Security Policy (CSP) headers
- **CSRF Protection**: CSRF tokens for state-changing requests
- **Clickjacking Prevention**: X-Frame-Options headers
- **HTTPS Only**: Strict Transport Security (HSTS) headers

---

## 9. Quality Assurance

### 9.1 Testing Requirements

#### 9.1.1 Unit Testing
- **Coverage Target**: 80% code coverage minimum
- **Framework**: Jest for JavaScript/TypeScript testing
- **Test Types**: Function testing, component testing, service testing
- **Mocking**: Mock external dependencies and APIs

#### 9.1.2 Integration Testing
- **API Testing**: Test all API endpoints and responses
- **Database Testing**: Test database operations and transactions
- **Service Integration**: Test service-to-service communication
- **Error Handling**: Test error scenarios and edge cases

#### 9.1.3 End-to-End Testing
- **User Workflows**: Test complete user journeys
- **Browser Testing**: Cross-browser compatibility testing
- **Mobile Testing**: Mobile device and responsive design testing
- **Performance Testing**: Load testing and performance validation

#### 9.1.4 Security Testing
- **Vulnerability Scanning**: Automated security vulnerability scanning
- **Penetration Testing**: Professional penetration testing
- **Authentication Testing**: Test authentication and authorization
- **Data Security Testing**: Test data encryption and protection

### 9.2 Code Quality Standards

#### 9.2.1 Code Standards
- **Language Standards**: TypeScript strict mode enabled
- **Linting**: ESLint with strict configuration
- **Formatting**: Prettier for consistent code formatting
- **Documentation**: JSDoc comments for all public APIs

#### 9.2.2 Code Review Process
- **Peer Review**: All code changes require peer review
- **Review Checklist**: Standardized code review checklist
- **Automated Checks**: Automated code quality checks in CI/CD
- **Knowledge Sharing**: Code review as knowledge transfer mechanism

### 9.3 Performance Standards

#### 9.3.1 Performance Metrics
- **Page Load Time**: <3 seconds for initial page load
- **API Response Time**: <2 seconds for 95% of requests
- **Database Query Time**: <5 seconds for complex queries
- **Search Response Time**: <1 second for search operations

#### 9.3.2 Performance Testing
- **Load Testing**: Test system under normal expected load
- **Stress Testing**: Test system under peak load conditions
- **Volume Testing**: Test with large data volumes
- **Endurance Testing**: Test system stability over extended periods

---

## 10. Deployment Requirements

### 10.1 Deployment Architecture

#### 10.1.1 Hosting Environment
- **Platform**: Replit cloud hosting platform
- **Runtime**: Node.js 18+ runtime environment
- **Database**: Managed PostgreSQL database service
- **CDN**: Content delivery network for static assets

#### 10.1.2 Environment Configuration
```
Development Environment:
- Local development server
- Development database
- Mock external services
- Debug logging enabled

Staging Environment:
- Production-like configuration
- Staging database with test data
- Real external service integration
- Performance monitoring

Production Environment:
- High-availability configuration
- Production database with backups
- All external services configured
- Comprehensive monitoring and alerting
```

### 10.2 Deployment Process

#### 10.2.1 CI/CD Pipeline
```
Code Commit → Automated Tests → Build → Deploy to Staging → Manual Testing → Deploy to Production
```

#### 10.2.2 Deployment Steps
1. **Code Quality Checks**: Linting, testing, security scanning
2. **Build Process**: Compile TypeScript, bundle assets, optimize
3. **Staging Deployment**: Deploy to staging environment for testing
4. **Production Deployment**: Blue-green deployment to production
5. **Post-Deployment**: Health checks, monitoring, rollback if needed

### 10.3 Monitoring and Maintenance

#### 10.3.1 Application Monitoring
- **Uptime Monitoring**: Continuous availability monitoring
- **Performance Monitoring**: Application performance metrics
- **Error Tracking**: Real-time error reporting and alerting
- **User Analytics**: User behavior and usage analytics

#### 10.3.2 Database Monitoring
- **Performance Metrics**: Query performance and database health
- **Backup Verification**: Automated backup verification
- **Storage Monitoring**: Database storage usage tracking
- **Connection Monitoring**: Database connection pool monitoring

#### 10.3.3 Security Monitoring
- **Access Logging**: Complete audit trail of system access
- **Threat Detection**: Automated threat detection and response
- **Vulnerability Monitoring**: Continuous vulnerability assessment
- **Compliance Monitoring**: Regulatory compliance monitoring

---

## Appendices

### Appendix A: API Specification
- Complete REST API documentation
- Request/response schemas
- Authentication requirements
- Error code definitions

### Appendix B: Database Schema
- Complete database schema with relationships
- Index definitions and performance considerations
- Migration scripts and procedures
- Backup and recovery procedures

### Appendix C: Testing Plan
- Detailed testing strategy and procedures
- Test case specifications
- Performance testing scenarios
- Security testing requirements

### Appendix D: Deployment Guide
- Step-by-step deployment procedures
- Environment configuration details
- Monitoring and alerting setup
- Troubleshooting guide

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Next Review: Bi-weekly during development*  
*Document Owner: Q-Mobility Development Team*  
*Classification: Internal Use Only*
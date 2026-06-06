# Lawyers Diary Webapp - Project Summary for CV

## Project Overview

**Lawyers Diary Webapp** (Brand: "Diary by Davda") is a full-stack case management system designed for legal professionals to efficiently track, organize, and manage their legal cases. The application provides a comprehensive digital alternative to manual case diaries with modern web technologies and progressive web app capabilities.

---

## Purpose & Problem Statement

The application solves the critical need for legal practitioners to maintain organized, accessible records of their caseload. Traditional case management approaches (paper-based or disconnected spreadsheets) lack:
- **Real-time case status tracking** across multiple cases
- **Contextual case information** (client contact, hearing dates, disposition status)
- **Searchability & filtering** by various case attributes
- **Analytics & insights** into case outcomes and pending matters
- **Mobile accessibility** for on-the-go lawyers

This webapp provides a centralized, searchable, and analytics-enabled platform for case management with secure, role-based access control.

---

## Key Features

### 1. **Case Management (CRUD Operations)**
- **Create Cases**: Add new cases with 5-digit case numbers, year, title, and status information
- **View Cases**: Display comprehensive case details including:
  - Case number (5-digit unique identifier per year)
  - Case title and year
  - Next hearing date
  - Client contact information (name & phone)
  - Case status (Pending, Won, Lost, Not Prejudicial)
  - Matter disposition tracking
  - Reply pending flag
  - Internal notes
- **Update Cases**: Modify case details and track status changes
- **Delete Cases**: Soft-delete functionality with audit trails
- **Unique Constraints**: Enforces case number + year uniqueness per lawyer (composite keys)

### 2. **Advanced Search & Filtering**
- **Multi-field search**: Query across case number, title, contact person, phone, notes, and status
- **Date-based filtering**: Filter cases by exact date, month, or year for next hearing dates
- **Default filtering**: Dashboard pre-filters cases by today's date for upcoming hearings
- **Real-time search results** with instant filtering capabilities

### 3. **Analytics Dashboard**
- **Case Statistics**:
  - Total case count
  - Open vs. disposed cases breakdown
  - Reply pending count and visualization
  - Disposition status breakdown (Win/Loss/Not Prejudicial)
- **Visual Charts**:
  - Bar charts for cases by month
  - Pie charts for case disposition distribution
  - Trends and patterns over time
- **Dedicated Tabs**: Dashboard, Reply Pending, and Disposed Matter tabs for focused views

### 4. **Authentication & Security**
- **User Registration & Login**: Secure credential-based authentication
- **JWT-based Authentication**: 
  - 15-minute access tokens (short-lived for security)
  - 7-day refresh tokens with "Remember Me" functionality
  - Secure HTTP-only cookies with CORS protection
- **Email Verification**: Token-based email verification system
- **Two-Factor Authentication**: Optional 2FA support with time-based OTP
- **Role-based Access Control**: Lawyer and Admin roles for differentiated permissions
- **Session Management**: Persistent login capability with auto-refresh

### 5. **Progressive Web App (PWA)**
- **Offline Support**: Service worker caching for offline accessibility
- **Installable**: Install as standalone app on desktop and mobile devices
- **App Manifest**: Custom branding with app name, icons, theme colors
- **Auto-updates**: Background service worker updates
- **Native-like Experience**: Standalone display mode (no browser UI)

### 6. **Export & Reporting**
- **PDF Export**: Generate printable case reports with jsPDF
- **Auto Table Formatting**: Structured PDF export with tables and formatting
- **Data Portability**: Export filtered case lists or full case data

### 7. **User Experience**
- **Responsive Design**: Mobile-first, tablet-tested, and desktop-optimized layouts
- **Toast Notifications**: Real-time user feedback for actions and errors
- **Loading States**: Spinner indicators for data fetching
- **Error Handling**: User-friendly error messages and validation
- **Navigation**: Easy case navigation between Dashboard, Add Case, View Case, and Analytics
- **Icon-based UI**: React Icons for intuitive visual feedback

### 8. **Data Management**
- **Database Migrations**: Version-controlled schema migrations using migrate-mongo
- **Data Seeders**: Pre-populate database with sample lawyers and case data for testing
- **Data Persistence**: MongoDB with proper indexes and compound keys

---

## Tech Stack

### **Backend**
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js + TypeScript | Type-safe server runtime |
| **Framework** | Express.js v5.2 | RESTful API server |
| **Database** | MongoDB v7.1 + Mongoose v9.2 | NoSQL document database with ORM |
| **Authentication** | JWT + bcryptjs | Token-based auth with password hashing |
| **Migration Tool** | migrate-mongo v14 | Database schema versioning |
| **API Documentation** | Swagger/OpenAPI | Interactive API documentation |
| **Security** | Helmet + CORS | Security headers and cross-origin handling |
| **Logging** | Morgan | HTTP request logging |
| **Environment** | dotenv | Environment variable management |
| **Utilities** | UUID v10, cookie-parser | ID generation and cookie handling |

### **Frontend**
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | React v19.2 + TypeScript | Type-safe UI framework |
| **Build Tool** | Vite v7.3 + tsc | Fast build and compilation |
| **Routing** | React Router v7.13 | Client-side navigation |
| **HTTP Client** | Axios v1.13 | API communication |
| **UI Framework** | React Bootstrap v2.10 + Bootstrap v5.3 | Responsive component library |
| **Charts** | Recharts v3.7 | Interactive data visualization |
| **PDF Export** | jsPDF v4.2 + jsPDF-AutoTable v5.0 | PDF generation with tables |
| **Icons** | React Icons v5.5 | Comprehensive icon library |
| **Select Component** | React-Select v5.10 | Advanced dropdown with search |
| **PWA** | Vite-Plugin-PWA v1.2 | Progressive Web App support |
| **Code Quality** | ESLint 9 + TypeScript-ESLint | Static code analysis |

### **Database Schema**
- **Lawyers Collection**: User profiles with authentication data, 2FA config, email verification
  - Indexes: email (unique)
- **Cases Collection**: Case records with composite primary key (case_number + year + lawyer_id)
  - Indexes: (lawyer_id, case_number, year) - unique compound key
  - Fields: case metadata, hearing dates, disposition, contact info, notes

### **DevOps & Deployment**
- **Package Managers**: npm
- **Runtime Versions**: Node.js (LTS compatible)
- **Containerization Ready**: Docker-compatible project structure
- **Environment Configuration**: .env files for development and production
- **Database Hosting**: MongoDB Atlas (cloud) support

---

## Architecture & Design Patterns

### **Backend Architecture**
```
Backend (Node.js + Express + TypeScript)
├── Controllers: Business logic for cases & auth
├── Models: Mongoose schemas with validation
├── Middleware: JWT authentication & error handling
├── Routes: RESTful endpoints
├── Config: Database connection & Swagger docs
└── Database: MongoDB
```

### **Frontend Architecture**
```
Frontend (React + Vite + TypeScript)
├── Pages: Routed views (Dashboard, Login, AddCase, ViewCase, Analytics)
├── Components: Reusable UI components
├── API Layer: Axios client instances for backend communication
├── Services: Business logic separation
├── Styles: Bootstrap + custom CSS
└── PWA Manifest: Service worker & offline support
```

### **API Endpoints (RESTful)**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info
- `POST /api/auth/refresh` - Refresh JWT
- `GET /api/cases` - List all cases for user
- `POST /api/cases` - Create new case
- `GET /api/cases/search` - Search cases with field filters
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

---

## Key Implementation Highlights

### **Compound Key Design**
- Uses combination of `case_number` (5 digits) + `year` (4 digits) as composite key
- Enables same case number to exist across different years (e.g., 00123-2024 vs 00123-2025)
- Enforces uniqueness per lawyer with unique compound index

### **Secure Authentication Flow**
1. User logs in with email/password
2. Backend validates and generates short-lived access token (15 min) + long-lived refresh token (7 days)
3. Tokens stored in HTTP-only secure cookies with CORS protection
4. Frontend auto-refreshes access token before expiry
5. Optional "Remember Me" extends refresh token persistence

### **Real-time Search Implementation**
- Multiple search modes: all fields, specific field, date-based
- Efficient MongoDB queries with indexed fields
- Client-side filtering for instant feedback
- Supports partial matches on strings

### **Analytics Engine**
- Real-time aggregation of case statistics
- Dynamic chart generation with Recharts
- Breakdown views by disposition and pending status

### **PWA Implementation**
- Vite-PWA plugin handles service worker generation
- Auto-updating background service worker
- Offline-first caching strategy
- Installable on mobile and desktop

---

## Development Workflow

### **Scripts**
```bash
# Backend
npm run dev              # Development server with ts-node
npm start              # Production server
npm run build          # TypeScript compilation
npm run migrate:up     # Run pending migrations
npm run migrate:create # Create new migration
npm run seed:lawyer    # Seed lawyer data
npm run seed:cases     # Seed case data

# Frontend
npm run dev            # Development server (Vite)
npm run build          # Production build with type checking
npm run lint           # ESLint code analysis
npm run preview        # Preview production build
```

### **Database Migrations**
- Version-controlled schema changes
- Rollback support via `migrate:down`
- Timestamped migration files for clarity

### **Seeding Strategy**
- Separate seeders for lawyers and cases
- Initial data setup for development
- Data validation during seeding

---

## Project Maturity & Status

### **Completed (Phase 1)**
✅ Full CRUD for case management  
✅ User authentication with JWT  
✅ Search and filtering  
✅ PWA support  
✅ Mobile-responsive design  
✅ Database migrations and seeders  
✅ Swagger API documentation  

### **In Development (Phase 2)**
🚀 Enhanced mobile UI/UX  
🚀 Analytics dashboard refinements  
🚀 Theme customization  
🚀 Navbar optimization  
🚀 Production database setup  
🚀 Advanced styling and branding  

---

## Notable Technical Decisions

1. **TypeScript Throughout**: Both backend and frontend use TypeScript for type safety and better developer experience
2. **MongoDB + Mongoose**: Flexible schema for evolving case management needs
3. **Composite Keys**: Architecture supports complex real-world case numbering schemes
4. **JWT + Refresh Tokens**: Balances security with user experience for web apps
5. **React Bootstrap**: Rapid UI development with professional components
6. **Vite Build**: Modern, fast build tooling with HMR
7. **PWA Support**: Offline-first approach for reliability in field work
8. **Swagger Docs**: Auto-generated API documentation for backend endpoints

---

## Code Quality & Best Practices

- **Middleware-based Security**: Auth middleware on protected routes
- **Input Validation**: Client and server-side validation
- **Error Handling**: Try-catch with informative error messages
- **CORS Protection**: Whitelist-based origin validation
- **Security Headers**: Helmet.js for HTTP header hardening
- **Environment Separation**: .env configuration for dev/prod
- **API Documentation**: Swagger/OpenAPI specifications
- **Component Separation**: Clean separation of concerns (models, controllers, routes)

---

## Learning & Growth Outcomes

This project demonstrates:
- **Full-stack development** with modern technologies
- **Security implementation** (JWT, password hashing, 2FA ready)
- **Database design** with NoSQL and complex queries
- **TypeScript proficiency** in both frontend and backend
- **User experience design** with responsive and accessible UI
- **Progressive Web App** development
- **RESTful API** design principles
- **Deployment-ready** project structure
- **Version control** with migrations and seeders

---

## Summary

The **Lawyers Diary Webapp** is a production-ready case management system that combines modern web technologies with domain-specific legal case tracking requirements. It demonstrates full-stack development competency, security-conscious design, and practical problem-solving for real-world workflows.

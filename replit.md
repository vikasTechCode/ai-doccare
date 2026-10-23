# AI DocCare - Healthcare Management System

## Overview

AI DocCare is a comprehensive healthcare management system built with modern web technologies. It provides a patient-centered platform with AI-powered health insights, medical record management, vital tracking, appointment scheduling, and medication management. The system includes role-based access for patients, doctors, and administrators.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with hot module replacement
- **UI Theme**: New York style with neutral color scheme

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with structured error handling
- **Session Management**: Express sessions with PostgreSQL store

### Authentication & Authorization
- **Strategy**: JWT-like session-based authentication
- **Role System**: Three roles - patient, doctor, admin
- **Security**: Password-based authentication with role-based route protection
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

## Key Components

### AI Integration
- **Provider**: OpenAI GPT-4o model
- **Features**:
  - Symptom analysis with urgency assessment
  - Health assistant chatbot
  - Health score generation
- **Safety**: All AI responses include medical disclaimers

### Database Schema
The system uses a relational database with the following main entities:
- **Users**: Patient/doctor/admin profiles with personal information
- **Medical Records**: Document storage with categorization
- **Vitals**: Blood pressure, heart rate, weight, temperature tracking
- **Appointments**: Doctor-patient scheduling system
- **Medications**: Prescription tracking with dosage and frequency
- **Medication Logs**: Adherence tracking
- **Symptom Analyses**: AI-powered symptom assessment history
- **Chat Messages**: AI assistant conversation history
- **Articles**: Health education content

### UI/UX Design
- **Design System**: Consistent component library with shadcn/ui
- **Responsive**: Mobile-first design with desktop optimization
- **Accessibility**: ARIA-compliant components
- **Theme**: Medical-focused color palette with blue and green accents
- **Navigation**: Role-based navigation with protected routes

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Server validates against database
3. Session created and stored in PostgreSQL
4. Client receives user object without password
5. Auth context manages login state across components

### Health Data Flow
1. Users input vitals through forms
2. Data validated and stored in PostgreSQL
3. Charts generated from historical data
4. AI services analyze patterns for health insights
5. Recommendations displayed in dashboard

### AI Integration Flow
1. User submits symptoms or chat messages
2. Server sends request to OpenAI API
3. AI response processed and stored
4. Results formatted with safety disclaimers
5. Data displayed in user interface

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **express**: Web framework for API server
- **wouter**: Lightweight React routing

### UI Libraries
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **recharts**: Chart library for data visualization
- **lucide-react**: Icon library

### AI Services
- **openai**: Official OpenAI client library
- **OPENAI_API_KEY**: Environment variable for API access

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and tooling
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Environment Setup
- **Development**: Vite dev server with Express API
- **Production**: Built static assets served by Express
- **Database**: Neon serverless PostgreSQL with connection pooling

### Build Process
1. Frontend built with Vite to static assets
2. Backend bundled with esbuild for Node.js
3. Database schema deployed with Drizzle migrations
4. Environment variables configured for production

### Hosting Requirements
- **Node.js**: Version 18+ for ES modules support
- **Database**: PostgreSQL 12+ (Neon recommended)
- **Environment Variables**: DATABASE_URL, OPENAI_API_KEY
- **Port**: Configurable (default 3000)

### Security Considerations
- Database credentials via environment variables
- Session secrets for authentication security
- API keys for external service integration
- Input validation on all user data

## Changelog
- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
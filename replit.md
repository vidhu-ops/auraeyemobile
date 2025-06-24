# Aurfy - Spiritual Wellness Platform

## Overview

Aurfy is a comprehensive spiritual wellness platform that combines ancient metaphysical practices with modern AI technology. The application provides aura analysis, numerology readings, horoscope insights, object analysis, and spiritual journaling capabilities. Users can upload images for aura analysis, receive personalized spiritual guidance, and track their spiritual growth through an integrated journaling system.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session management
- **File Processing**: Multer for image upload handling
- **AI Integration**: OpenAI GPT-4o and Google Gemini for analysis

### Database Schema
The application uses PostgreSQL with the following key entities:
- **Users**: Authentication and profile information with user types (client/healer)
- **Aura Readings**: Image analysis results with color patterns and spiritual insights
- **Journal Entries**: Daily spiritual reflections and energy tracking
- **Numerology Readings**: Life path and destiny number calculations
- **Object Analysis**: Energy readings for physical objects
- **Healers**: Professional healer profiles and booking system

## Key Components

### Image Analysis System
- **Aura Analysis**: AI-powered detection of energy fields and color patterns in personal photos
- **Object Analysis**: Spiritual and energetic analysis of physical objects
- **Color Mapping**: Sophisticated color-to-meaning interpretation system
- **Visual Processing**: Client-side and server-side image processing capabilities

### AI Integration Layer
- **OpenAI Integration**: Primary AI service using GPT-4o for detailed spiritual analysis
- **Google Gemini**: Backup AI service for image analysis and content generation
- **Fallback System**: Graceful degradation when AI services are unavailable
- **Analysis Caching**: Performance optimization for repeated similar requests

### Authentication & Authorization
- **Session-based Authentication**: Secure session management with PostgreSQL storage
- **User Roles**: Client and healer user types with different access levels
- **Protected Routes**: Client-side route protection for authenticated features
- **Password Security**: Scrypt-based password hashing with salt

### Premium Feature System
- **Feature Gating**: Conditional access to advanced features
- **Upgrade Prompts**: Modal-based premium feature promotion
- **Payment Integration**: Stripe integration for subscription management

## Data Flow

1. **User Registration/Login**: 
   - User submits credentials → Passport authentication → Session creation → Database user record

2. **Aura Analysis Workflow**:
   - Image upload → Server validation → AI processing → Color analysis → Database storage → Results display

3. **Spiritual Services**:
   - User request → Input validation → AI service call → Response processing → Database persistence → Client update

4. **Journal System**:
   - Entry creation → Mood tracking → Pattern analysis → Insights generation → Progress visualization

## External Dependencies

### AI Services
- **OpenAI API**: Primary service for GPT-4o model access
- **Google Gemini**: Secondary AI service for image analysis
- **Fallback Processing**: Local algorithms when AI services are unavailable

### Payment Processing
- **Stripe**: Payment processing and subscription management
- **PayPal**: Alternative payment method integration

### Communication Services
- **SendGrid**: Email notifications and healer communications
- **Session Storage**: Redis-compatible session management

### Deployment Services
- **Google Cloud Run**: Production deployment target
- **PostgreSQL**: Primary database (Neon serverless in production)
- **Static Assets**: Vite-built assets served via Express

## Deployment Strategy

### Development Environment
- **Local Development**: tsx for TypeScript execution with hot reload
- **Database**: Local PostgreSQL or remote Neon development instance
- **Asset Serving**: Vite dev server with HMR
- **Port Configuration**: Local port 5000 with health check endpoints

### Production Build Process
1. **Client Build**: Vite builds React application to `dist/` directory
2. **Server Build**: esbuild bundles TypeScript server to single JS file
3. **Asset Organization**: Static files organized in `dist/public/` structure
4. **Optimization**: Minification and tree-shaking for performance

### Cloud Deployment
- **Platform**: Google Cloud Run for serverless container deployment
- **Build Commands**: npm run build → container creation → deployment
- **Environment Variables**: Database URLs, API keys, session secrets
- **Health Checks**: Built-in endpoints for container health monitoring
- **Scaling**: Automatic scaling based on request volume

### Database Management
- **Schema Migrations**: Drizzle Kit for database schema updates
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-based session storage in production
- **Backup Strategy**: Automated backups through cloud provider

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
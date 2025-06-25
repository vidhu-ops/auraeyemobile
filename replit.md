# Aurfy - Spiritual Wellness Platform

## Overview

Aurfy is a comprehensive spiritual wellness platform that combines modern AI technology with ancient metaphysical practices. The application provides aura analysis, numerology readings, horoscope services, spiritual journaling, and connections with professional healers.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React Context for auth/premium state
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: CSS animations and Framer Motion for enhanced UX

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **Authentication**: Passport.js with local strategy and express-session
- **File Upload**: Multer for handling image uploads
- **Build System**: ESBuild for server-side compilation
- **Development**: tsx for TypeScript execution

### Data Storage Solutions
- **Database**: PostgreSQL via Neon Database (serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Store**: PostgreSQL-based sessions in production, memory store in development
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Core Services
1. **Aura Analysis**: AI-powered image analysis to detect energy fields and spiritual traits
2. **Object Analysis**: Spiritual analysis of objects and their energy properties
3. **Numerology**: Comprehensive numerological calculations including life path, destiny numbers, and chakra analysis
4. **Horoscope Services**: Daily, monthly, and yearly astrological readings
5. **Spiritual Journaling**: Personal growth tracking with mood and energy patterns
6. **Healer Platform**: Marketplace for connecting with spiritual healers

### AI Integration
- **OpenAI GPT-4o**: Primary AI model for analysis and content generation
- **Google Gemini**: Backup AI service for enhanced analysis capabilities
- **Image Processing**: Server-side image analysis with color detection and energy interpretation
- **Multiple Analysis Modes**: Fast analysis for quick results, enhanced analysis for detailed insights

### User Management
- **Authentication**: Session-based auth with bcrypt password hashing
- **User Types**: Client and Healer user roles with different dashboards
- **Premium Features**: Subscription-based access to advanced features
- **Profile Management**: Birth date integration for personalized readings

## Data Flow

1. **User Registration/Login**: Credentials validated, session established, user redirected to appropriate dashboard
2. **Image Upload**: Images processed through multer, analyzed by AI services, results stored in database
3. **Analysis Pipeline**: Image → Color extraction → AI interpretation → Database storage → Frontend display
4. **Real-time Updates**: TanStack Query handles data fetching with automatic caching and revalidation
5. **Review System**: Users can rate and review analysis results for continuous improvement

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **AI Services**: @google/generative-ai, OpenAI API for content generation
- **Authentication**: passport, express-session, bcrypt-equivalent (scrypt)
- **Email**: @sendgrid/mail for transactional emails
- **Payment**: @stripe/stripe-js, @stripe/react-stripe-js, @paypal/paypal-server-sdk
- **File Processing**: multer, sharp (implicit through image processing)

### Development Tools
- **Build**: Vite, ESBuild, TypeScript
- **Database**: Drizzle ORM, Drizzle Kit
- **Testing**: Built-in health check endpoints
- **Validation**: Zod for runtime type validation

## Deployment Strategy

### Production Build Process
1. **Client Build**: Vite builds optimized React application to `dist/public`
2. **Server Build**: ESBuild compiles TypeScript server to `dist/index.js`
3. **Static Assets**: Client assets served from `dist/public` directory
4. **Health Checks**: Multiple health check endpoints for monitoring

### Environment Configuration
- **Development**: Local development with hot reloading via Vite
- **Production**: Cloud Run deployment with PostgreSQL database
- **Session Management**: Production uses PostgreSQL session store, development uses memory store
- **File Storage**: Memory-based file processing (images processed immediately)

### Build Optimization
- **Multiple Build Scripts**: Various build configurations for different deployment scenarios
- **Fallback Systems**: Graceful degradation when build assets are missing
- **Timeout Handling**: Build process includes timeout protection for long-running operations

## Changelog
- June 25, 2025. Initial setup
- June 25, 2025. Restricted aura analysis to only 17 approved colors: white, brown, turquoise, red, yellow, blue, green, violet, indigo, purple, gold, silver, orange, pink, gray, black (black appears rarely, prioritizes spiritual colors like purple, blue, gold)
- June 25, 2025. Implemented proportional image processing: images maintain aspect ratio with minimum dimensions (1200px width for landscape, 900px height for portrait) and adaptive particle sizing for proper aura visualizations
- June 25, 2025. Fixed object detection: improved human detection algorithm to prevent electronic devices and objects from being misidentified as humans, added object-like pixel detection for better accuracy
- June 25, 2025. Enhanced aura visualization with smooth gradient effects and natural color blending between all 4 aura colors using multiple blend modes (multiply, soft-light, overlay, color-dodge)
- June 25, 2025. Implemented ultra-conservative human detection for object analysis: prevents busy images and complex textures from being falsely detected as human faces, ensures all objects including electronics are accepted
- June 25, 2025. Made human detection extremely restrictive with perfect skin tone matching and requirement for all facial features to be present simultaneously, biased heavily toward accepting all images as objects
- June 25, 2025. Fixed aura visualization consistency by eliminating purple patches and creating seamless gradient blending with smooth color transitions that radiate naturally from person center without abrupt changes or patchy areas
- June 25, 2025. Added thinking color as a shining star above person's head in aura analysis with glow effect and inner shine to clearly represent mental/spiritual energy
- June 25, 2025. Completely removed skin color detection from human detection algorithms: replaced with structural pattern analysis using gradient detection, geometric shape identification, and organic vs manufactured pattern recognition to prevent false positive detection of electronic devices and objects

## User Preferences

Preferred communication style: Simple, everyday language.
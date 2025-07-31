# Aurfy - Spiritual Wellness Platform

## Overview

Aurfy is a comprehensive spiritual wellness platform that combines modern AI technology with ancient metaphysical practices. It offers aura analysis, numerology readings, horoscope services, spiritual journaling, and connections with professional healers. The platform aims to provide personalized insights and guidance for spiritual growth and well-being, leveraging AI for analysis and content generation, and facilitating connections within the spiritual community.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui
- **Routing**: Wouter
- **State Management**: TanStack Query for server state, React Context for authentication and premium features
- **UI Components**: Radix UI primitives
- **Animations**: CSS animations and Framer Motion

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: Passport.js (local strategy, express-session)
- **File Upload**: Multer
- **Build System**: ESBuild for server-side compilation, tsx for development

### Data Storage
- **Database**: PostgreSQL via Neon Database (serverless)
- **ORM**: Drizzle ORM for type-safe operations
- **Session Store**: PostgreSQL-based in production, memory store in development
- **Schema Management**: Drizzle Kit

### Key Features & Design Decisions
- **Aura Analysis**: AI-powered image analysis for energy fields and spiritual traits, including specific color interpretations and chakra activity. Features ultra-smooth smokey aura effects with distinct energy zones (personality, giving, receiving, thinking) while preserving face visibility.
- **Object Analysis**: Spiritual analysis of objects, distinct from human aura analysis.
- **Numerology**: Comprehensive calculations and interpretations including life path, destiny, and chakra analysis.
- **Horoscope Services**: Daily, monthly, and yearly astrological readings.
- **Spiritual Journaling**: Mood and energy pattern tracking.
- **Healer Platform**: Marketplace for connecting clients with healers, including real-time booking, detailed healer dashboards, and integrated analytics. Healers can access client analysis reports (aura, numerology) and generate PDFs.
- **AI Integration**: Primary use of OpenAI GPT-4o and Google Gemini for analysis and content generation.
- **User Management**: Session-based authentication, distinct client and healer roles, subscription-based premium features. New users default to client type; healers are manually added and managed via database.
- **Image Processing**: Standardized image resizing (1600x900) and compression (target 150KB) for consistent visual appearance and efficient AI processing. Includes robust human detection for specific analysis types.
- **PDF Generation**: Comprehensive PDF reports for aura analysis (for clients) and detailed reports (for healers), including original and processed images, chakra analysis, spiritual guidance, and healer notes.
- **Credit System**: Users consume credits for services (e.g., aura analysis, object analysis, healer bookings). New users receive default credits.
- **User Verification**: WhatsApp OTP for mobile verification (via Twilio), and email validation (via AbstractAPI) during registration.
- **Branding**: Dynamic branding updates, currently using "AuraEye" with a user-provided image logo.

## External Dependencies

- **Database Connectivity**: `@neondatabase/serverless`
- **AI Services**: `openai`, `@google/generative-ai`
- **Authentication**: `passport`, `express-session`, `bcrypt` (or equivalent like `scrypt`)
- **Email Service**: `@sendgrid/mail`
- **Payment Processing**: `@stripe/stripe-js`, `@stripe/react-stripe-js`, `@paypal/paypal-server-sdk`
- **File Processing**: `multer`, `sharp` (for image manipulation)
- **SMS/OTP**: `twilio` (for WhatsApp Business API)
- **Email Validation**: AbstractAPI Email Validation
- **WhatsApp Number Validation**: RapidAPI WhatsApp Number Validator
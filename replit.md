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
- **Aura Analysis**: AI-powered image analysis with standardized visualization system. All human aura images are processed to consistent 600px width × 900px height dimensions with distinct zone positioning: left side (receiving energy), right side (giving energy), top area (thinking energy), and outer edges (personality energy). Features ultra-smooth, cohesive smokey aura effects with seamless blending to eliminate scattered colors while preserving face visibility and maintaining uniform appearance across all input images. Fully responsive mobile design with optimized tab layout.
- **Object Analysis**: Spiritual analysis of objects, distinct from human aura analysis.
- **Numerology**: Comprehensive calculations and interpretations including life path, destiny, and chakra analysis.
- **Horoscope Services**: Daily, monthly, and yearly astrological readings.
- **Spiritual Journaling**: Mood and energy pattern tracking.
- **Healer Platform**: Marketplace for connecting clients with healers, including real-time booking, detailed healer dashboards, and integrated analytics. Healers can access client analysis reports (aura, numerology) and generate PDFs.
- **AI Integration**: Primary use of OpenAI GPT-4o and Google Gemini for analysis and content generation.
- **User Management**: Session-based authentication, distinct client and healer roles, subscription-based premium features. New users default to client type; healers are manually added and managed via database.
- **Image Processing**: Dual-system image processing - standardized resizing (600x900) and compression (target 50KB) for AI analysis, plus dedicated aura visualization system creating consistent 600px × 900px output images with standardized zone positioning, seamless smokey blending, and black backgrounds. Includes robust human detection for specific analysis types. Mobile-optimized dimensions ensure fast loading and proper display across all device sizes.
- **PDF Generation**: Comprehensive PDF reports for aura analysis (for clients) and detailed reports (for healers), including original and processed images, chakra analysis, spiritual guidance, and healer notes.
- **Credit System**: Dynamic pricing based on user type. Clients: Object scan (3), Connect with healer (3), Human aura scan (15), What's my vibe (1), Numerology (5). Healers: Object scan (1), Human aura scan (5), What's my vibe (1), Healer booking (1), Numerology (3). New clients receive 30 initial credits, new healers receive 100 initial credits.
- **User Verification**: WhatsApp OTP for mobile verification (via Twilio), and email validation (via AbstractAPI) during registration.
- **Branding**: Dynamic branding updates, currently using "AuraEye" with custom eye logo design provided by user (eye-logo.png). Logo features modern geometric eye design with concentric patterns.
- **Spiritual Guidance Video System**: Two separate video modals - Premium content preview (WhatsApp Video 2025-08-14 at 4.09.26 PM) accessed via "Watch Now" button, and Spiritual guidance video (WhatsApp Video 2025-08-11 at 3.45.29 AM) with post-video navigation asking "Would you like to scan your aura again?" - Yes redirects to /vibe, No redirects to home page.
- **Sample Aura Readings Display**: Home page features three sample aura readings using specific uploaded images for blue (WhatsApp Image 2025-08-18 at 3.56.39 AM), green (WhatsApp Image 2025-08-18 at 3.52.42 AM), and purple (WhatsApp Image 2025-08-18 at 4.01.06 AM) dominant aura demonstrations with matching gradient overlays and descriptive text.

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
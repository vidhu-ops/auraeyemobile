# Aurfy - Spiritual Wellness Platform

## Overview

Aurfy is a spiritual wellness platform that integrates AI with metaphysical practices to offer personalized insights and guidance for spiritual growth. Key features include aura analysis, numerology readings, horoscope services, spiritual journaling, and a platform for connecting with professional healers. The project aims to foster well-being through AI-powered analysis and community connections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui
- **Routing**: Wouter
- **State Management**: TanStack Query (server state), React Context (auth, premium features)
- **UI Components**: Radix UI
- **Animations**: CSS animations and Framer Motion
- **UI/UX**: Consistent dark blue-green aesthetic, responsive mobile design, interactive "Lights Activation" feature on protected routes, two-step "Welcome Onboarding" flow for first-time users, PWA support for native app-like experience.

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: Passport.js (local strategy, express-session)
- **File Upload**: Multer
- **Build System**: ESBuild (server-side), tsx (development)

### Data Storage
- **Database**: PostgreSQL (Neon Database)
- **ORM**: Drizzle ORM
- **Session Store**: PostgreSQL-based (production), memory store (development)
- **Schema Management**: Drizzle Kit

### Key Features & Design Decisions
- **Aura Analysis**: AI-powered image analysis with standardized 600x900px dimensions, distinct zone positioning, and seamless smokey aura effects.
- **Object Analysis**: Spiritual analysis of objects.
- **Numerology**: Comprehensive calculations and interpretations, integrated into user registration with instant blueprint display.
- **Horoscope Services**: Daily, monthly, and yearly astrological readings.
- **Spiritual Journaling**: Mood and energy pattern tracking.
- **Healer Platform**: Marketplace for connecting clients with healers, including booking, dashboards, and analytics. Healers can access client reports.
- **AI Integration**: Utilizes OpenAI GPT-4o and Google Gemini for analysis and content.
- **User Management**: Session-based authentication with three roles (client, healer, semi-healer). New users default to client; healers are manually managed. Subscription-based premium features.
- **Image Processing**: Standardized resizing (600x900) and compression (50KB target) for AI, plus dedicated aura visualization with consistent output.
- **PDF Generation**: Comprehensive reports for aura analysis (clients) and detailed reports (healers), including images, chakra analysis, and notes. Enhanced quality and legibility.
- **Credit System**: Dynamic pricing based on user type for services. Initial credits for new users. Atomic SQL transactions with row-level locking for credit updates.
- **Payment Integration**: Stripe Payment Links for credit packs; webhook automatically adds credits and upgrades accounts.
- **User Verification**: WhatsApp OTP (Twilio) and email validation (AbstractAPI) for registration.
- **Branding**: Dynamic branding, currently "AuraEye" with a symbolic logo.
- **Spiritual Guidance Video System**: Features two distinct video modals for premium content and post-aura scan guidance.
- **Sample Aura Readings**: Home page displays example aura readings with gradient overlays and descriptions.
- **Psychological Integration**: Incorporates color theory, behavioral tracking, and an intelligent psychology engine for personalized prompts, mood tracking, and guidance based on journal entries.
- **Mascot System ("Auri")**: Interactive spiritual companion providing contextual messages, animations, and temporary GIF transformations.
- **Notification System**: Browser push notifications for spiritual reminders with user-controlled preferences and a dedicated settings page.
- **Soul Energy Levels System**: Five-tier progression system (Explorer, Beginner, Intermediate, Advanced, Awakened) tracking spiritual growth, with visual styling and energy rewards for activities.
- **Gamification Features**: Comprehensive badge system (activity-based, tiered) and streak tracking for both healers and clients, displayed in user profiles and healer dashboards.

## External Dependencies

- **Database Connectivity**: `@neondatabase/serverless`
- **AI Services**: `openai`, `@google/generative-ai`
- **Authentication**: `passport`, `express-session`, `bcrypt`
- **Email Service**: `@sendgrid/mail`
- **Payment Processing**: `@stripe/stripe-js`, `@stripe/react-stripe-js`
- **File Processing**: `multer`, `sharp`
- **SMS/OTP**: `twilio`
- **Email Validation**: AbstractAPI Email Validation
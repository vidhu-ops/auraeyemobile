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
- **Numerology**: Comprehensive calculations and interpretations including life path, destiny, and chakra analysis. Combined analysis tab features corrected personality number calculation using only day digits from birth date, reduced to single digit with proper color mapping.
- **Horoscope Services**: Daily, monthly, and yearly astrological readings.
- **Spiritual Journaling**: Mood and energy pattern tracking.
- **Healer Platform**: Marketplace for connecting clients with healers, including real-time booking, detailed healer dashboards, and integrated analytics. Healers can access client analysis reports (aura, numerology) and generate PDFs.
- **AI Integration**: Primary use of OpenAI GPT-4o and Google Gemini for analysis and content generation.
- **User Management**: Session-based authentication, distinct client and healer roles, subscription-based premium features. New users default to client type; healers are manually added and managed via database. Session cookies automatically configured for HTTPS environments (Replit preview/production) with secure: true and sameSite: 'none' to ensure proper cross-site cookie handling.
- **Image Processing**: Dual-system image processing - standardized resizing (600x900) and compression (target 50KB) for AI analysis, plus dedicated aura visualization system creating consistent 600px × 900px output images with standardized zone positioning, seamless smokey blending, and black backgrounds. Includes robust human detection for specific analysis types. Enhanced frontend display with custom aspect-aura ratio (600/900) in Tailwind config ensuring consistent image dimensions across all devices and layouts, fixing previous CSS issues with invalid height classes.
- **PDF Generation**: Comprehensive PDF reports for aura analysis (for clients) and detailed reports (for healers), including original and processed images, chakra analysis, spiritual guidance, and healer notes. PDF compression reduced by 20% (quality increased from 0.92 to 0.98) and screenshot clarity improved (quality increased from 0.9 to 0.95) for enhanced image visibility. Detailed chakra analysis tab automatically breaks into 4 optimized sections with 4.0 scale factor and enhanced text rendering for maximum legibility in PDF downloads.
- **Credit System**: Dynamic pricing based on user type. Clients: Object scan (3), Connect with healer (3), Human aura scan (15), What's my vibe (1), Numerology (5). Healers: Object scan (1), Human aura scan (5), What's my vibe (1), Healer booking (1), Numerology (3). New clients receive 30 initial credits, new healers receive 100 initial credits.
- **User Verification**: WhatsApp OTP for mobile verification (via Twilio), and email validation (via AbstractAPI) during registration.
- **Branding**: Dynamic branding updates, currently using "AuraEye" with new symbolic logo design provided by user (new-logo.jpeg). Logo updated to latest symbol design as per user requirements.
- **Spiritual Guidance Video System**: Two separate video modals - Premium content preview (WhatsApp Video 2025-08-14 at 4.09.26 PM) accessed via "Watch Now" button, and Spiritual guidance video (WhatsApp Video 2025-08-11 at 3.45.29 AM) with post-video navigation asking "Would you like to scan your aura again?" - Yes redirects to /vibe, No redirects to home page.
- **Sample Aura Readings Display**: Home page features three sample aura readings using specific uploaded images for blue (WhatsApp Image 2025-08-18 at 3.56.39 AM), green (WhatsApp Image 2025-08-18 at 3.52.42 AM), and purple (WhatsApp Image 2025-08-18 at 4.01.06 AM) dominant aura demonstrations with matching gradient overlays and descriptive text.
- **Lights Activation Feature**: Interactive feature requiring users to click "Turn On The Lights" button on every app launch, refresh, or reactivation. Dark screen with glowing button and sparkle effects transitions to full application with 1.5-second light-up animation. Triggers for authenticated users on all protected routes, excluding public pages (auth, login, about, contact, pricing, services, healers).
- **Welcome Onboarding**: Beautiful two-step onboarding flow featuring glowing spiritual orb image with mystical effects. Currently set to show on every refresh for testing purposes (see App.tsx comments for production toggle). When launched, will only display for first-time users.
- **PWA Support**: Full Progressive Web App implementation enabling installation on mobile devices. Includes manifest.json with app metadata and branding, service worker for offline support and caching, Apple-specific meta tags for iOS installation, and theme colors matching the app's dark blue-green aesthetic. Users can install AuraEye directly to their home screen on both Android and iOS devices for a native app-like experience.
- **Psychological Integration**: Comprehensive psychology layer incorporating color theory, behavioral tracking, and intelligent prompts. Features emotion-based color variables (calming blues, energizing oranges, balanced greens, focused purples, grounding browns) with psychological commentary explaining their effects. Includes database schema for psychological profiling (dominant moods, stress patterns, energy trends) and mood snapshots (momentary emotional states). Psychology engine generates personalized prompts based on time of day, energy levels, stress indicators, and user patterns. Components include MoodBanner (prominent/subtle variants), MoodColorIndicator, and PsychologicalGreeting. All features are opt-in and non-breaking - existing pages work unchanged. API endpoint `/api/psychology/prompt` analyzes journal entries to provide context-aware psychological guidance.
- **Mascot System ("Auri")**: Interactive spiritual companion character that appears throughout the app with contextual messages. Features include: fixed position at bottom-right of screen across all pages, scale-in/scale-out animations for appearance/disappearance, glow effect triggered by service interactions, personalized messages based on page context and user state (soul energy, aura colors, credits). Mascot displays thought bubbles with dynamic colors matching user's aura and provides encouragement, guidance, and contextual tips. Image automatically floats with CSS animations.
- **Notification System**: Browser push notification support with user-controlled preferences stored in database. Features periodic spiritual reminders every 5 hours with randomized messages encouraging meditation, breathing exercises, and aura checks. Includes notification prompt UI and dedicated Settings page (/settings) accessible via mobile menu and desktop user dropdown for managing push notification preferences. Settings page features toggle controls for enabling/disabling notifications, permission status display, test notification button, rollback error handling, and comprehensive user feedback. Uses Web Push API with VAPID keys and service worker registration for reliable push delivery.

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
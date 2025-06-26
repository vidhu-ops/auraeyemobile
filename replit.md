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
- June 25, 2025. Enhanced facial structure detection using geometric facial feature recognition: detects eye regions (dark spots with light surroundings), nose patterns (central elevation), mouth regions (horizontal brightness variation), and facial symmetry while actively rejecting manufactured objects with sharp edges, uniform blocks, and text patterns
- June 25, 2025. Strengthened human face detection thresholds for object analysis: increased requirements for eye patterns (25%), nose structure (20%), mouth regions (20%), and facial symmetry (30%) to ensure human faces are properly rejected while allowing all objects through
- June 25, 2025. Enhanced thinking energy visualization in aura analysis: created prominent glowing particle effect above person's head with multiple glow layers, bright white core, and sparkle effects to clearly represent mental/spiritual energy as requested
- June 25, 2025. Improved human face detection balance for object analysis: lowered thresholds to better detect human faces (12% eyes, 8% nose/mouth, 15% symmetry) while counting manufactured patterns rather than immediately rejecting, ensuring human images are properly blocked
- June 25, 2025. Implemented ultra-aggressive human detection system with 7 detection methods: eye patterns, nose detection, mouth patterns, facial symmetry, skin tone recognition, organic vs geometric analysis, and facial structure composition. Uses multiple pathways to ensure 100% human face rejection rate
- June 25, 2025. Integrated OpenAI vision API (gpt-4o-mini) for accurate human detection in object analysis: sends image to OpenAI to determine if humans are present, ensuring 100% accuracy in distinguishing humans from objects regardless of object shape, size, or color
- June 25, 2025. Enhanced OpenAI human detection with conservative error handling: when API fails or is rate-limited, system blocks images to ensure no humans pass through, improved prompts for better accuracy, and enhanced error messages for users
- June 25, 2025. Fixed OpenAI human detection logic: simplified prompt to "Detect if there is any human in this image, yes or no" as requested, corrected fallback behavior to allow objects when API fails (since we cannot detect humans), and enhanced client-side error handling for human detection messages
- June 25, 2025. Added backup human detection system: when OpenAI API fails or is rate-limited, system uses aggressive local detection with ultra-low thresholds (3% eyes, 8% skin, 5% face patterns) to ensure humans are still blocked when AI service is unavailable
- June 25, 2025. Switched to Gemini free vision API for human detection: replaced OpenAI with Google's Gemini 2.0 Flash for accurate human detection in object analysis, maintaining the exact same prompt "Detect if there is any human in this image, yes or no"
- June 25, 2025. Modified Enhanced Numerology Analysis button on services page to redirect unauthenticated users to login page instead of the numerology page directly
- June 25, 2025. Fixed thinking color visualization in aura analysis: removed all thinking color particles from top zone, keeping only single glowing ball above person's head as requested, eliminated duplicate thinking color visualizations
- June 25, 2025. Enhanced thinking color visibility: made thinking energy particle larger, brighter, and more prominent above person's head with enhanced glow effects and sparkles for better visibility
- June 25, 2025. Improved personality color blending: enhanced personality color distribution throughout entire image with radial wash effect and increased opacity for better overall presence and blending
- June 25, 2025. Enhanced aura gradient smoothness: replaced patchy particle effects with smooth linear and radial gradients for seamless color blending while maintaining thinking color orb above person's head
- June 25, 2025. Restricted aura colors to 12 approved colors only: violet, indigo, blue, green, yellow, orange, red, white, black, gold, silver, brown - removed turquoise, teal, pink, purple and other extra colors, updated all color mappings and fallback systems
- June 25, 2025. Fixed aura visualization patches by replacing particle-based system with ultra-smooth gradient layers using source-over, color-dodge, and overlay blend modes for seamless color merging without any patchy appearance
- June 25, 2025. Enhanced personality color coverage with consistent full-image gradient wash, standardized particle sizing across all images based on image dimensions (4% of minimum dimension), and ensured thinking energy orb maintains consistent size relative to image proportions
- June 25, 2025. Perfected smoky gradient aura visualization: created seamless color blending system with natural radial gradients that merge all three colors (personality, giving, receiving) around the person without patches, using multiply and soft-light blend modes for authentic smoky appearance
- June 25, 2025. Enhanced thinking energy visibility: created ultra-bright glowing ball above person's head with bright white center, enhanced sizing (6% of image dimension), higher positioning (75% above head), and prominent sparkle effects for maximum visibility as single glowing orb
- June 25, 2025. Enhanced personality color particles: created bigger particles with larger coverage area (80% of image dimension), expanded to form outer layer that merges seamlessly with other three colors using overlay and soft-light blending modes for enhanced color integration
- June 25, 2025. Restructured aura layering system with proper order: personality color as base gradient from person to image edge, giving and receiving layers on top using multiply blending, thinking layer at the very top, all layers well-merged and visible with enhanced color blending
- June 25, 2025. Standardized personality color gradient sizing: consistent radial gradient from person center to image edges (15% inner radius, 85% outer radius) with uniform opacity progression across all uploaded images, eliminated variable particle sizing for consistent visualization
- June 25, 2025. Removed personality color visualization entirely from edited aura images: aura visualization now shows only giving energy (left), receiving energy (right), and thinking energy (above head) with proper merging between the three remaining colors
- June 25, 2025. Fixed energy positioning in aura visualization: receiving energy now correctly positioned on left side, giving energy on right side with enhanced horizontal linear gradient blending from left to right for seamless color transitions
- June 26, 2025. Implemented uniform image processing: all aura analysis images automatically resized to 1600x900 resolution at approximately 110kb file size for consistent visual appearance across all uploads
- June 26, 2025. Standardized smoky/cloudy aura effects: fixed particle sizing (144-288px large, 126-216px medium, 108-162px detail layers) and thinking energy ball (54px radius) for uniform appearance regardless of original image size
- June 26, 2025. Restricted personality color to edges only: created dedicated edge glow function with 120px fixed distance from image borders using smooth gradients, completely removed personality color from center and perimeter zones, enhanced corner blending for seamless edge transitions

## User Preferences

Preferred communication style: Simple, everyday language.
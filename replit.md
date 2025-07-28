# Adrielle Benhossi Psychology Website

## Overview

This is a modern, full-stack web application for Dr. Adrielle Benhossi, a psychologist. The application serves as a professional website featuring services, testimonials, and contact information with a feminine, elegant design aesthetic. It's built using a monorepo structure with React frontend and Express.js backend.

## Recent Changes

- **January 21, 2025**: Complete professional information update
- Updated psychologist name from Dra. Olizete to Dra. Adrielle Benhossi
- Changed location from São Paulo to Campo Mourão, Paraná
- Updated education from USP to Centro Universitário Integrado
- Modified contact info: phone (44) 998-362-704, email escutapsi@adrielle.com.br
- Added LinkedIn profile: linkedin.com/in/adrielle-benhossi-75510034a
- Clarified private practice (particular) service without insurance coverage
- Updated CRP registration to reflect Paraná region (08/123456)
- **January 21, 2025**: Major aesthetic improvements and design refinement
- Enhanced mobile-first design with modern glassmorphism cards (card-aesthetic class)
- Improved typography hierarchy with text-gradient effects and better spacing
- Hero section redesigned with cleaner background, restored "Saiba mais" button per user request
- About section with professional card layouts and enhanced credibility indicators  
- Testimonials carousel with refined styling and better mobile experience
- FAQ and Contact sections with consistent aesthetic theme and improved readability
- CSS utilities added: section-spacing, mobile-container, card-aesthetic for consistency
- Removed excessive yellow shadows and maintained clean, professional appearance
- All sections now use consistent spacing and modern design patterns
- **January 21, 2025**: Admin panel enhancements and drag-drop functionality
- Added "Made with ♥ by ∞" footer to admin panel
- Implemented drag and drop reordering for services, testimonials, and FAQ items
- Added explanatory tooltips for drag and drop functionality
- Created complete site reset button to restore all default configurations
- Fixed avatar display issues in hero section mobile layout
- Corrected DELETE endpoint for hero image reset functionality
- Enhanced mobile hero photo layout with proper alignment and transparency effects
- **January 21, 2025**: Massive icon library expansion for services
- Expanded service icons from 5 to 40+ professional options
- Added comprehensive categories: Health Mental, Relationships, Well-being, Communication, Growth, Mindfulness, Support, Family, Movement, and Time
- Updated ServicesSection component with complete icon mapping support
- Organized icon selection with category groups and descriptive labels
- Reset button moved to "Danger Zone" in General tab with enhanced confirmation dialog
- **January 21, 2025**: Avatar system unification and testimonial avatar expansion
- Fixed Footer avatar to use same hero_image configuration as Header and Hero sections
- Expanded testimonial avatar options from 4 to 50+ diverse options including:
  - Age groups: babies, children, teens, adults, elderly
  - Demographics: men, women, couples, families (nuclear, single parent, grandparents)
  - Diversity: disabilities, ethnicities, LGBTQ+, professionals, situations
  - Categories organized with emojis and clear descriptions for better UX
- All profile photos now sync across entire site (Header, Hero, About, Footer) when uploaded
- Consistent avatar behavior throughout the platform
- **January 21, 2025**: Complete gradient text system and FAQ section improvements
- Implemented automatic gradient text processing with (word) syntax across all sections
- Added visual "()" indicators to admin panel fields that support gradient effects
- Corrected testimonials structure with Badge + Title + Description format
- Fixed FAQ section with complete 3-field structure: Badge + Title + Description
- All section titles now consistent with font-medium (bold) styling
- Footer updated to show "made with ♥" (yellow heart) instead of infinity symbol
- **January 21, 2025**: Enhanced mobile drag-and-drop functionality across all admin sections
- Implemented TouchSensor for optimal mobile touch interaction in drag-and-drop operations
- Added complementary PointerSensor for desktop compatibility and fallback support
- Optimized activation constraints: 250ms delay and 5px tolerance for touch, 8px distance for pointer
- Applied mobile-optimized drag-and-drop to all admin sections: section reordering, testimonials, FAQ items, and services
- Fixed TypeScript errors in section ordering system with proper Record<string, number> typing
- All drag-and-drop operations now support both mobile touch and desktop pointer interactions seamlessly

## User Preferences

Preferred communication style: Simple, everyday language.
Code documentation: Comprehensive Portuguese comments explaining every line and functionality.
Avatar requirements: Specific, differentiated designs matching testimonial descriptions.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server:

- **Frontend**: React with TypeScript and Vite for development
- **Backend**: Express.js with TypeScript for API endpoints
- **Database**: PostgreSQL with Drizzle ORM for data management
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Production build with esbuild for server bundling

## Key Components

### Frontend Architecture
- **React Router**: Using Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for smooth transitions and interactions

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **Development Setup**: Vite middleware integration for hot reloading
- **Storage Interface**: Abstracted storage layer with in-memory fallback

### Component Structure
- **Layout Components**: Navigation, Footer with responsive design
- **Page Sections**: Hero, About, Services, Testimonials, FAQ, Contact
- **UI Components**: Complete shadcn/ui component set for consistent design
- **Custom Hooks**: Mobile detection, toast notifications

## Data Flow

1. **Client-Side Rendering**: React components render with initial state
2. **API Communication**: React Query handles server communication
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Development Mode**: Vite dev server proxies API calls to Express backend
5. **Production Mode**: Static files served by Express with API endpoints

## External Dependencies

### Core Dependencies
- **Frontend**: React, TypeScript, Vite, Wouter, TanStack Query
- **Backend**: Express, Drizzle ORM, Neon Database serverless
- **UI**: Radix UI components, Tailwind CSS, Framer Motion
- **Development**: ESBuild, TypeScript compiler, Drizzle Kit

### Database
- **Primary**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle with schema in shared directory
- **Migrations**: Drizzle Kit for schema management

### Styling and UI
- **CSS Framework**: Tailwind CSS with custom configuration
- **Component Library**: shadcn/ui with "new-york" style
- **Icons**: Lucide React, React Icons (Font Awesome)
- **Animations**: Framer Motion for micro-interactions

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with watch mode for Express server
- **Database**: Environment variable for DATABASE_URL connection

### Production Build
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Static Serving**: Express serves built frontend files
4. **Database Migration**: Drizzle push command for schema updates

### Environment Configuration
- **Development**: NODE_ENV=development with Vite middleware
- **Production**: NODE_ENV=production serving static files
- **Database**: DATABASE_URL environment variable required
- **Replit Integration**: Special handling for Replit environment variables

The architecture emphasizes type safety, developer experience, and maintainable code organization while providing a professional, responsive web presence for the psychology practice.
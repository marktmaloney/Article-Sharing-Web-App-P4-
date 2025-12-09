# Article Sharing Platform - Design Guidelines

## Design Approach
**System-Based Design** inspired by modern community platforms (Reddit, Hacker News, Product Hunt) with Material Design principles for content-rich applications.

## Core Design Elements

### Typography
- **Primary Font**: Inter or System UI Stack via Google Fonts
- **Headings**: Font weight 600-700, sizes: text-2xl (page titles), text-lg (section headers)
- **Body Text**: Font weight 400, text-base for article titles, text-sm for metadata
- **Links**: Font weight 500, underline on hover

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 (p-2, p-4, p-6, p-8, gap-4, space-y-6, etc.)
- Consistent use of p-6 for card padding
- gap-4 for list item spacing
- py-8 for section separation

### Component Library

#### Navigation Bar
- Fixed top navigation with platform name/logo on left
- User menu on right showing username with dropdown (My Posts, Logout)
- Admin badge indicator next to username for admin users
- Height: h-16, horizontal padding px-6

#### Authentication Forms (Login/Register)
- Centered card layout, max-w-md
- Stacked form fields with labels above inputs
- Input fields: h-12, rounded-md, border focus states
- Primary action button at bottom (full width)
- Toggle link between login/register forms
- No hero image - simple centered form on clean background

#### Article Feed (Main Content Area)
- Maximum width container: max-w-4xl, centered
- Each article card contains:
  - Article title (clickable link, text-lg, font-medium)
  - Submitted URL (text-sm, truncated with ellipsis)
  - Metadata row: Posted by [username] • [timestamp]
  - Delete button (visible for own posts + admin for all posts)
- Card spacing: space-y-4 between articles
- Card design: border, rounded-lg, p-6

#### Post Article Section
- Compact form at top of feed or modal
- Single URL input field with label
- Submit button aligned to right
- Input validation messaging below field

#### User Role Indicators
- Admin badge: Small pill/chip next to username (text-xs, rounded-full, px-3, py-1)
- Visual distinction for admin posts in feed (subtle accent border)

#### Delete Functionality
- Icon button with trash icon (from Heroicons)
- Positioned top-right of article card
- Confirmation modal before deletion

#### Empty States
- Centered message when no articles exist
- Icon + "No articles yet" text + "Be the first to share" CTA

### Animations
Minimal, functional animations only:
- Smooth transitions for dropdown menus (transition-all duration-200)
- Fade-in for newly posted articles
- No scroll animations or decorative motion

### Accessibility
- Focus rings on all interactive elements
- Proper label associations for form inputs
- ARIA labels for icon buttons
- Keyboard navigation support for dropdowns and modals

## Images
**No images required** - This is a content-focused utility application. The design relies on clean typography, structured layouts, and clear information hierarchy rather than visual imagery.
# Spotify Replica Design Guidelines

## Design Approach
**Reference-Based**: Drawing directly from Spotify's design language and modern music streaming platforms (Apple Music, YouTube Music) to create an authentic, familiar experience while maintaining originality in implementation.

## Core Layout System

**Sidebar Navigation (Fixed Left)**
- Width: 240px on desktop, collapsible to 64px (icon-only) on tablet
- Structure: Logo at top, main navigation (Home, Search, Library), followed by user playlists
- Bottom section: User profile with account status indicator

**Main Content Area**
- Fluid width with max-width constraint of 1600px
- Padding: 8 units (2rem) on all sides
- Vertical sections flow naturally with 8-unit spacing between major content blocks

**Player Bar (Fixed Bottom)**
- Height: 90px, spans full width
- Three-column layout: Now Playing Info (25%) | Controls (50%) | Volume/Queue (25%)
- Elevated above main content with subtle shadow

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently (p-2, m-4, gap-6, py-8)

## Typography Hierarchy

**Font Families**
- Primary: 'Inter' or 'Circular' (Spotify's actual font) from Google Fonts
- Fallback: system-ui, -apple-system

**Scale**
- Hero Headings: 3rem (48px), font-weight 700
- Section Headings: 1.5rem (24px), font-weight 700
- Card Titles: 1rem (16px), font-weight 600
- Body Text: 0.875rem (14px), font-weight 400
- Metadata/Small: 0.75rem (12px), font-weight 400

## Component Library

### Song Cards
- Square album artwork with 1:1 aspect ratio
- Hover state: Subtle scale (1.02x), play button overlay appears
- Bottom: Song title (truncate), artist name in subdued style
- Grid: 4-6 columns on desktop, 2-3 on tablet, 1-2 on mobile

### Playlist Cards
- Similar to song cards but with compilation artwork
- Include track count and creator metadata below title
- Same hover interactions as song cards

### Player Controls
- Center-aligned control group with prominent play/pause button (48px)
- Previous/Next (32px), Shuffle/Repeat toggle buttons (28px) flanking main control
- Progress bar spans full width below controls with time stamps on both ends
- Seekable slider with thumb indicator on hover/drag

### Admin Panel
- Dashboard layout with card-based metrics at top
- Song management table with sortable columns: Cover, Title, Artist, Album, Duration, Actions
- Inline editing: Click to edit fields, confirm/cancel buttons appear
- Upload interface: Drag-drop zone for cover images with preview thumbnail
- User management table: Username, Email, Role, Status badge, Suspend/Activate actions

### Authentication
- Centered modal overlay (max-width 400px) with subtle backdrop blur
- Form fields with floating labels
- Role indicator badge (Admin/User) visible after login in sidebar

### Suspension Interface (Admin)
- Modal with user details and suspension duration picker
- Quick presets: 1 day, 1 week, 1 month, custom date range
- Reason textarea for suspension notes
- Confirmation step before applying

## Navigation Patterns

**Primary Navigation**: Fixed sidebar with icon + label format
**Contextual Actions**: Three-dot menu buttons for song/playlist options
**Breadcrumbs**: For nested views (Playlist > Song Details)
**Search**: Prominent search bar in top navigation with instant results dropdown

## Content Sections

### Home View
- "Recently Played" horizontal scrollable row of album cards
- "Recommended for You" section below
- "Your Top Mixes" personalized playlists
- Each section: Title + "See All" link

### Library View
- Tabbed interface: Playlists | Artists | Albums
- Grid layout for items with filter/sort controls at top
- Empty states with prompts to add content

### Admin Dashboard
- Stats cards row: Total Songs, Total Users, Active Users, Suspended Accounts
- Quick actions toolbar: Add Song, Manage Users
- Main content area switches between Song Management and User Management tabs

## Performance Optimizations (Visual Impact)

**Image Strategy**
- Album covers: Load in progressive quality (blur-up effect)
- Placeholder: Solid fill with music note icon while loading
- Lazy load images outside viewport

**Transitions**
- Page transitions: Smooth fade (150ms)
- Card hovers: Transform 200ms ease-out
- Player controls: Instant feedback, no delay
- Avoid elaborate animations; prioritize responsiveness

## Responsive Breakpoints

- Mobile: < 640px (single column, bottom tab navigation, sidebar becomes drawer)
- Tablet: 640px - 1024px (2-3 column grids, collapsible sidebar)
- Desktop: > 1024px (full layout with fixed sidebar and player)

## Icon Library
**Heroicons** via CDN for UI elements:
- Play/Pause, Skip, Shuffle, Repeat icons
- Heart (like), Plus (add), Menu, Search, User profile
- Edit, Delete, Upload for admin actions

## Accessibility
- Keyboard navigation for all player controls (spacebar play/pause, arrow keys for seek)
- Focus indicators on all interactive elements (2px outline)
- ARIA labels for icon-only buttons
- Screen reader announcements for now playing track changes
- High contrast mode support with distinct focus states

## Images
No hero images needed for this application. All imagery consists of:
- Album/song cover artwork (square, 300x300px optimal)
- User profile pictures (circular, 40x40px)
- Placeholder music note icon for missing covers

Focus on data density and functional clarity over decorative imagery.
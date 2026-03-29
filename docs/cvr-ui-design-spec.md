# CVR - Cockpit Voice Recorder: UI Design Specification

> Desktop application UI for a video subtitle generator tool.
> Tauri (Rust + Web Frontend) | Windows / macOS

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing and Layout](#4-spacing-and-layout)
5. [Component Library](#5-component-library)
6. [Screen Specifications](#6-screen-specifications)
7. [Animations and Transitions](#7-animations-and-transitions)
8. [Accessibility](#8-accessibility)
9. [CSS Design System](#9-css-design-system)

---

## 1. Design Philosophy

### Core Principles

**Aviation-grade precision.** Every element serves a purpose. The interface draws from cockpit instrument panels: high-contrast readouts against dark backgrounds, status indicators that communicate state at a glance, and information hierarchy that mirrors how pilots scan instruments.

**Progressive disclosure.** The main screen shows only what is needed: drop a file, press go. Advanced settings live behind a single gear icon. No clutter, no decision paralysis.

**Confidence through feedback.** Every action produces clear, immediate feedback. Drag hover states glow. Progress moves with purpose. Completion is unmistakable. The user always knows exactly what the application is doing.

### Visual Language

The design sits at the intersection of three references:

- **Primary Flight Display (PFD):** Dark backgrounds, luminous readouts, scanline-thin borders
- **Modern design tools:** Clean spacing, rounded containers, subtle shadows
- **Terminal aesthetics:** Monospace accents, status codes, structured data

---

## 2. Color System

### Core Palette

```
Background Layers
--bg-deep:        #0A0E14    Base canvas, deepest layer
--bg-surface:     #111720    Primary surface (cards, panels)
--bg-elevated:    #1A2130    Elevated surface (modals, dropdowns)
--bg-hover:       #222B3A    Hover state for interactive surfaces

Borders
--border-subtle:  #1E2738    Subtle dividers, card edges
--border-default: #2A3548    Default borders
--border-bright:  #3A4A60    Active/focus borders

Text
--text-primary:   #E8ECF1    Primary body text
--text-secondary: #8899AA    Secondary / label text
--text-muted:     #556677    Disabled text, placeholders
--text-inverse:   #0A0E14    Text on bright backgrounds
```

### Aviation Accent Colors

```
Instrument Green (Primary Action / Success)
--green-dim:      #0D3B2E    Background tint
--green-base:     #00E68A    Primary green, progress bars, success
--green-glow:     #00E68A33  Glow / shadow for green elements (20% opacity)

Amber (Warning / Caution)
--amber-dim:      #3B2E0D    Background tint
--amber-base:     #FFB020    Warnings, caution states
--amber-glow:     #FFB02033  Glow for amber elements

Cyan / Blue (Information / Readout)
--cyan-dim:       #0D2E3B    Background tint
--cyan-base:      #00D4FF    Information readouts, links, selections
--cyan-glow:      #00D4FF33  Glow for cyan elements

Red (Error / Alert)
--red-dim:        #3B0D14    Background tint
--red-base:       #FF3B5C    Errors, destructive actions
--red-glow:       #FF3B5C33  Glow for red elements

White / Neutral Accent
--white-dim:      #FFFFFF0A  Subtle overlay (4% opacity)
--white-accent:   #FFFFFF1A  Border highlight (10% opacity)
```

### Semantic Mapping

| Purpose               | Color         | Token             |
|------------------------|---------------|-------------------|
| Primary action button  | Green #00E68A | `--green-base`    |
| Processing / progress  | Cyan #00D4FF  | `--cyan-base`     |
| Active stage indicator | Cyan #00D4FF  | `--cyan-base`     |
| Completed stage        | Green #00E68A | `--green-base`    |
| Pending stage          | Muted #556677 | `--text-muted`    |
| Warning / caution      | Amber #FFB020 | `--amber-base`    |
| Error state            | Red #FF3B5C   | `--red-base`      |
| Drop zone active       | Cyan glow     | `--cyan-glow`     |
| Selected file          | Cyan #00D4FF  | `--cyan-base`     |

---

## 3. Typography

### Font Stack

```
Primary (UI):        "Inter", "SF Pro Display", system-ui, sans-serif
Monospace (Data):    "JetBrains Mono", "SF Mono", "Cascadia Code", monospace
```

Inter is the primary typeface for all UI elements. JetBrains Mono is used for timestamps, file paths, technical readouts, and the subtitle preview.

### Type Scale

| Token       | Size   | Weight | Line Height | Usage                          |
|-------------|--------|--------|-------------|--------------------------------|
| `--t-hero`  | 28px   | 600    | 1.2         | App title in titlebar          |
| `--t-h1`    | 22px   | 600    | 1.3         | Screen headings                |
| `--t-h2`    | 17px   | 600    | 1.4         | Section headings               |
| `--t-h3`    | 14px   | 600    | 1.4         | Sub-section, labels            |
| `--t-body`  | 14px   | 400    | 1.5         | Body text                      |
| `--t-small` | 12px   | 400    | 1.5         | Secondary info, hints          |
| `--t-micro` | 11px   | 500    | 1.3         | Badges, status codes           |
| `--t-mono`  | 13px   | 400    | 1.6         | Timestamps, file paths, code   |

### Typography Rules

- All caps with `letter-spacing: 0.08em` for stage labels and status badges
- Tabular numbers (`font-variant-numeric: tabular-nums`) for timestamps and percentages
- No font size below 11px for accessibility

---

## 4. Spacing and Layout

### Spacing Scale (4px base)

```
--sp-1:   4px
--sp-2:   8px
--sp-3:   12px
--sp-4:   16px
--sp-5:   20px
--sp-6:   24px
--sp-8:   32px
--sp-10:  40px
--sp-12:  48px
--sp-16:  64px
```

### Window Dimensions

- **Default size:** 840 x 620 px
- **Minimum size:** 720 x 540 px
- **Maximum size:** responsive, scales up cleanly

### Layout Grid

The application uses a single-column centered layout. Maximum content width is 680px, centered within the window. Side padding is 48px minimum.

```
+----------------------------------------------+
|  [Title Bar - Custom]                        |
+----------------------------------------------+
|                                              |
|     +----------------------------------+     |
|     |                                  |     |
|     |       Content Area (680px)       |     |
|     |                                  |     |
|     +----------------------------------+     |
|                                              |
+----------------------------------------------+
```

### Border Radius Scale

```
--radius-sm:    4px     Buttons, badges, small elements
--radius-md:    8px     Cards, inputs, dropdowns
--radius-lg:    12px    Large containers, modals
--radius-xl:    16px    Drop zone, hero cards
--radius-full:  9999px  Pills, circular indicators
```

---

## 5. Component Library

### 5.1 Custom Title Bar

Tauri uses a custom title bar for consistent cross-platform appearance.

```
+----------------------------------------------+
| [CVR logo]  CVR              [_] [x]         |
+----------------------------------------------+
```

- Height: 40px
- Background: `--bg-deep`
- Bottom border: 1px `--border-subtle`
- Logo: Small stylized radar/waveform icon, rendered in `--cyan-base`
- Title text: "CVR" in `--t-h3`, all caps, `letter-spacing: 0.12em`, color `--text-secondary`
- Drag region covers full width except window control buttons
- Window controls: minimal custom icons, 12px, muted until hover

### 5.2 Drop Zone

The centerpiece of the empty state. A large dashed-border rectangle that invites file drops.

**Default state:**
- Dimensions: Full content width (680px), 280px tall
- Border: 2px dashed `--border-default`, radius `--radius-xl`
- Background: `--bg-surface`
- Center content: Upload icon (48px, `--text-muted`), text below: "Drop a video file here" in `--t-h2` `--text-secondary`, subtext "or click to browse" in `--t-small` `--text-muted`
- Supported formats hint at bottom: ".mp4 .mkv .avi .mov .webm" in `--t-micro` `--text-muted`

**Drag hover state (file over zone):**
- Border: 2px solid `--cyan-base`
- Background: `--cyan-dim`
- Box shadow: `0 0 40px var(--cyan-glow)`, `inset 0 0 40px var(--cyan-glow)`
- Upload icon scales to 56px and pulses gently, color shifts to `--cyan-base`
- Text changes to "Release to load" in `--cyan-base`
- Dashed border animates: dash offset rotates (marching ants effect)
- Transition: 200ms ease-out for all properties

**File loaded state:**
- Border: 2px solid `--green-base`
- Background: `--green-dim`
- Shows: File icon + filename in `--t-body` `--text-primary`, file size in `--t-small` `--text-secondary`
- Small "x" button (top-right corner of zone) to remove file, hover reveals it
- Duration readout in monospace: "02:34:17" if detectable

### 5.3 Buttons

**Primary button (Start Processing):**
- Background: `--green-base`
- Text: `--text-inverse`, `--t-h3`, all caps, `letter-spacing: 0.06em`
- Padding: 12px 32px
- Radius: `--radius-sm`
- Hover: brightness 1.1, subtle lift (`translateY(-1px)`), box-shadow `0 4px 20px var(--green-glow)`
- Active: brightness 0.95, no lift
- Disabled: opacity 0.4, no pointer events

**Secondary button (Export, Settings):**
- Background: transparent
- Border: 1px solid `--border-default`
- Text: `--text-secondary`, `--t-body`
- Hover: border-color `--text-secondary`, text `--text-primary`, background `--bg-hover`

**Icon button (Settings gear, Close):**
- Size: 36px square
- Background: transparent
- Icon: 18px, `--text-muted`
- Hover: background `--bg-hover`, icon `--text-secondary`
- Radius: `--radius-sm`

### 5.4 Input Fields

**Text input (API key):**
- Height: 40px
- Background: `--bg-deep`
- Border: 1px solid `--border-default`
- Radius: `--radius-md`
- Padding: 0 12px
- Text: `--t-body` `--text-primary`
- Placeholder: `--text-muted`
- Focus: border-color `--cyan-base`, box-shadow `0 0 0 3px var(--cyan-glow)`
- For API key: use `type="password"` with a toggle eye icon to reveal

**Select / Dropdown:**
- Same dimensions as text input
- Custom chevron icon on right side, 16px, `--text-muted`
- Dropdown panel: background `--bg-elevated`, border 1px `--border-default`, radius `--radius-md`, shadow `0 8px 32px rgba(0,0,0,0.5)`
- Options: padding 8px 12px, hover background `--bg-hover`, selected has `--cyan-base` left accent (3px bar)

### 5.5 Settings Panel

Settings are accessed via a gear icon in the top-right corner of the content area. Clicking it slides open an overlay panel from the right side.

**Panel layout:**
- Width: 360px
- Background: `--bg-surface`
- Left border: 1px `--border-subtle`
- Slides in from right with 250ms ease-out
- Backdrop: `--bg-deep` at 60% opacity, click to close

**Settings sections, top to bottom:**

```
API Configuration
+---------------------------------------+
| OpenAI API Key                        |
| [*************************] [eye]     |
| Saved locally, never sent to servers  |
+---------------------------------------+

Transcription
+---------------------------------------+
| Whisper Model                         |
| [ small | medium | large-v3 ]         |
|                                       |
| Source Language                        |
| [ Auto-detect          v ]            |
+---------------------------------------+

Translation
+---------------------------------------+
| Target Language                        |
| [ Japanese             v ]            |
|                                       |
| Subtitle Mode                         |
| [ Bilingual | Translated | Original ] |
+---------------------------------------+
```

- Section headings: `--t-h3`, all caps, `letter-spacing: 0.08em`, `--text-muted`, with a thin line separator below
- Segmented controls (Whisper model, subtitle mode) instead of dropdowns for small option sets
- Segmented control: pills with `--bg-deep` background, active pill gets `--cyan-base` text and `--bg-hover` background with subtle glow

### 5.6 Progress Pipeline (Processing Screen)

A vertical pipeline display showing the four processing stages.

```
    [=] Extracting audio          DONE       00:03
    [=] Transcribing              47%        00:28
    [ ] Translating               PENDING     --
    [ ] Complete                  PENDING     --
```

**Stage row layout:**
- Height: 56px per row
- Left: status icon (20px circle)
  - Pending: hollow circle, 2px border `--border-default`
  - Active: filled circle with pulsing glow in `--cyan-base`, spinning ring animation
  - Complete: filled circle `--green-base` with checkmark icon
  - Error: filled circle `--red-base` with X icon
- Center-left: Stage name in `--t-body` `--text-primary` (active) or `--text-muted` (pending)
- Center-right: Status badge
  - Pending: "PENDING" in `--t-micro`, all caps, `--text-muted`
  - Active: percentage or "IN PROGRESS" in `--t-micro`, `--cyan-base`
  - Done: "DONE" in `--t-micro`, `--green-base`
  - Error: "ERROR" in `--t-micro`, `--red-base`
- Right: elapsed time in monospace `--t-mono`, `--text-muted`

**Connecting line:** A vertical line (2px) connects the status circles on the left. Completed sections are `--green-base`, active section has a gradient from green to cyan, pending is `--border-subtle`.

**Progress bar (for transcription stage):**
- Appears below the transcription row when active
- Full width, 3px tall, radius `--radius-full`
- Track: `--bg-deep`
- Fill: linear-gradient left to right, `--cyan-base` to `--green-base`
- Animated shimmer overlay moving left-to-right (aviation scanner feel)
- Percentage number updates with tabular-nums for stable width

### 5.7 Subtitle Preview (Result Screen)

A scrollable list showing the generated subtitle entries.

**Entry layout:**

```
+-----------------------------------------------+
|  001   00:00:12,400 --> 00:00:15,800           |
|        Hello, welcome to the presentation.     |
|        presentation e youkoso.                 |
+-----------------------------------------------+
```

- Index number: `--t-mono`, `--text-muted`, fixed width column (48px)
- Timestamp range: `--t-mono`, `--cyan-base`
- Original text: `--t-body`, `--text-primary`
- Translated text: `--t-body`, `--text-secondary` (only shown in bilingual mode)
- Row background: alternating `--bg-surface` and `--bg-deep` (very subtle)
- Row hover: background `--bg-hover`
- Top border per entry: 1px `--border-subtle`
- Container: max-height with vertical scroll, custom thin scrollbar styled to match theme

### 5.8 Status Bar (Bottom)

A thin status bar at the very bottom of the window.

- Height: 28px
- Background: `--bg-deep`
- Top border: 1px `--border-subtle`
- Left side: current state text in `--t-micro` `--text-muted` (e.g., "Ready", "Processing...", "3 subtitles generated")
- Right side: Whisper model badge, target language badge (small pills, `--bg-hover`, `--text-muted`)

---

## 6. Screen Specifications

### Screen 1: Main Screen (Empty State)

The landing experience. Maximally simple.

```
+----------------------------------------------+
|  [CVR]  CVR                    [_] [x]       |  <- Title bar (40px)
+----------------------------------------------+
|                                              |
|                                              |
|     +----------------------------------+     |
|     |                                  |     |
|     |         [ Upload Icon ]          |     |  <- Drop zone (280px)
|     |    Drop a video file here        |     |
|     |       or click to browse         |     |
|     |                                  |     |
|     |    .mp4 .mkv .avi .mov .webm     |     |
|     +----------------------------------+     |
|                                              |
|                            [ Settings ]      |  <- Gear icon, top-right
|                                              |
|              [  START  ]                     |  <- Disabled until file loaded
|                                              |
+----------------------------------------------+
|  Ready                  small | Auto | EN    |  <- Status bar (28px)
+----------------------------------------------+
```

**Layout details:**
- Drop zone is vertically centered with slight upward bias (40% from top)
- Settings gear icon positioned at top-right of content area, always visible
- START button: centered below drop zone, 24px gap
- START is disabled (0.4 opacity) until a file is loaded
- If no API key is configured, a subtle amber banner appears below the drop zone: "Set your OpenAI API key in Settings to begin" with amber left border

**First-time experience:**
- On first launch, the settings panel auto-opens with the API key field focused
- A pulsing dot on the gear icon indicates settings need attention

### Screen 2: File Loaded (Pre-Processing)

After a file is dropped, the drop zone transforms.

```
+----------------------------------------------+
|  [CVR]  CVR                    [_] [x]       |
+----------------------------------------------+
|                                              |
|     +----------------------------------+     |
|     |  [Film icon]                [x]  |     |  <- File loaded state
|     |  interview_final_cut.mp4         |     |
|     |  245 MB   |   02:34:17           |     |
|     +----------------------------------+     |
|                                              |
|              [  START  ]                     |  <- Now enabled, green glow
|                                              |
+----------------------------------------------+
|  Ready                  small | Auto | JA    |
+----------------------------------------------+
```

**Transition from empty to loaded:**
- Drop zone shrinks height from 280px to 100px (300ms ease)
- Green border fades in
- File info fades in with slight upward slide (200ms, 50ms delay)
- START button transitions from disabled to enabled with a brief green pulse

### Screen 3: Processing

The pipeline view takes center stage. The drop zone collapses to a compact file reference.

```
+----------------------------------------------+
|  [CVR]  CVR                    [_] [x]       |
+----------------------------------------------+
|                                              |
|  interview_final_cut.mp4  245MB  02:34:17    |  <- Compact file bar
|  -----------------------------------------   |
|                                              |
|     [*] Extracting audio        DONE   00:03 |
|      |                                       |
|     [@] Transcribing             47%   00:28 |
|      |  [============================---]    |  <- Progress bar
|      |                                       |
|     [ ] Translating           PENDING    --  |
|      |                                       |
|     [ ] Complete              PENDING    --  |
|                                              |
|              [ CANCEL ]                      |  <- Secondary style
|                                              |
+----------------------------------------------+
|  Processing...              small | Auto | JA|
+----------------------------------------------+
```

**Behavior details:**
- File reference collapses to a single-line bar at the top of content area
- Pipeline stages appear with staggered fade-in (each 100ms apart)
- Active stage has a subtle background highlight strip (`--cyan-dim` at 30%)
- Progress bar only appears during Transcribing stage (the longest step)
- CANCEL button replaces START, styled as secondary with `--red-base` on hover
- On cancel: confirmation dialog, then returns to file-loaded state
- Each stage transition has a brief "flash" on the status icon as it moves from active to complete

**Error handling:**
- If a stage fails, its icon turns red, status shows "ERROR"
- An error message appears below the failed stage in `--t-small` `--red-base`
- A "RETRY" button appears (primary style but amber)
- Other pending stages remain pending

### Screen 4: Complete / Result

Processing is done. The pipeline compresses and the subtitle preview expands.

```
+----------------------------------------------+
|  [CVR]  CVR                    [_] [x]       |
+----------------------------------------------+
|                                              |
|  interview_final_cut.mp4          COMPLETE   |  <- Compact, green badge
|  -----------------------------------------   |
|                                              |
|  Generated Subtitles (127 entries)  [EXPORT] |  <- Header + export button
|                                              |
|  +----------------------------------------+  |
|  | 001  00:00:12,400 --> 00:00:15,800     |  |
|  |      Hello, welcome to the show.       |  |  <- Subtitle preview
|  |      Youkoso.                          |  |     (scrollable)
|  | ----------------------------------------|  |
|  | 002  00:00:16,100 --> 00:00:19,500     |  |
|  |      Today we will discuss the future. |  |
|  |      Kyou wa mirai ni tsuite...        |  |
|  | ----------------------------------------|  |
|  | 003  00:00:20,000 --> 00:00:24,200     |  |
|  |      Let's begin with an overview.     |  |
|  |      Mazu gaiyou kara hajimemashou.    |  |
|  +----------------------------------------+  |
|                                              |
|      [ NEW FILE ]       [ EXPORT .SRT ]      |
|                                              |
+----------------------------------------------+
|  Complete  127 entries      small | Auto | JA|
+----------------------------------------------+
```

**Layout details:**
- Pipeline collapses to the compact file bar with a green "COMPLETE" badge
- Subtitle preview takes up remaining vertical space (flexible height)
- Preview container has `--bg-deep` background, 1px `--border-subtle` border, radius `--radius-lg`
- Custom scrollbar: 6px wide, track `--bg-surface`, thumb `--border-default`, thumb hover `--text-muted`
- Bottom action bar: "NEW FILE" (secondary) and "EXPORT .SRT" (primary, green)

**Export behavior:**
- Click EXPORT opens a native OS save dialog (via Tauri file dialog API)
- Default filename: `{original_name}.srt`
- After save: brief green toast notification "Saved to /path/to/file.srt" that fades after 3 seconds
- Toast appears at bottom-center, above status bar, with green left border

---

## 7. Animations and Transitions

### Global Timing

```
--ease-out:       cubic-bezier(0.16, 1, 0.3, 1)      Deceleration, elements arriving
--ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1)      Smooth state changes
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1)   Bouncy, satisfying feedback

--duration-fast:    150ms
--duration-normal:  250ms
--duration-slow:    400ms
```

### Specific Animations

**Drop zone drag hover:**
- Border dash offset animates continuously (marching ants): `@keyframes march { to { stroke-dashoffset: -20px } }`, 800ms linear infinite
- Background color transition: 200ms ease-out
- Icon scale: 1.0 to 1.15, 200ms ease-spring
- Glow box-shadow: 200ms ease-out

**Drop zone file accepted:**
- Brief scale pulse: 1.0 to 1.02 to 1.0, 300ms ease-spring
- Border color transition to green: 200ms
- Content crossfade: old content fades out (150ms), new fades in (200ms, 100ms delay)

**Processing stage activation:**
- Status icon: scale from 0.8 to 1.0 with fade, 300ms ease-spring
- Stage text: opacity 0 to 1, translateX from -8px to 0, 250ms ease-out
- Active glow pulse: `@keyframes pulse { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }`, 2s ease-in-out infinite

**Progress bar:**
- Width transition: 400ms ease-out (smooth, not jumpy)
- Shimmer overlay: `@keyframes shimmer { to { transform: translateX(100%) } }`, 1.5s linear infinite
- Shimmer is a semi-transparent white gradient (0% transparent, 50% 8% white, 100% transparent)

**Stage completion:**
- Icon morphs from spinner to checkmark: 300ms
- Green flash on the connecting line segment: 200ms
- Status text change with brief opacity dip: 150ms

**Screen transitions:**
- Content crossfade between screens: 250ms
- Subtitle preview rows appear with staggered fade-in: 50ms delay between each, first 10 visible rows only

**Reduced motion:**
- All animations respect `prefers-reduced-motion: reduce`
- When reduced: replace animations with simple opacity fades (200ms)
- Disable continuous animations (shimmer, pulse, marching ants)

---

## 8. Accessibility

### WCAG AA Compliance

**Color contrast verification:**

| Combination                          | Ratio  | Pass |
|--------------------------------------|--------|------|
| `--text-primary` on `--bg-deep`      | 13.2:1 | AA   |
| `--text-primary` on `--bg-surface`   | 11.1:1 | AA   |
| `--text-secondary` on `--bg-deep`    | 5.4:1  | AA   |
| `--text-secondary` on `--bg-surface` | 4.5:1  | AA   |
| `--green-base` on `--bg-deep`        | 10.8:1 | AA   |
| `--cyan-base` on `--bg-deep`         | 11.5:1 | AA   |
| `--amber-base` on `--bg-deep`        | 9.7:1  | AA   |
| `--red-base` on `--bg-deep`          | 5.2:1  | AA   |
| `--text-muted` on `--bg-surface`     | 3.1:1  | Decorative only |

Note: `--text-muted` is used only for non-essential decorative text and format hints. All functional text meets 4.5:1 minimum.

### Keyboard Navigation

- Full keyboard support for all interactive elements
- Tab order follows visual layout (top to bottom, left to right)
- Drop zone activates file picker on Enter/Space
- Focus ring: 2px solid `--cyan-base`, 2px offset, visible on `:focus-visible` only
- Settings panel traps focus while open, Escape to close
- Arrow keys navigate dropdown options and segmented controls

### Screen Reader Support

- Drop zone: `role="button"` with `aria-label="Drop video file or click to browse. Supported formats: mp4, mkv, avi, mov, webm"`
- Progress pipeline: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Stage status changes announced via `aria-live="polite"` region
- Completion announced via `aria-live="assertive"`
- Subtitle preview: `role="list"` with each entry as `role="listitem"`

### Touch Targets

- All interactive elements minimum 36px touch target (44px preferred)
- Adequate spacing between clickable elements (minimum 8px gap)

---

## 9. CSS Design System

### Design Token Variables

```css
:root {
  /* === Background === */
  --bg-deep: #0A0E14;
  --bg-surface: #111720;
  --bg-elevated: #1A2130;
  --bg-hover: #222B3A;

  /* === Borders === */
  --border-subtle: #1E2738;
  --border-default: #2A3548;
  --border-bright: #3A4A60;

  /* === Text === */
  --text-primary: #E8ECF1;
  --text-secondary: #8899AA;
  --text-muted: #556677;
  --text-inverse: #0A0E14;

  /* === Green (Primary / Success) === */
  --green-dim: #0D3B2E;
  --green-base: #00E68A;
  --green-glow: #00E68A33;

  /* === Amber (Warning) === */
  --amber-dim: #3B2E0D;
  --amber-base: #FFB020;
  --amber-glow: #FFB02033;

  /* === Cyan (Info / Active) === */
  --cyan-dim: #0D2E3B;
  --cyan-base: #00D4FF;
  --cyan-glow: #00D4FF33;

  /* === Red (Error) === */
  --red-dim: #3B0D14;
  --red-base: #FF3B5C;
  --red-glow: #FF3B5C33;

  /* === White Overlay === */
  --white-dim: #FFFFFF0A;
  --white-accent: #FFFFFF1A;

  /* === Typography === */
  --font-primary: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;

  --t-hero: 600 28px/1.2 var(--font-primary);
  --t-h1: 600 22px/1.3 var(--font-primary);
  --t-h2: 600 17px/1.4 var(--font-primary);
  --t-h3: 600 14px/1.4 var(--font-primary);
  --t-body: 400 14px/1.5 var(--font-primary);
  --t-small: 400 12px/1.5 var(--font-primary);
  --t-micro: 500 11px/1.3 var(--font-primary);
  --t-mono: 400 13px/1.6 var(--font-mono);

  /* === Spacing === */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-10: 40px;
  --sp-12: 48px;
  --sp-16: 64px;

  /* === Border Radius === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow-green: 0 0 20px var(--green-glow);
  --shadow-glow-cyan: 0 0 20px var(--cyan-glow);
  --shadow-glow-amber: 0 0 20px var(--amber-glow);
  --shadow-glow-red: 0 0 20px var(--red-glow);

  /* === Transitions === */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

### Base Reset and Globals

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-primary);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--bg-deep);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  min-height: 100vh;
  overflow: hidden; /* Tauri window, no body scroll */
}

::selection {
  background-color: var(--cyan-base);
  color: var(--text-inverse);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-surface);
}

::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Focus visible */
:focus-visible {
  outline: 2px solid var(--cyan-base);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 200ms !important;
  }
}
```

### Component CSS Examples

```css
/* === Drop Zone === */
.drop-zone {
  position: relative;
  width: 100%;
  max-width: 680px;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-xl);
  background-color: var(--bg-surface);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    height var(--duration-slow) var(--ease-out);
}

.drop-zone--drag-over {
  border-style: solid;
  border-color: var(--cyan-base);
  background-color: var(--cyan-dim);
  box-shadow:
    0 0 40px var(--cyan-glow),
    inset 0 0 40px var(--cyan-glow);
}

.drop-zone--loaded {
  height: 100px;
  border-style: solid;
  border-color: var(--green-base);
  background-color: var(--green-dim);
  flex-direction: row;
  justify-content: flex-start;
  padding: 0 var(--sp-6);
  cursor: default;
}

.drop-zone__icon {
  width: 48px;
  height: 48px;
  color: var(--text-muted);
  transition:
    transform var(--duration-fast) var(--ease-spring),
    color var(--duration-fast) var(--ease-out);
}

.drop-zone--drag-over .drop-zone__icon {
  transform: scale(1.15);
  color: var(--cyan-base);
}

/* === Button === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  font: var(--t-h3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: none;
  cursor: pointer;
  padding: var(--sp-3) var(--sp-8);
  border-radius: var(--radius-sm);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
  user-select: none;
}

.btn:focus-visible {
  outline: 2px solid var(--cyan-base);
  outline-offset: 2px;
}

.btn--primary {
  background-color: var(--green-base);
  color: var(--text-inverse);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px var(--green-glow);
}

.btn--primary:active:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(0);
  box-shadow: none;
}

.btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--secondary {
  background-color: transparent;
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
}

.btn--secondary:hover:not(:disabled) {
  border-color: var(--text-secondary);
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

/* === Progress Pipeline === */
.pipeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--sp-6) 0;
}

.pipeline__stage {
  display: grid;
  grid-template-columns: 40px 1fr auto auto;
  align-items: center;
  gap: var(--sp-3);
  height: 56px;
  padding: 0 var(--sp-4);
  position: relative;
}

.pipeline__stage--active {
  background-color: color-mix(in srgb, var(--cyan-dim) 30%, transparent);
  border-radius: var(--radius-md);
}

.pipeline__indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.pipeline__indicator--pending {
  border: 2px solid var(--border-default);
  background: transparent;
}

.pipeline__indicator--active {
  background: var(--cyan-base);
  box-shadow: 0 0 12px var(--cyan-glow);
  animation: pulse 2s var(--ease-in-out) infinite;
}

.pipeline__indicator--done {
  background: var(--green-base);
}

.pipeline__indicator--error {
  background: var(--red-base);
}

.pipeline__label {
  font: var(--t-body);
  color: var(--text-primary);
}

.pipeline__stage--pending .pipeline__label {
  color: var(--text-muted);
}

.pipeline__status {
  font: var(--t-micro);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pipeline__time {
  font: var(--t-mono);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 48px;
  text-align: right;
}

/* === Progress Bar === */
.progress-bar {
  height: 3px;
  background: var(--bg-deep);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin: var(--sp-1) 0 var(--sp-2) 40px;
}

.progress-bar__fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--cyan-base), var(--green-base));
  position: relative;
  transition: width var(--duration-slow) var(--ease-out);
}

.progress-bar__fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s linear infinite;
}

/* === Subtitle Preview === */
.subtitle-list {
  background: var(--bg-deep);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow-y: auto;
  max-height: 360px;
}

.subtitle-entry {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-top: 1px solid var(--border-subtle);
  transition: background-color var(--duration-fast) var(--ease-out);
}

.subtitle-entry:first-child {
  border-top: none;
}

.subtitle-entry:hover {
  background-color: var(--bg-hover);
}

.subtitle-entry__index {
  font: var(--t-mono);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.subtitle-entry__timestamp {
  font: var(--t-mono);
  color: var(--cyan-base);
  margin-bottom: var(--sp-1);
}

.subtitle-entry__original {
  font: var(--t-body);
  color: var(--text-primary);
}

.subtitle-entry__translated {
  font: var(--t-body);
  color: var(--text-secondary);
  margin-top: var(--sp-1);
}

/* === Settings Panel === */
.settings-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 20, 0.6);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  z-index: 100;
}

.settings-backdrop--open {
  opacity: 1;
}

.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-subtle);
  transform: translateX(100%);
  transition: transform var(--duration-normal) var(--ease-out);
  z-index: 101;
  overflow-y: auto;
  padding: var(--sp-6);
}

.settings-panel--open {
  transform: translateX(0);
}

.settings-section {
  margin-bottom: var(--sp-8);
}

.settings-section__title {
  font: var(--t-h3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--sp-4);
}

/* === Segmented Control === */
.segmented {
  display: flex;
  background: var(--bg-deep);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;
}

.segmented__option {
  flex: 1;
  padding: var(--sp-2) var(--sp-3);
  font: var(--t-small);
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  cursor: pointer;
  text-align: center;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.segmented__option:hover {
  color: var(--text-secondary);
}

.segmented__option--active {
  color: var(--cyan-base);
  background: var(--bg-hover);
  box-shadow: 0 0 8px var(--cyan-glow);
}

/* === Toast Notification === */
.toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-left: 3px solid var(--green-base);
  border-radius: var(--radius-md);
  padding: var(--sp-3) var(--sp-4);
  font: var(--t-small);
  color: var(--text-primary);
  box-shadow: var(--shadow-lg);
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
  z-index: 200;
}

.toast--visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* === Keyframe Animations === */
@keyframes pulse {
  0%, 100% { opacity: 0.7; box-shadow: 0 0 8px var(--cyan-glow); }
  50% { opacity: 1; box-shadow: 0 0 16px var(--cyan-glow); }
}

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(200%); }
}

@keyframes march {
  to { stroke-dashoffset: -20px; }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === Input === */
.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--sp-3);
  font: var(--t-body);
  color: var(--text-primary);
  background: var(--bg-deep);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  outline: none;
  border-color: var(--cyan-base);
  box-shadow: 0 0 0 3px var(--cyan-glow);
}

/* === Status Bar === */
.status-bar {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--sp-4);
  background: var(--bg-deep);
  border-top: 1px solid var(--border-subtle);
  font: var(--t-micro);
  color: var(--text-muted);
}

.status-bar__badge {
  display: inline-flex;
  padding: 2px var(--sp-2);
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  font: var(--t-micro);
  color: var(--text-muted);
}
```

### Recommended Project Structure

```
src/
  styles/
    tokens.css          Design tokens (all CSS custom properties)
    reset.css           Base reset and global styles
    components/
      drop-zone.css     Drop zone component
      button.css        Button variants
      input.css         Text input and select
      pipeline.css      Progress pipeline
      subtitle.css      Subtitle preview list
      settings.css      Settings panel
      segmented.css     Segmented control
      status-bar.css    Status bar
      toast.css         Toast notifications
      titlebar.css      Custom title bar
    animations.css      Keyframe definitions
    utilities.css       Helper classes (text alignment, display, spacing)
  index.css             Imports all stylesheets in order
```

---

## Appendix A: Icon Recommendations

Use a minimal icon set. Suggested source: Lucide Icons (MIT, consistent stroke weight).

| Purpose          | Icon Name        | Size |
|------------------|------------------|------|
| Upload / Drop    | `upload-cloud`   | 48px |
| File loaded      | `film`           | 24px |
| Remove file      | `x`              | 16px |
| Settings         | `settings`       | 18px |
| Checkmark (done) | `check`          | 14px |
| Error            | `x`              | 14px |
| Export / Save    | `download`       | 16px |
| Eye (show key)   | `eye` / `eye-off`| 16px |
| Chevron (select) | `chevron-down`   | 16px |
| Close panel      | `x`              | 18px |
| New file         | `plus`           | 16px |

## Appendix B: Language Options

**Source language dropdown:**
- Auto-detect (default)
- English, Japanese, Chinese (Mandarin), Korean, Spanish, French, German, Portuguese, Italian, Russian, Arabic, Hindi

**Target language dropdown:**
- Chinese (Simplified)
- Japanese
- Korean
- English
- Spanish
- French
- German

## Appendix C: File Format Support

Display in the drop zone as format hints:

| Extension | MIME Type        |
|-----------|------------------|
| .mp4      | video/mp4        |
| .mkv      | video/x-matroska |
| .avi      | video/x-msvideo  |
| .mov      | video/quicktime  |
| .webm     | video/webm       |

Validate on drop. If unsupported format, show an amber warning toast: "Unsupported file format. Please use MP4, MKV, AVI, MOV, or WebM."

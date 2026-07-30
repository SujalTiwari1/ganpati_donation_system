# FRONTEND SPECIFICATION
## Project: Ganpati Vargani Collection Management System
## Target Audience: AI Frontend Generators (Lovable, Bolt.new, v0, Claude, Cursor) & Frontend Engineers

This document describes the exact visual designs, theme variables, component states, page layouts, user interactions, and client-side behaviors for the **Ganpati Vargani Collection Management System**. It contains **no backend source code codebases**, but rather a precise UI/UX specification to generate a production-ready, accessible, and responsive SaaS application.

---

## 1. Design System & Theme

The user interface must resemble modern SaaS platforms like **Linear**, **Stripe**, **Vercel**, and **Clerk Dashboard**. Avoid generic, raw primary colors. Use deep, harmonious, HSL-tailored colors, subtle border shadows, smooth hover micro-animations, and clean, high-contrast layouts.

### Color Palette (Tailwind & CSS Variables)
```css
:root {
  /* Brand Primary - Saffron / Vibrant Orange */
  --primary: 24 95% 53%;         /* #f97316 */
  --primary-foreground: 0 0% 100%;
  
  /* Brand Secondary - Emerald */
  --secondary: 142 70% 45%;     /* #10b981 */
  --secondary-foreground: 0 0% 100%;
  
  /* Neutrals (Light Mode) */
  --background: 210 40% 98%;     /* Very light slate */
  --foreground: 222 47% 11%;     /* Deep navy text */
  --card: 0 0% 100%;             /* Pure white */
  --card-foreground: 222 47% 11%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --ring: 24 95% 53%;            /* Primary focus ring */

  /* Status Colors */
  --success: 142 76% 36%;        /* Darker emerald */
  --warning: 38 92% 50%;         /* Amber */
  --destructive: 0 84.2% 60.2%;  /* Soft Red */
  
  /* Border Radius & Shadows */
  --radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.dark {
  /* Brand Primary */
  --primary: 24 95% 53%;
  --primary-foreground: 0 0% 100%;

  /* Brand Secondary */
  --secondary: 142 70% 45%;
  --secondary-foreground: 0 0% 100%;

  /* Neutrals (Dark Mode) */
  --background: 240 10% 4%;      /* Deep neutral charcoal */
  --foreground: 0 0% 98%;
  --card: 240 10% 6%;            /* Slightly lighter card background */
  --card-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --border: 240 3.7% 15.9%;
  --ring: 24 95% 53%;
}
```

### Typography
* **Font Family:** `Inter`, `Outfit`, or `system-ui, sans-serif`.
* **Headings:** Bold weight, slight tracking compression (`tracking-tight`), `Outfit` is preferred for landing/titles.
* **Body Text:** Light/Normal weight, high-contrast readability, `Inter` for data tables and metrics.

### Visual Aesthetic Rules
* **Glassmorphism:** Apply strictly only to fixed navigation menus, sticky headers, and drawers. Use `backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-white/20`.
* **Elevation & Borders:** Cards must have a subtle gray border (`1px border-neutral-200 dark:border-neutral-800`) and a soft drop shadow (`shadow-sm`).
* **Interactions:** Every button, input field, and row must have a `transition-all duration-200` ease curve. Buttons should slightly scale down when clicked (`active:scale-95`).

---

## 2. Accessibility (a11y) & UX Standards

* **Keyboard Navigation:** 
  * Dialog/Modal views must enforce focus traps (preventing focus from escaping the modal).
  * Select elements and dropdown list items must support arrow keys, `Enter`, and `Escape` handlers.
  * Form pages must allow full `Tab` cycling order.
* **Focus States:** Custom components must never hide native outline states without replacing them. Explicitly use a primary brand ring (`ring-2 ring-primary ring-offset-2 outline-none`).
* **Contrast Compliance:** WCAG AA standard minimum contrast ratio of 4.5:1. Small text must not use shades lighter than gray-500 (`#737373` in light mode).
* **Keyboard Shortcuts:**
  * `Ctrl + K` or `Cmd + K` - Focuses the global search bar.
  * `Esc` - Closes active overlays, modals, and collapsed sidebars.
  * `Alt + N` - Triggers a new donation transaction form.

---

## 3. Global Reusable Components

All generated UI pages must assemble the following standard components. 

### 1. Button (`<Button>`)
* **Variants:** `primary` (solid saffron), `secondary` (solid emerald), `outline` (saffron or neutral border), `ghost` (no background, color hover), `destructive` (red bg).
* **States:** idle, hover, active (scale compression), loading (disables button, replaces text with spinning Lucide `Loader2` icon), disabled (muted bg, cursor-not-allowed).

### 2. Card (`<Card>`)
* **Layout:** White/Charcoal background, `rounded-xl`, `border-neutral-100 dark:border-neutral-900`, `shadow-sm`.
* **Interaction:** Hover variations can add a transition lift (`hover:-translate-y-0.5 hover:shadow-md`).

### 3. Modal & Drawer (`<Dialog>`)
* **Behavior:** Modals appear centered with a dark, blurred overlay (`backdrop-blur-sm bg-black/40`). Drawers slide in from the right edge.
* **Close Options:** An "X" icon button in the top-right corner, pressing `Escape`, or clicking on the backdrop overlay.

### 4. Stat Card (`<StatCard>`)
* **Layout:** A structured tile containing:
  * Top Row: Card Title (muted text) + Indicator Icon (top-right).
  * Middle Row: Big formatted number (e.g. `₹ 1,50,000.00`).
  * Bottom Row: Subtitle text with a status badge (e.g. `+12% from yesterday` or a Lucide trend indicator arrow).

### 5. Table (`<Table>`)
* **Layout:** Sticky table header row, zebra striping optional, scrollable container for overflowing layouts.
* **Row Actions:** The hover state highlights rows in secondary-saffron tint. Clicking the final column opens a Lucide `<MoreVertical>` action menu.

### 6. Badge (`<Badge>`)
* **Variants:**
  * Success: Green text, light green bg.
  * Warning: Orange text, light orange bg.
  * Info: Blue text, light blue bg.
  * Failed: Red text, light red bg.
  * Pending: Yellow text, light yellow bg.

---

## 4. Overall Layout (Shell)

The primary shell uses a responsive layout that automatically scales between mobile and desktop viewports.

```text
+-------------------------------------------------------------+
| Navbar [Logo | Title                 Search   Avatar Menu]   |
+------------+------------------------------------------------+
| Sidebar    | Breadcrumbs                                    |
| [Collapsed]|------------------------------------------------|
|            | Main Content Panel                             |
|  Home      |                                                |
|  Buildings |                                                |
|  Tx        |                                                |
|  Logs      |                                                |
|            |                                                |
+------------+------------------------------------------------+
```

### Collapsible Sidebar
* **Desktop:** Fixed to the left edge (width: `240px`). A collapse button in the bottom corner minifies it to a `64px` icon-only layout.
* **Mobile/Tablet:** Hidden by default. Clicking the hamburger menu in the navbar slides the sidebar in from the left as an overlay drawer.
* **Navigation Links:** Home (Dashboard), Buildings, Transactions, Analytics, Audit Logs, Profile, Settings.

### Top Navbar
* **Aesthetics:** Sticky glassmorphism header, thin bottom divider.
* **Interactive Elements:**
  * **Global Search (`Cmd + K`):** Opens a search command palette overlay to find buildings or donors.
  * **System Notification Bell:** Clicking opens a dropdown menu displaying delivery status alerts from Meta Cloud API.
  * **User Profile Avatar:** Displays the user's initial. Clicking the avatar opens a dropdown menu with: Profile details, Theme Toggle (Light/Dark mode switcher), and Logout.

---

## 5. Page Specifications & Mockups

### 1. Login Page
* **Layout:** Centered card with split-screen illustration on large viewports (Saffron gradient artwork on left, form on right).
* **Mockup Representation:**
  ```text
  +----------------------------------------------------+
  |                   [ Mandal Logo ]                  |
  |                Welcome to Vargani CMS              |
  |      Enter your credentials to access the ledger    |
  |                                                    |
  |  Email Address                                     |
  |  [ user@example.com                              ] |
  |                                                    |
  |  Password                           (Show/Hide)    |
  |  [ **********                                    ] |
  |                                                    |
  |  [x] Remember Me              [Forgot Password?]   |
  |                                                    |
  |  [                  Sign In                       ]  |
  +----------------------------------------------------+
  ```
* **Validation & UI State Guidelines:**
  * Validate email formatting and password strength in real time on the client.
  * Disable Forgot Password link by default (shows an info tooltip: `"Contact your Mandal Administrator to reset passwords"`).
  * Show a loading spinner inside the sign-in button during submission.

---

### 2. Premium Admin Dashboard
* **Metrics Summary Cards:**
  * Today's Collection (with percentage change).
  * Monthly Collection.
  * Year Collection (Big Saffron visual highlight).
  * Total Transactions (Count).
  * Average Donation Amount.
  * Highest Donation.
* **Charts Container:**
  * **Donation Trends (Line Chart):** Plots daily collections for the last 30 days. Uses a smooth orange gradient curve.
  * **Payment Distribution (Pie/Doughnut Chart):** Splits total donations across cash, UPI, card, and cheque. Emerald and saffron accents.
  * **Top Performing Buildings (Bar Chart):** Lists buildings ranked by total collection amount.
* **Quick Actions Sidebar/Panel:**
  * Shortcut buttons to: `[Record New Donation (Alt+N)]`, `[Add New Building]`, `[Export CSV Report]`.
* **Recent Activity Stream:**
  * A scrolling timeline showing recent transactions and audit logs (e.g. *"Volunteer Rahul recorded ₹5,000 from Room 202 Shivaji Heights"*). Include a manual refresh trigger button in the panel.

---

### 3. Buildings Management Page
* **Visual Elements:**
  * Header showing total active building count and a saffron button to `[+ Add Building]`.
  * Live search input field with query debouncing.
* **Buildings Data Table Schema:**
  * Columns: Building Name (displays name + normalized tag), Area, Notes, Status (Active/Deleted Badge), Created Date, Actions (`...` menu button).
  * Actions dropdown options: `Edit Details`, `Delete Building` (shows red destructive icon), `Restore Building` (displays only if deleted).
* **Modals & Overlays:**
  * **Create/Edit Modal:** Fields for Name (required), Area, and Notes. Includes normalized preview text shown in real-time beneath the Name input (e.g. Input: `"B-Wing, Sai Niwas"` -> Preview: `"sai-niwas-b-wing"`).
  * **Delete Confirmation Dialog:** Warning message: *"Are you sure you want to delete this building? This action will fail if the building is linked to active donor profiles."*

---

### 4. Transactions Ledger (Core Page)
This page is the primary interface for volunteers recording door-to-door donations. It must be optimized for fast mobile entries.

```text
+--------------------------------------------------------------------------+
|  Record Transaction                            Receipt Live Preview      |
|  Building Name                                 +-----------------------+ |
|  [ Select Building or Type...               v ]|  GANPATI MANDAL ID   | |
|                                                |  Receipt No: 2026-003 | |
|  Donor Name                                    |                       | |
|  [ Name of donor                              ] |  Received: ₹ 1,001.00 | |
|                                                |  From: Ramesh Shah    | |
|  Mobile Number                                 |  Room 402, Sai Sagar  | |
|  [ 10-Digit India Format                      ] |  Mode: UPI            | |
|                                                |  Date: 30-07-2026     | |
|  Room Number        Donation Amount            +-----------------------+ |
|  [ Room #        ]  [ ₹ 0.00                  ]  WhatsApp Status: [SENT] |
|                                                                          |
|  Payment Method                                                          |
|  ( ) Cash   (o) UPI   ( ) Card   ( ) Cheque                              |
|                                                                          |
|  [                   Save & Send Receipt (Alt+N)                      ]  |
+--------------------------------------------------------------------------+
```

#### Interactive Elements & Core Workflows:
1. **Fuzzy Building Selector:** An input combining dropdown search and text-match select. If the typed name does not exist, show a text link: `"+ Create new building: [typed name]"`.
2. **Real-Time Receipt Preview:** A mobile receipt mock-up panel on the right page side that dynamically updates name, amount, and room numbers as the user types.
3. **Duplicate Warning Modal:** If the input room details trigger a double-donation alert, pop open an orange warning modal:
   * Alert text: *"Warning: Room [room] in [building] has already donated ₹[amount] for the 2026 festival. Do you want to override this?"*
   * Action buttons: `[Cancel and Review]` or `[Override & Save]`.
   * Input text field: Reason for override (e.g. "Second family member donating separately") - *disabled unless override is selected*.
4. **Receipt Success Screen & Delivery Indicator:**
   * After saving a transaction, display a full-page checkmark success animation.
   * Render the generated receipt number in large type.
   * Display a WhatsApp delivery badge with live updates:
     * `[PENDING]` (spinning status icon)
     * `[SENT]` (single check)
     * `[DELIVERED]` (double check)
     * `[READ]` (blue double check)
     * `[FAILED]` (red warning icon - hovering displays the failure reason).
   * Provide direct link buttons to: `[Download PDF Receipt]` and `[Record Next Donation]`.

---

### 5. Analytics Dashboard
* **Visual Cards & Filter Controls:**
  * Date range selector picker (pre-selects options for *"Today"*, *"Last 7 Days"*, *"This Year"*).
  * Filter dropdowns: Payment Method, Volunteer operator.
* **Analytics Charts:**
  * Cumulative Collection Growth: Line area chart with saffron fills.
  * Payment Splits: Emerald vs Saffron donut layout.
  * Volunteer Leaderboard: Horizontal bar chart showing total donation counts collected by operator.

---

### 6. Audit Ledger View
* **Aesthetics:** Monochrome design, high-density row heights, monospace fonts for identifiers and values.
* **Filters:** Filter logs by action type (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `STATUS_CHANGE`) and entity (`USER`, `TRANSACTION`, `BUILDING`).
* **Table Rows:**
  * Columns: Actor name, Entity, Action type, Date & Time, Details label.
  * **Expandable Layout:** Clicking a row expands it vertically to show JSON diff views of database modifications:
    ```json
    {
      "changedFields": {
        "amount": { "from": "1000.00", "to": "1500.00" },
        "roomNumber": { "from": "101", "to": "101-A" }
      }
    }
    ```

---

## 6. Feedback & Notification Layouts

### Toast Notifications
Pop up notifications in the top-right corner of the viewport (using Lucide icons and Framer Motion sliding transitions).

```text
+--------------------------------------------------------+
| (Checkmark)  Donation Saved successfully        [ X ]  |
|              Receipt sent to Ramesh Shah.              |
+--------------------------------------------------------+
| (Error Icon) Connection Lost                           |
|              Could not upload media to Meta APIs.      |
+--------------------------------------------------------+
```
* **Success Toast:** Emerald accent line on the left border.
* **Error Toast:** Crimson accent line on the left border.
* **Warning Toast:** Saffron accent line on the left border.
* **Status Updates:** Live updates on background events (e.g., toast pops up stating: *"Receipt 2026-004 was read by recipient"*).

---

## 7. Error & Exception Interfaces

* **401 Unauthorized Error Page:** An illustration of a locked gate with a saffron key icon. Action button: `[Return to Login Page]`.
* **403 Forbidden Access Page:** Warning badge indicating restricted access. Illustration of a volunteer attempting admin tasks. Action button: `[Go back to Home Dashboard]`.
* **404 Not Found Page:** Custom illustration of a missing festival canopy. Text: *"The page or transaction receipt you are looking for has gone missing."* Action button: `[Return to Dashboard]`.
* **500 System Error Page:** Gray/Dark illustration of a database error. Option link to copy error details to the clipboard for support. Action button: `[Retry Request]`.

---

## 8. Screen Transitions & Loading Animations

To maintain a premium feel, the application must avoid abrupt state updates by using smooth loading and transition animations:

1. **Route Transitions (Framer Motion):**
   * Fade and slight vertical slide-up transitions when switching pages:
     `{ opacity: 0, y: 10 }` to `{ opacity: 1, y: 0 }` with an ease-out duration of `0.2s`.
2. **Skeleton & Shimmer States:**
   * **Cards:** Pulse animation using neutral background tones.
   * **Tables:** Shimmer loading state overlay with gray line items representing columns.
3. **Save Donation Progress Indicator:**
   * A sequential checklist animation displayed while saving new donations:
     * `[x]` Persisting donation details in database...
     * `[ ]` Generating PDF copy...
     * `[ ]` Dispatching copy to mobile...

---

## 9. Form Rules & Inline Error Mapping

* **Library:** React Hook Form combined with Zod schema verification.
* **Feedback Rules:** Inline validation errors must display dynamically below input fields. Input borders highlight in red when invalid.
* **Input Masks:**
  * Mobile phone numbers must only accept digits, auto-formatting to Indian layout groups: `XXXXX XXXXX`.
  * Currency inputs must automatically prefix the rupee sign (`₹`) and format decimal values.
* **Form Submission State:** Disable form inputs and buttons while submission is in progress to prevent duplicate submissions.

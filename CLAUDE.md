# CLAUDE.md - AI Assistant Guide for boncado-widget-vue

## Project Overview

**boncado-widget-vue** is a Vue 3 Web Component project that creates a reusable table booking widget for restaurants. It's built as a Custom Element using Vue 3's `defineCustomElement` API, allowing it to be embedded in any HTML page or framework (React, Angular, vanilla JS, etc.).

**Key Characteristics:**
- Framework-agnostic Web Component
- Single-file distribution (IIFE bundle)
- Themeable and configurable via props
- Event-driven architecture for host communication
- Zero external dependencies in production (only Vue 3)

## Directory Structure

```
boncado-widget-vue/
├── .git/                          # Git repository
├── .vscode/
│   └── extensions.json            # Recommended: Vue.volar extension
├── .gitignore                     # Git ignore rules
├── .gitattributes                 # Git attributes
├── public/
│   └── vite.svg                   # Public assets
├── src/
│   ├── components/
│   │   └── TableBooking.vue       # Main booking widget component
│   ├── assets/
│   │   └── vue.svg                # Vue logo asset
│   ├── main.ce.js                 # ENTRY POINT: Custom Element definition
│   └── style.css                  # Global styles
├── index.html                     # Demo/development page
├── package.json                   # Dependencies & npm scripts
├── package-lock.json              # Locked dependency versions
├── vite.config.js                 # Vite build configuration (dual-mode)
└── README.md                      # Project documentation
```

## Key Files and Their Purpose

### 1. `vite.config.js` - Build Configuration
**Location:** `/home/user/boncado-widget-vue/vite.config.js`

This file configures **two distinct build modes**:

#### Default Mode (SPA Development)
```bash
npm run dev      # Dev server
npm run build    # Standard Vue SPA build
```

#### Widget Mode (Web Component Distribution)
```bash
npm run build:widget
```

**Widget Mode Configuration:**
- Entry point: `./src/main.ce.js`
- Format: IIFE (Immediately Invoked Function Expression)
- Output: `dist/table-booking-widget.js` and `dist/table-booking-widget.css`
- Library name: `TableBookingWidget`
- `customElement: true` - Enables Vue's custom element compilation
- `inlineDynamicImports: true` - Single bundle output
- `cssCodeSplit: false` - All CSS in one file

**Critical Line (7):** `customElement: mode === "widget"` - This tells Vue to compile components as custom elements instead of standard Vue components.

### 2. `src/main.ce.js` - Custom Element Entry Point
**Location:** `/home/user/boncado-widget-vue/src/main.ce.js`

This is the root file for the Web Component build. It:
1. Imports `TableBooking.vue` component
2. Wraps it with `defineCustomElement()` from Vue
3. Registers the custom element as `<table-booking-widget>`
4. Exports `TableBookingElement` for manual registration

**Important:** This file is ONLY used in widget mode, not in standard SPA mode.

### 3. `src/components/TableBooking.vue` - Main Component
**Location:** `/home/user/boncado-widget-vue/src/components/TableBooking.vue`

This is the core booking form component. Understanding this file is essential for any modifications.

#### Component Structure

**Template (Lines 1-96):**
- Conditional rendering: Shows form OR success message
- Form fields: date, time, guests, name, email, phone, notes
- Submit button with loading state
- Success confirmation with "book again" option

**Script (Lines 98-199):**
Uses Vue 3 Composition API with `<script setup>` syntax

**Props (Lines 101-118):**
```javascript
title: String = "Reserve a Table"
maxGuests: Number|String = 10
apiEndpoint: String = ""
primaryColor: String = "#2563eb"
```

**Emitted Events (Lines 120-124):**
- `booking-submitted` - Fired immediately when form is submitted
- `booking-confirmed` - Fired when booking succeeds
- `booking-error` - Fired if booking fails

**State (Lines 127-138):**
- `form` - Reactive object with all form fields
- `isSubmitting` - Loading state during API call
- `bookingConfirmed` - Controls success message display

**Computed Properties:**
- `maxGuestsNum` (Line 141) - Converts prop to integer
- `minDate` (Line 143) - Today's date in ISO format
- `timeSlots` (Line 147) - Generates 11:00 AM to 9:30 PM slots

**Methods:**
- `handleSubmit()` (Line 157) - Processes form submission, calls API if endpoint provided, otherwise simulates delay
- `resetForm()` (Line 187) - Resets form state for new booking

**Styling (Lines 201-349):**
- Uses `:host` selector for Web Component scoping (Line 202)
- CSS custom properties for theming (Lines 203-210)
- Dynamic binding: `v-bind(primaryColor)` (Line 203)
- Responsive design with max-width 400px (Line 225)

## Development Patterns and Conventions

### 1. Vue 3 Composition API
- **Always use `<script setup>`** syntax for new components
- Prefer `ref()` for primitives, `reactive()` for objects
- Use `computed()` for derived state
- Define props with `defineProps()`, emits with `defineEmits()`

### 2. Web Component Best Practices
- **Shadow DOM styling:** Use `:host` selector for root styles
- **Prop naming:** Props are automatically converted to kebab-case attributes (e.g., `primaryColor` → `primary-color`)
- **Event emission:** Use custom events for parent communication
- **No global styles:** All styles must be scoped to the component

### 3. Code Style
- **Indentation:** 4 spaces (as seen in existing files)
- **Quotes:** Double quotes for strings
- **Naming:** camelCase for JS, kebab-case for HTML/CSS
- **Template directives:** Use shorthand (`@click`, `:disabled`, `v-for`)

### 4. Form Handling
- Use `v-model` for two-way binding
- HTML5 validation attributes (`required`, `type="email"`, etc.)
- Loading states for async operations
- Proper error handling with user feedback

## Build System

### Dependencies

**Production (package.json:11-12):**
```json
"vue": "^3.5.13"
```

**Development (package.json:14-16):**
```json
"@vitejs/plugin-vue": "^5.2.1",
"vite": "^6.0.5"
```

### Build Scripts

```bash
# Development server with hot reload
npm run dev

# Standard SPA build (output: dist/)
npm run build

# Web Component build (output: dist/table-booking-widget.js)
npm run build:widget

# Preview production build
npm run preview
```

### Build Outputs

**Standard Build:**
- Creates traditional Vue SPA in `dist/`
- Multiple chunks for code splitting
- Used for development and demo page

**Widget Build:**
- Single file: `dist/table-booking-widget.js`
- IIFE format (self-executing)
- All dependencies bundled (including Vue)
- Ready for distribution via CDN or static hosting

## Usage Examples

### Basic HTML Integration
```html
<!DOCTYPE html>
<html>
<head>
  <title>Restaurant Booking</title>
</head>
<body>
  <!-- Basic usage with defaults -->
  <table-booking-widget></table-booking-widget>

  <!-- Load the widget script -->
  <script type="module" src="./table-booking-widget.js"></script>
</body>
</html>
```

### With Custom Properties
```html
<table-booking-widget
  title="Book Your Table"
  max-guests="8"
  primary-color="#8b5cf6"
  api-endpoint="https://api.restaurant.com/bookings"
></table-booking-widget>
```

### With Event Listeners
```html
<script>
  const widget = document.querySelector('table-booking-widget');

  widget.addEventListener('booking-submitted', (e) => {
    console.log('Booking submitted:', e.detail);
  });

  widget.addEventListener('booking-confirmed', (e) => {
    console.log('Booking confirmed:', e.detail);
    // Send to analytics, show notification, etc.
  });

  widget.addEventListener('booking-error', (e) => {
    console.error('Booking failed:', e.detail);
  });
</script>
```

## Common Development Tasks

### Adding a New Form Field

1. **Update form state** in `TableBooking.vue:127-135`
```javascript
const form = ref({
  date: "",
  time: "",
  guests: 2,
  name: "",
  email: "",
  phone: "",
  notes: "",
  newField: "", // Add here
});
```

2. **Add template markup** in `TableBooking.vue` template section
```vue
<div class="form-group">
  <label for="new-field">New Field</label>
  <input
    type="text"
    id="new-field"
    v-model="form.newField"
    placeholder="Enter value"
    required />
</div>
```

3. **Update resetForm()** in `TableBooking.vue:187-198`
```javascript
function resetForm() {
  form.value = {
    date: "",
    time: "",
    guests: 2,
    name: "",
    email: "",
    phone: "",
    notes: "",
    newField: "", // Reset new field
  };
  bookingConfirmed.value = false;
}
```

### Adding a New Prop

1. **Define in props** (`TableBooking.vue:101-118`)
```javascript
const props = defineProps({
  title: { type: String, default: "Reserve a Table" },
  maxGuests: { type: [Number, String], default: 10 },
  apiEndpoint: { type: String, default: "" },
  primaryColor: { type: String, default: "#2563eb" },
  newProp: { type: String, default: "default-value" }, // Add here
});
```

2. **Use in template or script**
```vue
<template>
  <div>{{ newProp }}</div>
</template>
```

3. **Document in README** and this file

### Changing Styles/Theme

**Primary color:** Controlled by `primaryColor` prop (Line 114-117)

**CSS custom properties:** Defined in `:host` selector (Lines 203-210)
```css
:host {
  --primary-color: v-bind(primaryColor);
  --primary-hover: color-mix(in srgb, var(--primary-color) 85%, black);
  --bg-color: #ffffff;
  --text-color: #1f2937;
  --border-color: #e5e7eb;
  --input-bg: #f9fafb;
  --success-color: #10b981;
}
```

To add theming:
1. Add new CSS custom property in `:host`
2. Optionally expose as prop for runtime customization
3. Use `v-bind()` for dynamic values from props

### Testing the Widget

1. **Run development server:**
```bash
npm run dev
```

2. **Build widget:**
```bash
npm run build:widget
```

3. **Test in HTML:**
- Create test HTML file
- Include `dist/table-booking-widget.js`
- Add `<table-booking-widget>` element
- Open in browser

## API Integration

### Backend Endpoint Requirements

If providing an `apiEndpoint` prop, the backend must:

**Accept POST request:**
```http
POST /bookings
Content-Type: application/json

{
  "date": "2024-01-15",
  "time": "19:00",
  "guests": 4,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 234 567 8900",
  "notes": "Window seat please"
}
```

**Return:**
- Success: HTTP 200-299 status
- Failure: HTTP 400+ status (triggers error event)

**CORS:** Must allow requests from widget host domain

### Handling Responses

The widget currently:
- Checks `response.ok` (status 200-299)
- Throws error on failure
- Shows generic alert on error
- Emits `booking-error` event

To customize error handling, modify `handleSubmit()` in `TableBooking.vue:157-185`.

## Git Workflow

### Current Branch
- Working on: `claude/claude-md-mkp7gux62s8mw4fw-D7yLj`
- Default branch: (to be determined)

### Commit Guidelines
- **Prefix commits:** `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- **Be descriptive:** Explain the "why" not the "what"
- **Keep focused:** One logical change per commit

### Making Changes
1. Make code changes
2. Test thoroughly (`npm run dev` or `npm run build:widget`)
3. Commit with clear message
4. Push to feature branch
5. Create pull request when ready

## Testing Checklist

Before committing changes:

- [ ] Widget builds successfully (`npm run build:widget`)
- [ ] No console errors in development (`npm run dev`)
- [ ] Form validation works correctly
- [ ] All props are respected and functional
- [ ] Events are emitted at correct times
- [ ] Styles don't leak outside component
- [ ] Widget works in standalone HTML file
- [ ] Responsive design works (check mobile sizes)
- [ ] Accessibility: keyboard navigation works
- [ ] Success/error flows work as expected

## Common Pitfalls and Gotchas

### 1. Custom Element vs Regular Vue Component
- `main.ce.js` is ONLY for widget build
- Don't import it in regular Vue development
- Use `customElement: mode === "widget"` to conditionally compile

### 2. Prop Type Coercion
- HTML attributes are always strings
- Use `type: [Number, String]` and parse with `parseInt()`
- Example: `maxGuests` (Line 107-108)

### 3. Shadow DOM Limitations
- Global styles don't affect the widget
- CSS must be in `<style>` tag of component
- Use `:host` for root element styling

### 4. Event Naming
- Use kebab-case for event names: `booking-confirmed` not `bookingConfirmed`
- Custom events don't bubble through shadow DOM by default
- Emit with plain objects, not Vue instances

### 5. Build Modes
- Always specify mode for widget build: `npm run build:widget`
- Different entry points: `index.html` vs `main.ce.js`
- Check `vite.config.js` mode-specific config

### 6. Reactivity
- Props are readonly - don't mutate
- Use `ref()` or `reactive()` for local state
- Computed properties auto-update on dependency changes

## File Reference Quick Links

| File | Primary Purpose | Lines of Interest |
|------|----------------|-------------------|
| `vite.config.js` | Build configuration | 7 (customElement mode), 14-28 (widget config) |
| `src/main.ce.js` | Widget entry point | 5 (defineCustomElement), 8 (register) |
| `src/components/TableBooking.vue` | Main component | 101-118 (props), 157-185 (submit), 201-349 (styles) |
| `package.json` | Dependencies & scripts | 5-9 (scripts), 11-17 (deps) |
| `index.html` | Demo page | Entire file (shows usage example) |

## Security Considerations

### Input Validation
- HTML5 validation is client-side only
- **Always validate on backend**
- Email format: `type="email"` provides basic check
- Phone is not validated (international formats vary)

### XSS Prevention
- Vue automatically escapes template interpolations
- Be cautious with `v-html` (not used in this project)
- Sanitize user input on backend before storage

### API Security
- Use HTTPS for `apiEndpoint` in production
- Implement CORS properly on backend
- Consider rate limiting on booking endpoint
- Validate all form data server-side

### Secrets Management
- Never commit API keys or secrets
- Use environment variables for sensitive config
- Document required env vars in README

## Performance Optimization

### Current Optimizations
- Single bundle output (IIFE)
- CSS not code-split in widget mode
- Inline dynamic imports
- Vue 3 Composition API (smaller bundle)

### Future Improvements
If bundle size becomes an issue:
1. Consider removing unused Vue features
2. Tree-shake unused code
3. Lazy load success message component
4. Optimize CSS (remove unused rules)

### Load Time
- Widget is ~50-80KB (gzipped)
- Loads synchronously (blocking)
- Consider async/defer for production

## Browser Support

### Requirements
- ES6+ support (async/await, const/let, arrow functions)
- Custom Elements API (Web Components)
- CSS Grid and Flexbox
- Fetch API

### Compatibility
- **Modern browsers:** ✅ Chrome, Firefox, Safari, Edge (latest 2 versions)
- **IE 11:** ❌ Not supported (use polyfills if needed)

### Polyfills
If supporting older browsers:
1. Add `@webcomponents/custom-elements` polyfill
2. Transpile with Babel for ES5
3. Add fetch polyfill
4. Test thoroughly

## Troubleshooting

### Widget doesn't appear
- Check browser console for errors
- Verify script is loaded: `<script type="module" src="..."></script>`
- Ensure tag name is correct: `<table-booking-widget>`
- Check if custom elements are supported

### Styles not applying
- Verify `:host` selector is used
- Check if styles are in `<style>` tag of component
- Ensure CSS is included in build output
- Look for CSS specificity conflicts

### Props not working
- Use kebab-case in HTML: `primary-color` not `primaryColor`
- Check prop types match (string vs number)
- Verify prop is defined in `defineProps()`
- Check browser DevTools for attribute values

### Events not firing
- Use `addEventListener`, not `@click` on custom element
- Event names are kebab-case
- Check `e.detail` for payload
- Verify emit is called in code

### Build fails
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (should be 16+)
- Clear `node_modules` and reinstall
- Check for syntax errors in code

## Resources and Documentation

### Official Documentation
- [Vue 3 Docs](https://vuejs.org/)
- [Vue 3 Custom Elements](https://vuejs.org/guide/extras/web-components.html)
- [Vite Docs](https://vitejs.dev/)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

### Related Files
- `README.md` - Project overview and setup instructions
- `package.json` - Dependencies and scripts
- `.vscode/extensions.json` - Recommended VS Code extensions

## Contributing Guidelines for AI Assistants

When making changes to this codebase:

1. **Read before modifying:** Always read the full file before making changes
2. **Maintain style:** Follow existing code style and conventions
3. **Test thoroughly:** Build both SPA and widget modes
4. **Update documentation:** Keep this file and README.md in sync with changes
5. **Commit logically:** One feature/fix per commit with clear messages
6. **Avoid over-engineering:** Keep solutions simple and focused
7. **Preserve functionality:** Don't break existing features
8. **Consider users:** Widget is embedded in third-party sites - breaking changes affect them

### Code Review Checklist
- [ ] Code follows existing patterns
- [ ] No new dependencies without justification
- [ ] Build succeeds without warnings
- [ ] Props/events are documented
- [ ] Styles are scoped properly
- [ ] Accessibility maintained
- [ ] Mobile-responsive
- [ ] Browser compatibility preserved

---

**Last Updated:** 2026-01-22
**Project Version:** 1.0.0
**Vue Version:** 3.5.13
**Vite Version:** 6.0.5

For questions or clarifications, refer to the code directly using the line number references provided throughout this document.

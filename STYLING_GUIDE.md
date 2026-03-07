# STYLING GUIDE & DESIGN SYSTEM

Complete guide for maintaining consistent design across Rachabanda Ruchulu.

## 🎨 Color System

All colors are defined in `tailwind.config.js`. Always use these utility classes:

### Primary Colors
```css
/* Gold - Main accent color */
text-primary-gold           /* #D4AF37 */
bg-primary-gold
border-primary-gold
from-primary-gold

/* Accent Gold - Lighter gold */
text-primary-accent-gold    /* #E7C873 */
bg-primary-accent-gold
```

### Secondary Colors
```css
/* Dark Brown - Dark text/backgrounds */
text-secondary-dark-brown   /* #2B1D15 */
bg-secondary-dark-brown

/* Warm Brown - Secondary accent */
text-secondary-warm-brown   /* #5A3E2B */
bg-secondary-warm-brown
```

### Dark Theme
```css
/* Background Black */
bg-dark-bg                  /* #0F0B08 */

/* Card Dark */
bg-dark-card                /* #1A1410 */

/* Input Dark */
bg-dark-input              /* #252019 */
```

## 🎬 Shadow System

```css
/* Subtle glass shadow */
shadow-glass                /* Glass effect shadow */

/* Glow effect */
shadow-glow                 /* Soft gold glow */
shadow-glow-lg              /* Larger gold glow */

/* Example usage */
<div class="shadow-glow hover:shadow-glow-lg transition-shadow">
  Content
</div>
```

## 🔤 Typography

### Heading Sizes
```css
h1  /* 3.5rem, 700 weight, tight letter-spacing */
h2  /* 2.5rem, 600 weight */
h3  /* 1.5rem, 600 weight */
p   /* 1rem, 400 weight, 1.6 line-height */
```

### Font Stack
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif
```

## 🎯 Component Patterns

### Buttons

**Primary Button**
```tsx
<button className="btn btn-primary">
  Click Me
</button>
```
CSS:
```css
.btn {
  @apply px-6 py-3 rounded-lg font-semibold transition-all duration-300 
         ease-out hover:scale-105 active:scale-95;
}

.btn-primary {
  @apply bg-primary-gold text-secondary-dark-brown 
         hover:bg-primary-accent-gold shadow-lg hover:shadow-glow-lg;
}
```

**Secondary Button**
```tsx
<button className="btn btn-secondary">
  Cancel
</button>
```

**Outline Button**
```tsx
<button className="btn btn-outline">
  Learn More
</button>
```

### Cards

**Glass Card**
```tsx
<div className="card">
  Content
</div>
```
CSS:
```css
.card {
  @apply glass rounded-2xl p-6 transition-all duration-300 hover:shadow-glow;
}

.glass {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

**Dark Glass Card**
```tsx
<div className="card-dark">
  Content
</div>
```

### Forms

**Input Styling**
```tsx
<input 
  type="text" 
  placeholder="Enter text"
  className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 
             text-white focus:outline-none focus:border-primary-gold 
             focus:ring-1 focus:ring-primary-gold/50 transition-all"
/>
```

### Badges

```tsx
<span className="px-3 py-1 rounded-full text-xs font-semibold 
                 bg-green-500/20 text-green-400">
  Active
</span>
```

## 🎬 Animation Classes

### Predefined Animations
```css
/* Floating animation */
animate-float

/* Glow pulse animation */
animate-glow-pulse

/* Slide up animation */
animate-slide-up

/* Fade in animation */
animate-fade-in
```

### Framer Motion Examples

**Fade In On Scroll**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

**Hover Scale**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

**Staggered Children**
```tsx
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

## 📐 Spacing System

Use Tailwind's spacing scale:
```
1 = 4px
2 = 8px
3 = 12px
4 = 16px
6 = 24px
8 = 32px
12 = 48px
16 = 64px
24 = 96px
```

**Example:**
```tsx
<div className="p-6 mb-8 gap-4">
  Spacing utilities
</div>
```

## 📱 Responsive Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  Items
</div>
```

## 🎯 Glass Morphism Pattern

For creating glass effect cards:

```tsx
<div className="glass rounded-xl p-6">
  <h3 className="text-white font-bold mb-2">Title</h3>
  <p className="text-gray-400">Description</p>
</div>
```

The `.glass` class provides:
- Semi-transparent white background (8% opacity)
- 1px white border (10% opacity)
- 10px blur backdrop effect
- Smooth hover transitions

## 🌈 Gradient Examples

```tsx
/* Text Gradient */
<h1 className="text-transparent bg-clip-text 
               bg-gradient-to-r from-primary-gold to-primary-accent-gold">
  Gradient Text
</h1>

/* Background Gradient */
<div className="bg-gradient-to-r from-primary-gold to-primary-accent-gold">
  Content
</div>

/* Custom Gradient */
<div className="bg-gradient-to-b from-dark-bg via-dark-card to-secondary-dark-brown">
  Multi-color gradient
</div>
```

## ✨ Special Effects

### Glow Effect
```tsx
<div className="shadow-glow">
  Glowing container
</div>
```

### Shimmer Loading
```tsx
<div className="shimmer">
  Loading...
</div>
```

### Hover Lift
```tsx
<div className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  Hover to lift
</div>
```

## 🔄 Transitions

Always use these classes for smooth transitions:

```typescript
transition-all        /* All properties */
transition-colors     /* Color changes only */
transition-shadow     /* Shadow changes */
duration-300          /* 300ms (default) */
ease-out              /* Ease out timing */
```

**Example:**
```tsx
<button className="bg-primary-gold text-white transition-all duration-300 
                   hover:bg-primary-accent-gold hover:shadow-glow-lg">
  Smooth Button
</button>
```

## 📏 Mobile-First Approach

Always start with base (mobile) styles, then add responsive overrides:

```tsx
<div className="w-full md:w-1/2 lg:w-1/4">
  Responsive widths
</div>

<div className="text-sm md:text-base lg:text-lg">
  Responsive text sizes
</div>
```

## 🎨 Creating New Components

Template for new components:

```tsx
'use client';

import { motion } from 'framer-motion';

interface ComponentProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

const MyComponent = ({ title, description, onClick }: ComponentProps) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div variants={variants} className="card">
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400">{description}</p>}
      {onClick && (
        <button onClick={onClick} className="btn btn-primary mt-4">
          Action
        </button>
      )}
    </motion.div>
  );
};

export default MyComponent;
```

## ✅ Design Checklist

When creating new pages/components:

- [ ] Use Tailwind utility classes
- [ ] Apply color variables from config
- [ ] Add Framer Motion animations
- [ ] Test on mobile (sm, md, lg screens)
- [ ] Check hover states
- [ ] Verify dark theme contrast
- [ ] Use consistent spacing
- [ ] Add smooth transitions
- [ ] Test glass morphism effects
- [ ] Ensure accessibility (colors, fonts)

---

**Maintain consistency by following this guide!**

# 3D ELEMENTS & ANIMATIONS GUIDE

Complete guide for implementing Three.js 3D elements and Framer Motion animations.

## 🎭 Three.js Integration

### Setup Hook

The `useThreeScene` hook is located in `client/hooks/useThreeScene.ts`

**Example Usage:**
```tsx
'use client';

import { useThreeScene } from '@/hooks/useThreeScene';

export default function Hero3D() {
  const sceneRef = useThreeScene();

  return (
    <div ref={sceneRef} className="w-full h-screen" />
  );
}
```

### Hook Implementation Details

The hook creates:
- Scene with WebGL renderer
- Icosahedron geometry (rotating food model)
- Directional + Ambient lighting
- Animation loop with mouse interaction
- Auto-responsive to window resize

### Customizing 3D Elements

**Change Geometry:**
```typescript
// In useThreeScene.ts
// Replace IcosahedronGeometry with:

// Box
const geometry = new THREE.BoxGeometry(2, 2, 2);

// Sphere
const geometry = new THREE.SphereGeometry(2, 32, 32);

// Torus
const geometry = new THREE.TorusGeometry(2, 0.5, 16, 100);

// Cone
const geometry = new THREE.ConeGeometry(2, 3, 32);
```

**Change Material:**
```typescript
// Metallic material
const material = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 0.7,
  roughness: 0.2,
});

// Wireframe
const material = new THREE.MeshPhongMaterial({
  color: 0xd4af37,
  wireframe: true,
});
```

**Change Colors:**
```typescript
const material = new THREE.MeshPhongMaterial({
  color: 0xd4af37,          // Gold
  emissive: 0xa67b1f,       // Darker gold glow
  shininess: 100,
});
```

### Animation Properties

```typescript
const animate = () => {
  requestAnimationFrame(animate);
  
  // Rotation speed
  mesh.rotation.x += 0.005;  // Slower = 0.001, Faster = 0.01
  mesh.rotation.y += 0.007;
  
  // Position animation
  mesh.position.z = Math.sin(Date.now() * 0.001) * 2;
  
  renderer.render(scene, camera);
};
```

### Add Lighting Effects

```typescript
// Directional light (sun-like)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Point light (spot light)
const pointLight = new THREE.PointLight(0xd4af37, 0.5);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// Ambient light (overall brightness)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
```

---

## 🎬 Framer Motion Animations

### Common Animation Patterns

**Fade In Animation**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
>
  Content fades in
</motion.div>
```

**Slide Up Animation**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content slides up
</motion.div>
```

**Scale Animation**
```tsx
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
>
  Interactive Button
</motion.button>
```

**Rotate Animation**
```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
>
  Spinning element
</motion.div>
```

### Container & Children Stagger

Perfect for animating lists:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,       // Delay between children
      delayChildren: 0.3,         // Initial delay
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

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

### Scroll Animations

Animate when element comes into view:

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true, amount: 0.5 }}
>
  Animates when scrolled into view
</motion.div>
```

### Exit Animations

Animate when leaving page:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
>
  Fades out when removed
</motion.div>
```

### Gesture Animations

```tsx
<motion.div
  whileHover={{ scale: 1.05, shadow: '0 10px 30px rgba(0,0,0,0.3)' }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ boxShadow: '0 0 0 3px #D4AF37' }}
>
  Interactive element
</motion.div>
```

### Keyframe Animations

```tsx
<motion.div
  animate={{
    rotate: [0, 10, -10, 10, 0],
    scale: [1, 1.1, 0.9, 1.1, 1],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  Complex animation
</motion.div>
```

### Drag Animations

```tsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1 }}
>
  Drag me around!
</motion.div>
```

---

## 🎨 Advanced Animation Techniques

### Parallax Scrolling

```tsx
import { useScroll, useTransform, motion } from 'framer-motion';

function ParallaxSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  return (
    <motion.div style={{ y }}>
      Parallax element moves slower than scroll
    </motion.div>
  );
}
```

### Spring Animation

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: 'spring',
    stiffness: 100,        // Higher = stiffer spring
    damping: 10,           // Higher = less bouncy
    mass: 1,
  }}
>
  Spring animation
</motion.div>
```

### Layout Animations

```tsx
<motion.div layout>
  Automatically animates when layout changes
</motion.div>
```

---

## 🎯 Component Examples

### Animated Food Card

```tsx
const FoodCard = ({ food }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -10, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.2)' },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="card"
    >
      <motion.img
        src={food.image}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      />
      <h3 className="text-lg font-bold text-white">{food.name}</h3>
      <p className="text-primary-gold">₹{food.price}</p>
    </motion.div>
  );
};
```

### Animated Counter

```tsx
import { useMotionValue, useTransform, motion } from 'framer-motion';

function Counter({ value }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, Math.round);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{rounded}</motion.span>;
}
```

### Page Transition

```tsx
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};
```

---

## 🚀 Performance Tips

1. **Use `will-change` CSS:**
   ```css
   .animated-element {
     will-change: transform, opacity;
   }
   ```

2. **Limit simultaneous animations:**
   - Stagger animations instead of running all at once
   - Use `duration` and `delay` wisely

3. **Use `GPU-accelerated` properties:**
   - `transform` (good)
   - `opacity` (good)
   - `width`/`height` (costly)
   - `left`/`top` (costly)

4. **Debounce scroll events:**
   ```tsx
   const { scrollY } = useScroll();
   // Already optimized by Framer Motion
   ```

5. **Use `exit` animations sparingly:**
   ```tsx
   <AnimatePresence>
     {isVisible && <motion.div exit={{ opacity: 0 }} />}
   </AnimatePresence>
   ```

---

## 📚 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Three.js Docs](https://threejs.org/docs/)
- [TailwindCSS](https://tailwindcss.com/)

---

**Create amazing 3D experiences with confidence!**

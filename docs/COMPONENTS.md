# Component Documentation

This document provides information about React components in the Navařeno application.

*Last updated: 2025-07-01T08:56:43.611Z*

## Components Overview

| Component | File | Type | Props |
|-----------|------|------|-------|
| Category | Category.tsx | React Component | 4 |
| Food | Food.tsx | React Component | 7 |
| Footer | Footer.tsx | React Component | 0 |
| HeaderLink | HeaderLink.tsx | React Component | 0 |
| RecipeCard | RecipeCard.tsx | React Component | 12 |
| SearchWithSuggestions | SearchWithSuggestions.tsx | React Component | 0 |
| SessionProviderWrapper | SessionProviderWrapper.tsx | React Component | 0 |

## Detailed Documentation

### Category

**File:** `src/components/Category.tsx`

**Description:** React component

**Props:**

| Name | Type | Optional | Description |
|------|------|----------|-------------|
| title | `string` | ✗ | - |
| link | `string` | ✗ | - |
| description | `string` | ✗ | - |
| image | `string` | ✗ | - |

**Dependencies:**
- `next/link`
- `next/image`

**Exports:**
- default: `Category`

**Usage Example:**
```tsx
import Category from '@/components/Category';

<Category
  title={"example"}
  link={"example"}
  description={"example"}
  // ... other props
/>
```

---

### Food

**File:** `src/components/Food.tsx`

**Description:** src/components/Food.tsx

**Props:**

| Name | Type | Optional | Description |
|------|------|----------|-------------|
| title | `string` | ✗ | - |
| image | `string` | ✗ | - |
| difficulty | `number` | ✗ | - |
| time | `number` | ✗ | - |
| rating | `string | number` | ✗ | - |
| ratingsCount | `number` | ✗ | - |
| category | `string` | ✗ | - |

**Dependencies:**
- `react`
- `next/link`
- `next/image`

**Exports:**
- default: `function`

**Usage Example:**
```tsx
import Food from '@/components/Food';

<Food
  title={"example"}
  image={"example"}
  difficulty={42}
  // ... other props
/>
```

---

### Footer

**File:** `src/components/Footer.tsx`

**Description:** React component

**Exports:**
- default: `Footer`

**Usage Example:**
```tsx
import Footer from '@/components/Footer';

<Footer />
```

---

### HeaderLink

**File:** `src/components/HeaderLink.tsx`

**Description:** React component

**Dependencies:**
- `next/link`
- `next-auth/react`
- `next/image`
- `react`

**Exports:**
- default: `HeaderLink`

**Usage Example:**
```tsx
import HeaderLink from '@/components/HeaderLink';

<HeaderLink />
```

---

### RecipeCard

**File:** `src/components/RecipeCard.tsx`

**Description:** React component

**Props:**

| Name | Type | Optional | Description |
|------|------|----------|-------------|
| recipe | `{
    title: string` | ✗ | - |
| image | `string` | ✗ | - |
| difficulty | `number` | ✗ | - |
| time | `number` | ✗ | - |
| rating | `string | number` | ✗ | - |
| ratingsCount | `number` | ✓ | - |
| description | `string` | ✗ | - |
| portion | `number | string` | ✓ | - |
| rating_count | `number` | ✓ | - |
| rating_sum | `number` | ✓ | - |
| slug | `string` | ✗ | - |
| category | `string` | ✗ | - |

**Dependencies:**
- `react`
- `@mui/material`
- `@mui/icons-material/AccessTime`
- `@mui/icons-material/FitnessCenter`
- `framer-motion`

**Exports:**
- default: `RecipeCard`
- named: `RecipeCard`

**Usage Example:**
```tsx
import RecipeCard from '@/components/RecipeCard';

<RecipeCard
  recipe={"example"}
  image={"example"}
  difficulty={42}
  // ... other props
/>
```

---

### SearchWithSuggestions

**File:** `src/components/SearchWithSuggestions.tsx`

**Description:** React component

**Dependencies:**
- `react`
- `next/navigation`

**Exports:**
- default: `function`

**Usage Example:**
```tsx
import SearchWithSuggestions from '@/components/SearchWithSuggestions';

<SearchWithSuggestions />
```

---

### SessionProviderWrapper

**File:** `src/components/SessionProviderWrapper.tsx`

**Description:** React component

**Dependencies:**
- `next-auth/react`
- `react`

**Exports:**
- default: `function`

**Usage Example:**
```tsx
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

<SessionProviderWrapper />
```

---


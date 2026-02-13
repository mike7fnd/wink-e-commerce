# Shadow Style Implementation TODO

## Task
Apply shadow style `box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px;` across all system UI, especially in cards.

## Plan

### Step 1: Update tailwind.config.ts
- [ ] Add new custom shadow utility with the requested style

### Step 2: Update Card component
- [ ] src/components/ui/card.tsx - Replace shadow-lg with new custom shadow

### Step 3: Update UI Components
- [ ] src/components/ui/button.tsx - Update shadow-lg classes
- [ ] src/components/ui/dialog.tsx - Update shadow-lg
- [ ] src/components/ui/sheet.tsx - Update shadow-lg
- [ ] src/components/ui/dropdown-menu.tsx - Update shadow-lg and shadow-md
- [ ] src/components/ui/popover.tsx - Update shadow-md
- [ ] src/components/ui/select.tsx - Update shadow-md
- [ ] src/components/ui/menubar.tsx - Update shadow-md
- [ ] src/components/ui/tooltip.tsx - Update shadow-md
- [ ] src/components/ui/toast.tsx - Update shadow-lg
- [ ] src/components/ui/alert-dialog.tsx - Update shadow-lg
- [ ] src/components/ui/header.tsx - Update shadow-lg
- [ ] src/components/ui/chart.tsx - Update shadow-xl
- [ ] src/components/ui/sidebar.tsx - Update shadow classes

### Step 4: Update Business Components
- [ ] src/components/stores/store-info-card.tsx - Update shadow-lg and shadow-xl
- [ ] src/components/products/product-card.tsx - Update shadow-lg and shadow-sm
- [ ] src/components/products/filters.tsx - Update shadow-sm

### Step 5: Update Layout Components
- [ ] src/components/layout/pull-to-refresh.tsx - Update shadow-lg
- [ ] src/components/layout/header.tsx - Update shadow-lg

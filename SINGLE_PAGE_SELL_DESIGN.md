# Single-Page Selling Screen Design

## Overview
Replaced multi-step "New Sale / Calculator" flow with a unified single-page interface optimized for shop counter usage.

**Core Principle**: Everything happens on ONE screen. No steps, no wizard, no page switching.

---

## Layout Structure

### Desktop/Tablet (2-Column Layout)
```
┌────────────────────────────────────────────────────┐
│ ← Back | New Sale              [Language Toggle]   │
├─────────────────────┬──────────────────────────────┤
│ LEFT SIDE           │ RIGHT SIDE                   │
│                     │                              │
│ 1. Available Oils   │ 4. Live Price Breakdown      │
│    (Grid of cards)  │    - Selected oil            │
│                     │    - Quantity                │
│ 2. Quantity Buttons │    - Calculated price        │
│    - Viss (whole)   │                              │
│    - Viss (common)  │ 5. Cart Items                │
│    - Ticals         │    - List of added items     │
│                     │    - Remove buttons          │
│ 3. Action Buttons   │                              │
│    - Add Amount     │ 6. Total & Final Actions     │
│    - Add to Cart    │    - TOTAL (large display)   │
│                     │    - Clear Cart              │
│                     │    - Confirm Sale            │
└─────────────────────┴──────────────────────────────┘
```

### Mobile (Stacked Layout)
All sections stack vertically:
1. Available Oils
2. Quantity Buttons
3. Action Buttons
4. Live Price Breakdown
5. Cart Items
6. Total & Final Actions

---

## Component Details

### 1. Available Oils (Top-Left)
- **Display**: Grid of oil cards (2 columns on desktop, 1 on mobile)
- **Each card shows**:
  - Oil name (localized)
  - Price per viss
- **Interaction**: Tap to select (highlighted with amber border)
- **Selection**: Only one oil selected at a time
- **State**: `selectedOilId`

### 2. Quantity Selection Buttons (Under oil list)

#### Row 1: Viss (Whole Numbers)
Buttons: `1  2  3  4  5  6  7  8  9  10 viss`

#### Row 2: Viss (Common Fractional Values)
Buttons: `10  12.5  20  30  37.5  40  50  60  67.5  70  80  87.5 viss`

#### Row 3: Ticals
Buttons: `1  2  3  4  5  6  7  8  9 ticals`

**Rules**:
- One tap = one update (no typing required)
- Viss and tical selections combine: `selectedViss + (selectedTicals / 100)`
- Selected buttons highlighted (amber for viss, blue for ticals)
- State: `selectedViss`, `selectedTicals`

### 3. Action Buttons (Bottom-Left)

#### Add Amount Button
- **Purpose**: Adds current quantity to the selected oil in cart (accumulates if oil already in cart)
- **Style**: Large green button
- **Disabled**: When no oil selected or quantity is 0

#### Add to Cart Button
- **Purpose**: Same as "Add Amount" (simplified for shop counter flow)
- **Style**: Large blue button
- **Disabled**: When no oil selected or quantity is 0

**Note**: Both buttons perform the same action for simplicity. After adding, quantity resets to 0.

### 4. Live Price Breakdown (Top-Right)

Shows real-time calculation as user selects oil and quantity:
- **Oil name**: Current selected oil
- **Quantity**: Formatted as "X viss + Y ticals" or just viss or ticals
- **Price**: Large amber text, calculated instantly
- **Formula**: `price_per_unit × totalQuantityViss`

If nothing selected: Shows "Select an oil to begin"

### 5. Cart Items (Middle-Right)

**Display**: List of added items in order of addition
- Each item shows:
  - Oil name (localized)
  - Quantity (viss + ticals)
  - Price (MMK)
  - Remove button (X icon)

**Empty state**: "Cart is empty" message

**State**: `cart` array of objects:
```javascript
{
  oilId: number,
  oilName: string,
  viss: number,
  ticals: number,
  totalQuantityViss: number,
  price: number
}
```

### 6. Cart Total & Final Actions (Bottom-Right)

#### Total Display
- **TOTAL**: Very large (4xl) amber text showing sum of all cart items in MMK
- **Summary**: Small text showing total quantity in viss

#### Clear Cart Button
- **Purpose**: Removes all items from cart and resets selections
- **Style**: Gray button
- **Disabled**: When cart is empty

#### Confirm Sale Button
- **Purpose**: Opens confirmation modal → saves sale → navigates back to home
- **Style**: Large amber button (xl text)
- **Disabled**: When cart is empty

---

## User Flow Examples

### Single Oil Sale
1. Tap oil card (e.g., "Sunflower Oil")
2. Tap quantity button (e.g., "5 viss")
3. See live price update on right
4. Tap "Add to Cart"
5. See item appear in cart with price
6. Tap "Confirm Sale"
7. Confirm in modal → Sale saved → Return to home

### Mixed Oil Sale
1. Tap first oil (e.g., "Peanut Oil")
2. Tap "10 viss"
3. Tap "Add to Cart"
4. Tap second oil (e.g., "Sesame Oil")
5. Tap "5 viss"
6. Tap "Add to Cart"
7. See both items in cart with individual prices
8. See total at bottom
9. Tap "Confirm Sale"
10. Confirm in modal → Sale saved as "MIX" type → Return to home

### Accumulating Quantity
1. Tap oil
2. Tap "2 viss"
3. Tap "Add Amount"
4. See item in cart with 2 viss
5. Tap "3 ticals" (without changing oil selection)
6. Tap "Add Amount"
7. See same item updated to "2 viss + 3 ticals" with recalculated price

---

## State Model

```javascript
// Selection
const [selectedOilId, setSelectedOilId] = useState(null);
const [selectedViss, setSelectedViss] = useState(0);
const [selectedTicals, setSelectedTicals] = useState(0);

// Cart
const [cart, setCart] = useState([]);
// cart item structure:
// { oilId, oilName, viss, ticals, totalQuantityViss, price }

// Modals
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState('');
```

## Calculations

### Total Selected Quantity (Viss)
```javascript
const totalSelectedQuantityViss = selectedViss + (selectedTicals / 100);
```

### Current Price (Live Preview)
```javascript
const currentPrice = selectedOil && totalSelectedQuantityViss > 0
  ? parseFloat(selectedOil.price_per_unit) * totalSelectedQuantityViss
  : 0;
```

### Cart Total
```javascript
const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
const cartTotalQuantity = cart.reduce((sum, item) => sum + item.totalQuantityViss, 0);
```

---

## API Integration

### Sale Payload (on Confirm)
```javascript
{
  totalAmount: cartTotal,
  totalQuantity: cartTotalQuantity,
  saleType: cart.length === 1 ? 'SINGLE_OIL' : 'MIX',
  note: null,
  items: cart.map(item => ({
    oilId: item.oilId,
    quantity: item.totalQuantityViss,
    lineAmount: item.price
  }))
}
```

### Success Flow
1. Call `confirmSale(payload)`
2. On success:
   - Reset cart and selections
   - Close modal
   - Navigate back to home (`/`)

---

## Responsive Behavior

### Desktop (lg breakpoint)
- `grid-cols-2`: Two-column layout
- Oil cards: 2 per row
- All buttons visible simultaneously

### Tablet (md)
- `grid-cols-2`: Two-column layout maintained
- Oil cards: 2 per row
- Quantity buttons may wrap

### Mobile (sm)
- `grid-cols-1`: Single column, stacked
- Oil cards: 1 per row
- User scrolls through: oils → quantity → actions → preview → cart → total

---

## Key Tailwind Patterns

### Selected State
```javascript
className={`... ${
  isSelected
    ? 'border-amber-500 bg-amber-50 shadow-md'
    : 'border-gray-200 bg-white hover:border-amber-300'
}`}
```

### Button Grid (Responsive Wrapping)
```jsx
<div className="flex flex-wrap gap-2">
  {values.map(v => (
    <button className="px-4 py-2 rounded-md ...">
      {v}
    </button>
  ))}
</div>
```

### Disabled States
```jsx
disabled={!selectedOil || totalSelectedQuantityViss === 0}
className="... disabled:bg-gray-300 disabled:cursor-not-allowed"
```

### Large Interactive Buttons (Touch-Friendly)
```jsx
className="w-full py-4 px-6 text-xl font-bold ..."
```

---

## UX Principles Applied

1. **No Typing**: All input via buttons
2. **One-Tap Operations**: Single click to select/add
3. **Instant Feedback**: Live price updates
4. **Large Touch Targets**: Minimum 44x44px (py-4 px-6)
5. **Clear Visual Hierarchy**: Selected items stand out
6. **Undo Support**: Remove button on each cart item
7. **Standing Usage**: No scrolling required on tablet/desktop for primary flow
8. **Paper-Sheet Mental Model**: Left side = input, Right side = running total
9. **No Pop-ups** (except final confirm): Everything visible at once

---

## Translation Keys Used

### English (`en.json`)
```json
"sell": {
  "newSale": "New Sale",
  "selectQuantity": "Select Quantity",
  "addAmount": "Add Amount",
  "addToCart": "Add to Cart",
  "currentSelection": "Current Selection",
  "quantity": "Quantity",
  "price": "Price",
  "selectOilFirst": "Select an oil to begin",
  "cart": "Cart",
  "cartEmpty": "Cart is empty",
  "clearCart": "Clear Cart",
  "confirmSale": "Confirm Sale",
  "totalAmount": "TOTAL"
}
```

### Myanmar (`my.json`)
```json
"sell": {
  "newSale": "အရောင်းအသစ်",
  "selectQuantity": "ပမာဏရွေးချယ်ပါ",
  "addAmount": "ပမာဏထည့်ပါ",
  "addToCart": "ခြင်းထဲထည့်ပါ",
  "currentSelection": "ရွေးချယ်ထားသောအရာ",
  "quantity": "ပမာဏ",
  "price": "ဈေး",
  "selectOilFirst": "ဆီရွေးချယ်ပါ",
  "cart": "ခြင်း",
  "cartEmpty": "ခြင်းထဲမှာ ဘာမှမရှိပါ",
  "clearCart": "ခြင်းရှင်းပါ",
  "confirmSale": "ရောင်းအား အတည်ပြုမည်",
  "totalAmount": "စုစုပေါင်း"
}
```

---

## Files Modified

1. **`frontend/src/pages/NewSale.jsx`**
   - Complete rewrite from multi-step wizard to single-page interface
   - 550+ lines of unified selling screen

2. **`frontend/src/i18n/en.json`**
   - Added `sell` translation section

3. **`frontend/src/i18n/my.json`**
   - Added `sell` translation section

---

## Next Steps (Optional Enhancements)

1. **Keyboard shortcuts**: Number keys for quick quantity selection
2. **Recent oils**: Show frequently sold oils at top
3. **Custom quantity input**: For rare amounts not on buttons
4. **Sale history preview**: Last 3 sales shown below cart
5. **Print receipt**: After sale confirmation
6. **Sound feedback**: Confirm button plays chime

---

## Testing Checklist

- [ ] Oil selection highlights correctly
- [ ] Quantity buttons update state (viss + ticals combine)
- [ ] Live price calculates accurately
- [ ] Add to cart accumulates quantities for same oil
- [ ] Cart displays all items with correct totals
- [ ] Remove item from cart works
- [ ] Clear cart resets everything
- [ ] Confirm sale saves to backend and navigates back
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Language toggle persists across navigation
- [ ] Empty states display correctly
- [ ] Disabled states prevent invalid actions

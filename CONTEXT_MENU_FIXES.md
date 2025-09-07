# Context Menu State Management Fixes

## Problem Analysis

The issue was that when clicking the three-dot button in SelectionTooltip to open the context menu:

1. **State Interference**: The synthetic `contextmenu` event was causing selection state to be cleared
2. **Component Disappearance**: TopPropertyPanel and SelectionTooltip disappeared when selection was lost
3. **Non-functional Context Menu**: Context menu opened but items were disabled due to no selected object
4. **Flickering Right-click**: Natural right-click was interfering with synthetic events

## Root Causes Identified

### 1. Selection State Clearing

- The `handleClickOutside` function in SelectionOverlay was being triggered by synthetic events
- No protection against synthetic events from SelectionTooltip
- Context menu didn't have proper data attributes to prevent selection clearing

### 2. Component State Management

- SelectionTooltip was hiding itself when opening context menu
- TopPropertyPanel and SelectionTooltip were not protected from click-outside logic
- CanvaContextMenu wasn't consistently using the selectedObject prop

### 3. Event Handling Issues

- Synthetic right-click events were interfering with natural right-click behavior
- No distinction between user-initiated and programmatic events
- Race conditions between selection state and context menu opening

## Fixes Implemented

### 1. Added Data Attributes for UI Protection

```tsx
// CanvaContextMenu
<ContextMenuContent className="w-64" data-selection-ui>

// SelectionTooltip (both positioned and non-positioned versions)
<Card ... data-selection-ui>

// TopPropertyPanel
<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60" data-selection-ui>
```

### 2. Enhanced SelectionTooltip Context Menu Trigger

```tsx
// SelectionTooltip handleShowMore function
const handleShowMore = (e: React.MouseEvent) => {
  // ... existing code ...

  // Ensure the target object stays selected before triggering context menu
  if (canvas.getActiveObject() !== targetObject) {
    canvas.setActiveObject(targetObject);
    canvas.renderAll();
  }

  // Add delay and mark synthetic events
  setTimeout(() => {
    const syntheticEvent = new MouseEvent("contextmenu", {
      // ... event properties ...
    });

    // Mark as synthetic to avoid interference
    (syntheticEvent as any).__synthetic = true;

    contextMenuTrigger.dispatchEvent(syntheticEvent);
  }, 10);

  // Don't hide tooltip - let context menu manage its own state
};
```

### 3. Updated Selection Overlay Click Handling

```tsx
// SelectionOverlay handleClickOutside function
const handleClickOutside = (e: MouseEvent) => {
  // Ignore synthetic events from SelectionTooltip
  if ((e as any).__synthetic) {
    return;
  }

  // Don't close if clicking on selection components
  if (target.closest("[data-selection-ui]")) {
    return;
  }

  // ... rest of existing logic ...
};
```

### 4. Improved CanvaContextMenu State Management

```tsx
// CanvaContextMenu component
const effectiveSelectedObject =
  selectedObject || canvas?.getActiveObject() || null;

// Use effectiveSelectedObject in all functions to ensure consistency
const handleCopy = useCallback(() => {
  if (!effectiveSelectedObject || !fabric) return;
  // ... rest of function using effectiveSelectedObject
}, [effectiveSelectedObject, fabric]);
```

## Testing Results Expected

After these fixes:

1. **✅ Three-dot Button Works**: Clicking the three-dot button in SelectionTooltip should open a functional context menu
2. **✅ Components Stay Visible**: TopPropertyPanel and SelectionTooltip should remain visible when context menu opens
3. **✅ Context Menu Functions**: All context menu items should be properly enabled and functional
4. **✅ No Flickering**: Right-clicking directly on objects should not cause flickering
5. **✅ State Consistency**: Selection state should be maintained throughout all interactions

## Technical Improvements

### Event Handling

- Synthetic events are now marked and ignored by click-outside logic
- Selection state is preserved during context menu operations
- Proper event propagation control prevents interference

### State Management

- Consistent selectedObject reference across all components
- Protected UI components from accidental selection clearing
- Improved component lifecycle management

### User Experience

- Seamless transition from SelectionTooltip to context menu
- No visual glitches or disappearing components
- Consistent behavior between different interaction methods

## Notes for Future Development

1. **Data Attributes**: Always add `data-selection-ui` to components that should not trigger selection clearing
2. **Synthetic Events**: Mark programmatic events with `__synthetic` flag to distinguish from user events
3. **State Consistency**: Use effective object resolution pattern when multiple sources of truth exist
4. **Event Timing**: Add small delays for synthetic events to ensure state stability

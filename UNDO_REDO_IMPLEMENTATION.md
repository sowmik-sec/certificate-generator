# Undo/Redo Implementation Documentation

This document describes the robust undo/redo functionality implemented in the certificate generator, similar to Canva's approach.

## Overview

We've implemented a comprehensive undo/redo system using the `fabric-history-v6` package, which is specifically designed for Fabric.js v6. The implementation provides:

- **Keyboard shortcuts**: Ctrl+Z (Undo), Ctrl+Y/Ctrl+Shift+Z (Redo)
- **UI buttons**: Visual undo/redo buttons in both desktop and mobile interfaces
- **Smart history management**: Automatic state management with memory optimization
- **Context-aware controls**: History is disabled during text editing and template loading

## Architecture

### 1. Core Components

#### `fabric-history-v6` Package

- **Why this package?** It's specifically maintained for Fabric.js v6 compatibility
- **Version**: 1.0.3 - actively maintained with recent updates
- **Features**: History tracking, events, memory optimization

#### History Store (`useHistoryStore.ts`)

```typescript
interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
  isHistoryEnabled: boolean;
  // ... other state management
}
```

#### Canvas History Hook (`useCanvasHistory.ts`)

- Initializes history functionality on canvas
- Manages history events and state updates
- Provides undo/redo operations

#### History Manager (`useHistoryManager.ts`)

- High-level history management
- Keyboard shortcuts integration
- Memory optimization (limits to 50 history entries)
- Optional toast notifications

### 2. UI Components

#### Undo/Redo Buttons (`undo-redo-buttons.tsx`)

```typescript
<UndoRedoButtons variant="outline" size="icon" showLabels={false} />
```

**Features:**

- Disabled state when no actions available
- Hover tooltips with keyboard shortcuts
- Consistent styling with app theme
- Separate components for individual buttons

#### Integration Points

- **Desktop Header**: Added to `HeaderActions` component
- **Mobile Header**: Integrated in `MobileHeader` for mobile users
- **Responsive**: Adapts to different screen sizes

### 3. Keyboard Shortcuts

Enhanced `useKeyboardShortcuts.ts` with undo/redo support:

```typescript
const shortcuts = {
  "ctrl+z": undo, // Windows/Linux
  "meta+z": undo, // Mac
  "ctrl+y": redo, // Windows/Linux
  "ctrl+shift+z": redo, // Mac alternative
  "meta+shift+z": redo, // Mac
};
```

**Smart Context Detection:**

- Disabled during text editing (input/textarea/contenteditable)
- Checks for active Fabric.js text editing
- Prevents interference with normal text operations

### 4. History Events

The system listens to these Fabric.js events:

- `object:added` - New objects
- `object:removed` - Deleted objects
- `object:modified` - Moved, scaled, rotated objects
- `object:skewing` - Skew transformations
- `path:created` - Drawing/brush strokes

**Smart Event Handling:**

- Debounced object movements (doesn't save every pixel)
- Excludes objects with `excludeFromExport: true`
- Prevents duplicate states

## Usage Examples

### Basic Usage in Components

```typescript
import { useHistoryManager } from "@/hooks/useHistoryManager";

const MyComponent = () => {
  const { canUndo, canRedo, undo, redo } = useHistoryManager({
    enableKeyboardShortcuts: true,
    enableToasts: false,
    maxHistorySize: 50,
  });

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
    </div>
  );
};
```

### Manual History Control

```typescript
import { useCanvasHistory } from "@/hooks/useCanvasHistory";

const MyCanvasComponent = () => {
  const { enableHistory, disableHistory, clearHistory, canvas } =
    useCanvasHistory();

  // Temporarily disable history during bulk operations
  const performBulkUpdate = () => {
    disableHistory();
    // ... perform multiple canvas operations
    enableHistory();
  };

  // Clear all history
  const resetHistory = () => {
    clearHistory();
  };
};
```

### Excluding Objects from History

```typescript
// Create an object that won't trigger history
const helperObject = new fabric.Rect({
  // ... other properties
  excludeFromExport: true, // This prevents history tracking
});

canvas.add(helperObject);
```

## Technical Implementation Details

### Memory Optimization

The system automatically manages memory by:

1. **Limiting history size**: Default 50 entries, configurable
2. **Removing old entries**: Keeps 80% when limit is reached
3. **JSON compression**: Uses `toDatalessJSON()` for smaller states

### Template Loading Integration

During template loading:

1. **History disabled**: Prevents cluttering history with template data
2. **Clean state**: Loads template without recording intermediate states
3. **Initial state**: Sets loaded template as the starting point
4. **Re-enable**: Automatically re-enables history after loading

```typescript
// In useTemplateLoader.ts
canvas.offHistory(); // Disable during load
// ... load template
canvas.onHistory(); // Re-enable after load
canvas.saveInitialState(); // Set as starting point
```

### Event Optimization

**Movement Detection:**

- Tracks `object:moving` to detect drag start
- Only saves state on `object:modified` after movement
- Prevents saving every frame during drag operations

**Duplicate Prevention:**

- Compares JSON states before saving
- Skips if current state matches last saved state
- Reduces redundant history entries

## Best Practices

### 1. Performance

- **Bulk Operations**: Disable history during bulk operations
- **Memory Limits**: Keep default 50-entry limit unless needed
- **Object Exclusion**: Mark temporary/helper objects with `excludeFromExport: true`

### 2. User Experience

- **Visual Feedback**: Always show button states (enabled/disabled)
- **Keyboard Shortcuts**: Consistent with platform conventions
- **Context Awareness**: Don't interfere with text editing

### 3. Integration

- **Error Handling**: Graceful fallback if history package fails
- **Type Safety**: Proper TypeScript definitions
- **Testing**: Test undo/redo with various object types

## Troubleshooting

### Common Issues

**1. History not working after template load**

```typescript
// Ensure history is re-enabled after template loading
if (typeof canvas.onHistory === "function") {
  canvas.onHistory();
}
```

**2. Too many history entries**

```typescript
// Adjust max history size
const historyManager = useHistoryManager({
  maxHistorySize: 30, // Reduce from default 50
});
```

**3. Undo/redo during text editing**

```typescript
// Check if text is being edited before undo/redo
const isTextBeingEdited = () => {
  return (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA" ||
    document.activeElement?.getAttribute("contenteditable") === "true"
  );
};
```

### Performance Monitoring

Monitor history performance:

```typescript
// Listen to history events for debugging
canvas.on("history:append", (e) => {
  console.log("History entry added:", e.json?.length);
});

canvas.on("history:undo", () => {
  console.log("Undo performed, can undo:", canvas.canUndo());
});
```

## Future Enhancements

### Potential Improvements

1. **Branching History**: Support for history branching like Git
2. **Selective Undo**: Undo specific objects or operations
3. **History Visualization**: Visual timeline of changes
4. **Cloud Sync**: Sync history across devices
5. **Compression**: Better JSON compression for large states

### API Extensions

```typescript
// Future API possibilities
interface EnhancedHistory {
  getHistoryTree(): HistoryNode[];
  undoObject(objectId: string): void;
  redoTo(historyIndex: number): void;
  exportHistory(): HistoryData;
  importHistory(data: HistoryData): void;
}
```

## Conclusion

The implemented undo/redo system provides a robust, Canva-like experience with:

- ✅ Professional keyboard shortcuts
- ✅ Visual UI feedback
- ✅ Memory optimization
- ✅ Smart context awareness
- ✅ Mobile compatibility
- ✅ Performance optimization

The system is production-ready and handles edge cases like text editing, template loading, and memory management automatically.

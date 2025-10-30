# Cover Printer - GitHub Copilot Instructions

## Project Overview

This is a web-based application built with Angular for positioning and printing multiple small pictures (such as CD/DVD covers, labels, or stickers) on photo paper. The application runs entirely client-side in the browser with no backend dependencies, focusing on perfect print quality and easy picture alignment.

## Core Purpose

The app helps users efficiently print multiple small pictures on photo paper by:
1. Calculating optimal layout based on paper and picture sizes
2. Providing precise picture positioning controls
3. Ensuring print-ready output at 300 DPI
4. Maintaining all processing client-side for privacy

## Technical Stack

- **Framework**: Angular (latest version)
- **Language**: TypeScript
- **Target Browser**: Chrome (primary test browser)
- **No Backend**: All processing happens client-side
- **No State Persistence**: Data is lost on page reload (by design)

## Paper Configuration

### Supported Paper Sizes
- **10x15cm** (default) - Photo paper format
- **13x18cm** - Larger photo paper format

### Implementation Details
- Paper size selection via dropdown menu
- Paper orientation is NOT configurable (irrelevant since prints will be cut)
- All calculations must convert cm to pixels at 300 DPI accurately
- DPI conversion: 1 cm = 118.11 pixels at 300 DPI

## Picture Configuration

### Input Fields
- **Width**: Numeric input in millimeters (default: 45mm)
- **Height**: Numeric input in millimeters (default: 45mm)
- Both fields should validate for positive numbers
- Should support decimal values (e.g., 45.5mm)

### Spacing Controls
- **Page Margins**: Distance from paper edges (in mm)
  - Default: 5mm on all sides
  - Configurable by user
- **Picture Spacing**: Minimum gap between adjacent pictures (in mm)
  - Default: 2mm
  - Configurable by user
- **Important**: Pictures must NEVER be placed edge-to-edge

## Layout Algorithm

### Grid Calculation
```typescript
// Pseudo-code for layout calculation
function calculateGrid(paperSize, pictureSize, margins, spacing) {
  // Convert all measurements to pixels at 300 DPI
  const paperWidthPx = convertToPixels(paperSize.width);
  const paperHeightPx = convertToPixels(paperSize.height);
  const pictureWidthPx = convertToPixels(pictureSize.width);
  const pictureHeightPx = convertToPixels(pictureSize.height);
  const marginPx = convertToPixels(margins);
  const spacingPx = convertToPixels(spacing);

  // Calculate available space
  const availableWidth = paperWidthPx - (2 * marginPx);
  const availableHeight = paperHeightPx - (2 * marginPx);

  // Calculate how many pictures fit
  const columns = Math.floor(
    (availableWidth + spacingPx) / (pictureWidthPx + spacingPx)
  );
  const rows = Math.floor(
    (availableHeight + spacingPx) / (pictureHeightPx + spacingPx)
  );

  // Center the grid if there's extra space
  const totalGridWidth = (columns * pictureWidthPx) + ((columns - 1) * spacingPx);
  const totalGridHeight = (rows * pictureHeightPx) + ((rows - 1) * spacingPx);
  const offsetX = (availableWidth - totalGridWidth) / 2 + marginPx;
  const offsetY = (availableHeight - totalGridHeight) / 2 + marginPx;

  return { rows, columns, offsetX, offsetY };
}
```

### Grid Rendering
- Generate placeholder elements dynamically based on calculation
- Each placeholder represents one picture slot
- Use CSS Grid or absolute positioning for precise placement
- Display grid immediately when parameters change

## Image Handling

### Supported Formats
- **Required**: JPG/JPEG
- **Recommended**: PNG, WebP, GIF
- Use browser's native File API for reading

### Drag & Drop Functionality
- Users drag images from their file system directly onto placeholders
- Support drag-over visual feedback (highlight placeholder)
- Drop handler should:
  - Read file using FileReader
  - Create Image object
  - Store in placeholder's data model
  - Render on canvas or img element

### Image Display Requirements
- **Cropping**: Only show the portion of the image within placeholder boundaries
- Use CSS `overflow: hidden` or canvas clipping
- Default: Center the image in the placeholder
- Maintain aspect ratio of original image

### Image Manipulation

#### Repositioning
- Click and drag to move image within its placeholder
- Track mouse delta and update image offset
- Constrain to allow dragging beyond boundaries (for positioning)
- Live preview while dragging

#### Zooming
- Mouse wheel to zoom in/out
- Zoom center point: mouse cursor position
- Zoom range: **Unlimited** (no min/max initially)
- Consider adding limits if performance issues arise
- Zoom factor suggestion: 1.1 per wheel tick
- Live preview while zooming

#### State Per Placeholder
```typescript
interface PlaceholderState {
  imageData: string | null; // Base64 or Blob URL
  offsetX: number; // Image position X
  offsetY: number; // Image position Y
  scale: number; // Zoom level (1.0 = 100%)
  imageWidth: number; // Original image width
  imageHeight: number; // Original image height
}
```

### Picture Management
- **Clear Button**: Small "×" button on each filled placeholder
  - Only visible when placeholder contains an image
  - Clears the image and resets state
- **Overwriting**: Dropping new image on filled placeholder replaces existing
  - No confirmation dialog needed
  - Reset zoom and position on replacement
- **Single Picture Per Placeholder**: Enforce one image per slot
- **No Swapping**: Users cannot swap pictures between placeholders

## User Interface Guidelines

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header (Purple Gradient)                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🖨️ Cover Printer                                                 │ │
│ │ Position and print multiple pictures on photo paper             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
┌──────────────────────┬──────────────────────────────────────────────┐
│ Control Panel (Left) │ Print Preview Area (Right)                   │
│ ┌──────────────────┐ │ ┌────────────────────────────────────────┐   │
│ │ Paper Size       │ │ │                                        │   │
│ │ ▼ 10×15 cm       │ │ │    ┌────────┐                         │   │
│ └──────────────────┘ │ │    │ Paper  │                         │   │
│ ┌──────────────────┐ │ │    │ (with  │                         │   │
│ │ Picture Size     │ │ │    │ shadow │                         │   │
│ │ Width: 45mm      │ │ │    │ and    │                         │   │
│ │ Height: 45mm     │ │ │    │ border)│                         │   │
│ └──────────────────┘ │ │    │        │                         │   │
│ ┌──────────────────┐ │ │    │ ┌───┐ ┌───┐ ┌───┐               │   │
│ │ Spacing          │ │ │    │ │ 1 │ │ 2 │ │ 3 │               │   │
│ │ Margins: 5mm     │ │ │    │ └───┘ └───┘ └───┘               │   │
│ │ Spacing: 2mm     │ │ │    │ ┌───┐ ┌───┐ ┌───┐               │   │
│ └──────────────────┘ │ │    │ │ 4 │ │ 5 │ │ 6 │               │   │
│ ┌──────┬───────────┐ │ │    │ └───┘ └───┘ └───┘               │   │
│ │ 3×2  │ 300 DPI   │ │ │    │                                  │   │
│ │ Grid │ Quality   │ │ │    │  (Placeholders with dashed       │   │
│ └──────┴───────────┘ │ │    │   borders and icons)             │   │
│ ┌──────────────────┐ │ │    └────────────────────────────────────┘ │
│ │ How to use:      │ │ │                                            │
│ │ 1. Configure...  │ │ │                                            │
│ │ 2. Drag images...│ │ │                                            │
│ └──────────────────┘ │ │                                            │
└──────────────────────┴──────────────────────────────────────────────┘
```

**Key Design Features:**
- **Sidebar Layout**: Controls in a fixed-width left sidebar (320px), print area takes remaining space
- **Sticky Sidebar**: Control panel stays visible when scrolling (desktop only)
- **Card-Based Design**: White cards with subtle shadows on light gray background
- **Purple Gradient Header**: Professional branded header with app name and subtitle
- **Info Cards**: Two-column grid showing grid layout and print quality info
- **Responsive**: On mobile/tablet (<1024px), switches to vertical layout with controls on top
- **Print-Friendly**: Controls hidden when printing, paper fills page exactly

### Visual Feedback
- **Empty Placeholder**:
  - Dashed border
  - Light background color
  - Text hint: "Drop image here"
- **Filled Placeholder**:
  - Solid border
  - Display image with overflow hidden
  - Clear button in corner
- **Drag Over**:
  - Highlight placeholder with brighter border
  - Change background color slightly
- **Active Manipulation**:
  - Show cursor feedback (grab/grabbing)
  - Smooth transitions for dragging

### Styling Considerations
- Use print-safe colors (high contrast)
- Minimal UI chrome in print view
- Hide controls when printing (use `@media print`)
- Ensure pixel-perfect dimensions for printing

## Printing Specifications

### Print Quality
- **Target Resolution**: 300 DPI
- All measurements must be converted accurately
- Use CSS to set exact dimensions in mm/cm
- Test prints to verify accuracy

### Print Styles
```css
@media print {
  /* Hide UI controls */
  .controls, .header, button {
    display: none !important;
  }

  /* Ensure paper size is exact */
  @page {
    size: 10cm 15cm; /* Dynamic based on selection */
    margin: 0;
  }

  /* Print area should fill page exactly */
  .print-area {
    width: 10cm;
    height: 15cm;
    /* Exact dimensions */
  }
}
```

### Print Workflow
1. User arranges all pictures
2. User clicks browser print (Ctrl+P / Cmd+P)
3. Browser shows native print preview
4. Browser handles printer settings
5. Direct print - no PDF export in app

## Code Architecture Guidelines

### Component Structure
```
AppComponent (root)
├── ControlPanelComponent
│   ├── PaperSizeSelector
│   ├── PictureSizeInputs
│   ├── SpacingControls
│   └── MarginControls
└── PrintAreaComponent
    └── PlaceholderComponent (repeated)
        ├── Image display
        ├── Clear button
        └── Drag/zoom handlers
```

### Services
- **LayoutCalculationService**: Calculate grid based on parameters
- **ImageManipulationService**: Handle zoom/pan transformations
- **DpiConversionService**: Convert between mm, cm, and pixels

### State Management
- Use Angular signals or simple service with BehaviorSubject
- No complex state management needed
- State structure:
```typescript
interface AppState {
  paperSize: { width: number; height: number }; // in cm
  pictureSize: { width: number; height: number }; // in mm
  margins: number; // in mm
  spacing: number; // in mm
  placeholders: PlaceholderState[]; // array of placeholder states
}
```

## Development Guidelines

### When Implementing New Features
1. Always consider print accuracy first
2. Test with actual prints, not just screen preview
3. Verify DPI calculations are correct
4. Ensure cross-browser compatibility (Chrome priority)
5. Keep code simple - no over-engineering

### Performance Considerations
- Use canvas for image manipulation (better performance)
- Debounce zoom/pan updates if needed
- Lazy load images if many placeholders
- Optimize re-renders (use OnPush change detection)

### Testing Approach
- Manual testing in Chrome
- Print test pages to verify dimensions
- Test with various image sizes and formats
- Test edge cases (very large/small pictures)

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Prefer immutability for state updates
- Write self-documenting code with clear names
- Add JSDoc comments for complex calculations

## Important Constraints

### What to AVOID
- ❌ No backend/server dependencies
- ❌ No state persistence (no localStorage, IndexedDB)
- ❌ No mobile support (desktop only)
- ❌ No image upload to server
- ❌ No save/load functionality
- ❌ No PDF export from app
- ❌ No image editing features (filters, rotation, etc.)
- ❌ No picture swapping between placeholders
- ❌ No multi-page layouts

### What to INCLUDE
- ✅ Client-side only processing
- ✅ Drag & drop from file system
- ✅ Precise positioning controls
- ✅ 300 DPI print accuracy
- ✅ Automatic grid calculation
- ✅ Responsive controls (not print area)
- ✅ Clear visual feedback
- ✅ Browser print integration

## User Workflow Summary

1. **Setup Phase**:
   - Select paper size (10x15cm or 13x18cm)
   - Enter picture dimensions (default 45×45mm)
   - Optionally adjust margins and spacing
   - App calculates and displays grid

2. **Picture Placement Phase**:
   - Drag images from computer onto placeholders
   - Images are processed locally (no upload)
   - Repeat until all desired placeholders are filled

3. **Adjustment Phase**:
   - Click and drag to reposition image within placeholder
   - Scroll mouse wheel to zoom in/out
   - Fine-tune each picture position
   - Use clear button to remove unwanted pictures

4. **Print Phase**:
   - Press Ctrl+P (Cmd+P on Mac)
   - Review in browser print preview
   - Adjust printer settings if needed
   - Print at 300 DPI

5. **Post-Print**:
   - Cut out pictures manually
   - Pictures can be oriented and used as needed
   - Refresh page for new session (data is lost)

## Future Considerations (NOT in current scope)

These features are explicitly **not** in the current implementation:
- Mobile/tablet support with touch gestures
- Additional paper sizes beyond 10x15cm and 13x18cm
- Save/load layout functionality
- Export to PDF from within app
- Image rotation controls
- Image filters or adjustments
- Batch import of multiple images
- Templates or presets
- Undo/redo functionality
- Keyboard shortcuts
- Print queue management

## Success Criteria

The application is successful when:
1. ✅ Printed pictures match specified dimensions exactly (±0.5mm tolerance)
2. ✅ Drag-and-drop works intuitively without training
3. ✅ Image positioning is precise and responsive
4. ✅ Works reliably in Chrome without crashes
5. ✅ No backend infrastructure required
6. ✅ Privacy maintained (no data leaves browser)
7. ✅ Print output is professional quality at 300 DPI

## Getting Help

When you need to implement a feature, always consider:
- Is this maintaining 300 DPI accuracy?
- Does this work client-side only?
- Is this helping with print quality or picture alignment?
- Does this match the user workflow?

This project is about **precision printing and easy alignment**, not feature richness. Keep it simple, focused, and accurate.

Final notes:
- Always separate HTML-Template from TypeScript.
- do not try to start the development server. Its already running in another terminal.
- Write everything in English

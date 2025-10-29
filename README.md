# Cover Printer

A web-based tool for positioning and printing multiple small pictures (CD/DVD covers, labels, stickers) on photo paper with precision and ease.

## 🎯 Project Goals

- **Perfect Print Quality**: 300 DPI output with exact dimensional accuracy
- **Easy Picture Alignment**: Intuitive drag-and-drop positioning with zoom controls
- **Privacy-First**: All processing happens client-side in the browser
- **No Backend Required**: Zero server dependencies or data uploads

## ✨ Key Features

- 📐 Automatic layout calculation for optimal picture placement
- 📄 Support for multiple paper sizes (10×15cm, 13×18cm photo paper)
- 🖼️ Drag & drop images directly from your computer
- 🔍 Zoom and pan to position pictures perfectly within placeholders
- ⚙️ Configurable picture dimensions, margins, and spacing
- 🖨️ Direct browser printing with accurate dimensions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Navigate to http://localhost:4200
```

## 📋 Usage

1. **Configure**: Select paper size and enter picture dimensions (default: 45×45mm)
2. **Adjust**: Set margins and spacing between pictures
3. **Add Pictures**: Drag images from your computer onto the placeholders
4. **Position**: Click and drag to reposition, use mouse wheel to zoom
5. **Print**: Press Ctrl+P (Cmd+P on Mac) to print

## 🛠️ Technical Details

- **Framework**: Angular
- **Language**: TypeScript
- **Target Browser**: Chrome (primary)
- **Print Resolution**: 300 DPI
- **Processing**: 100% client-side

## 📝 Project Scope

**In Scope:**
- Precise picture positioning and printing
- Common image formats (JPG, PNG, WebP)
- Desktop browser experience
- Automatic grid layout optimization

**Out of Scope:**
- Mobile/tablet support
- State persistence between sessions
- Image editing (rotation, filters)
- PDF export functionality
- Multi-page layouts

## 📖 Documentation

For detailed implementation guidelines and architecture decisions, see [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

## 📄 License

This project is licensed under the Apache 2.0 License.

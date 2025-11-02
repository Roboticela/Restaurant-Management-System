# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm run tauri dev
```

That's it! The application will open automatically.

## First Time Setup

When you first run the application:

1. **Go to Settings** (last button on home screen)
2. Configure your restaurant details:
   - Restaurant name
   - Address and contact info
   - Select your currency
   - Upload a logo (optional)
3. Click **Save Settings**

## Quick Workflow

### Adding Products

1. Click **Product Manager**
2. Click **Add New Product**
3. Enter: Name, Price, Unit (e.g., "Burger", "5.99", "item")
4. Click **Add Product**

### Making a Sale

1. Click **New Sale**
2. Click **+** on products to add to cart
3. Use **+/-** to adjust quantities
4. Review total
5. Click **Complete Sale**

### Viewing Reports

- **Analytics Dashboard**: Charts and statistics
- **Transaction History**: All past sales with filters

## Key Features

✅ **Product Management** - Add/delete menu items  
✅ **Point of Sale** - Quick and easy checkout  
✅ **Analytics** - Revenue, trends, top products  
✅ **Transactions** - Complete sales history  
✅ **Settings** - Full customization  
✅ **Database** - Import/export for backups  

## Keyboard Shortcuts

- **Ctrl+Q** or **Alt+F4**: Quit application
- **F11**: Toggle fullscreen (if supported)

## Building for Production

```bash
npm run build
npm run tauri build
```

The installer will be in `src-tauri/target/release/bundle/`

## Need Help?

Check the full [README.md](./README.md) for detailed documentation.

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run tauri dev` | Run in development mode |
| `npm run build` | Build frontend only |
| `npm run tauri build` | Build complete app |

## Design Notes

This application follows your design requirements:
- ✅ No gradient colors (solid colors used)
- ✅ No scale/bounce hover effects (simple y-axis translation)
- ✅ Consistent padding and margin
- ✅ No shadows

## File Structure at a Glance

```
src/
├── pages/           # All main screens
│   ├── Home.tsx            # Main menu
│   ├── ProductManager.tsx  # Manage products
│   ├── Sale.tsx            # POS system
│   ├── Analytics.tsx       # Charts & stats
│   ├── Transactions.tsx    # Sales history
│   └── Settings.tsx        # Configuration
├── App.tsx          # Routing
├── types.ts         # TypeScript types
└── index.css        # Global styles

src-tauri/src/
├── lib.rs           # Tauri commands (API)
├── database.rs      # All database operations
└── main.rs          # App entry point
```

Enjoy your new Restaurant Management System! 🍽️


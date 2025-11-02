# Restaurant Management System

A comprehensive Restaurant Management System built with Tauri and React. This desktop application provides a complete solution for managing restaurant operations including products, sales, analytics, and transactions.

## Features

- **Product Management**: Add, edit, and delete products with prices and units
- **Point of Sale (POS)**: Easy-to-use interface for creating sales with cart functionality
- **Analytics Dashboard**: Visual insights with charts showing revenue, top products, and trends
- **Transaction History**: View and manage all past transactions with filtering options
- **Settings**: Configure restaurant details, currency, logo, and database import/export
- **Beautiful UI**: Modern, responsive design with animations using Framer Motion

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Recharts** for data visualization
- **React Icons** for icons

### Backend
- **Tauri 2** for desktop application framework
- **Rust** for backend logic
- **SQLite** (via rusqlite) for database
- **Serde** for serialization

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v20 or higher) and npm
- **Rust** (latest stable version)
- **System dependencies for Tauri**:
  - On Ubuntu/Debian:
    ```bash
    sudo apt update
    sudo apt install libwebkit2gtk-4.1-dev \
      build-essential \
      curl \
      wget \
      file \
      libxdo-dev \
      libssl-dev \
      libayatana-appindicator3-dev \
      librsvg2-dev
    ```
  - On macOS:
    ```bash
    xcode-select --install
    ```
  - On Windows:
    - Install Microsoft Visual Studio C++ Build Tools

## Installation

1. **Clone the repository** (if not already cloned)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build Rust dependencies**:
   ```bash
   cd src-tauri
   cargo build
   cd ..
   ```

## Running the Application

### Development Mode

To run the application in development mode with hot-reload:

```bash
npm run tauri dev
```

This will:
- Start the Vite development server for the frontend
- Build and run the Tauri application
- Enable hot-reload for both frontend and backend changes

### Production Build

To build the application for production:

```bash
npm run build
npm run tauri build
```

The built application will be available in `src-tauri/target/release/`.

### Platform-Specific Builds

- **Linux**: `.deb`, `.AppImage` files
- **Windows**: `.msi`, `.exe` installers
- **macOS**: `.dmg`, `.app` bundle

## Project Structure

```
restaurant-management-system/
├── src/                      # React frontend source
│   ├── pages/               # Page components
│   │   ├── Home.tsx
│   │   ├── ProductManager.tsx
│   │   ├── Sale.tsx
│   │   ├── Analytics.tsx
│   │   ├── Transactions.tsx
│   │   └── Settings.tsx
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   └── types.ts             # TypeScript type definitions
├── src-tauri/               # Tauri/Rust backend
│   ├── src/
│   │   ├── lib.rs          # Tauri commands
│   │   ├── main.rs         # Main entry point
│   │   └── database.rs     # Database operations
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── public/                  # Static assets
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## Usage Guide

### Product Management

1. Navigate to **Product Manager** from the home screen
2. Click **Add New Product** to add items to your inventory
3. Enter product name, price, and unit (e.g., piece, kg, plate)
4. Delete products using the trash icon

### Making a Sale

1. Go to **New Sale** from the home screen
2. Browse products and click the **+** button to add to cart
3. Adjust quantities using **+** and **-** buttons
4. Review the cart summary
5. Click **Complete Sale** to finalize the transaction

### Viewing Analytics

1. Access **Analytics Dashboard** from the home screen
2. View:
   - Total revenue and orders
   - Growth rate
   - Revenue trends over time
   - Top-selling products
   - Product distribution charts

### Transaction History

1. Open **Transaction History** from the home screen
2. View all past transactions with details
3. Filter transactions by date range
4. See product statistics (total sold, revenue, avg. price)
5. Delete transactions if needed

### Settings

1. Go to **Settings** from the home screen
2. Configure:
   - Restaurant name, address, phone, email
   - Upload custom logo
   - Set currency (from 200+ options)
   - Business hours
   - Tax rate
   - Receipt footer message
3. **Import/Export Database**:
   - Export: Creates a backup `.db` file
   - Import: Restore from a backup file

## Database

The application uses SQLite for data storage. The database file is automatically created in the app data directory:

- **Linux**: `~/.local/share/com.restaurant.management/restaurant.db`
- **macOS**: `~/Library/Application Support/com.restaurant.management/restaurant.db`
- **Windows**: `C:\Users\<Username>\AppData\Roaming\com.restaurant.management\restaurant.db`

### Database Schema

- `products`: Product inventory
- `sales`: Sales transactions
- `sale_items`: Individual items in each sale
- `settings`: Application settings

## Design Principles

Following the user's requirements:
- **No gradient colors** on buttons and elements (kept solid colors)
- **No scale or bounce hover effects** (using simple y-axis translation)
- **Consistent padding and margin** throughout
- **No shadows** on elements
- Clean, modern UI with good contrast

## Troubleshooting

### Build Errors

1. **Rust compilation errors**:
   ```bash
   cd src-tauri
   cargo clean
   cargo build
   ```

2. **Node modules issues**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Tauri CLI issues**:
   ```bash
   npm install -g @tauri-apps/cli
   ```

### Runtime Issues

1. **Database errors**: The database is automatically initialized on first run
2. **Permission errors**: Ensure the app has write permissions to the data directory
3. **Missing dependencies**: Check that all system dependencies are installed

## Development

### Adding New Features

1. **Frontend**: Add components in `src/pages/` or create new components
2. **Backend**: Add Tauri commands in `src-tauri/src/lib.rs`
3. **Database**: Modify schema in `src-tauri/src/database.rs`

### Code Style

- **React**: Functional components with hooks
- **TypeScript**: Strict type checking
- **Rust**: Follow Rust conventions
- **CSS**: Tailwind utility classes

## Building for Production

### Linux

```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### Windows

```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

### macOS

```bash
npm run tauri build -- --target x86_64-apple-darwin
# or for Apple Silicon:
npm run tauri build -- --target aarch64-apple-darwin
```

## License

This project is licensed under the ISC License.

## Author

Muhammad Shahsawar Khan

## Support

For issues, questions, or contributions, please open an issue on the repository.

## Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI components inspired by modern design principles
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- Charts powered by [Recharts](https://recharts.org/)

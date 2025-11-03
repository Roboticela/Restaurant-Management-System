<div align="center">

![App Logo](https://github.com/Roboticela/Restaurant-Management-System/blob/main/public/Logo.png)

# Restaurant Management System

[![AGPL License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-Latest-orange.svg)](https://www.rust-lang.org/)

**A modern, powerful, and open-source desktop application for managing restaurant operations**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage-guide) • [Contributing](#-contributing) • [Support](#-support)

---

</div>

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Demo](#-demo)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Building for Production](#-building-for-production)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Database](#-database)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [Support](#-support)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [About Roboticela](#-about-roboticela)

---

## 🌟 About

**Restaurant Management System** is a comprehensive, cross-platform desktop application designed to streamline restaurant operations. Built with modern technologies like Tauri, React, and Rust, it provides restaurant owners and managers with powerful tools for managing products, processing sales, analyzing business metrics, and maintaining transaction records—all in a beautiful, intuitive interface.

Whether you're running a small café or a large restaurant, this application is built to scale with your needs while maintaining excellent performance and security.

### Why This Project?

- ✅ **Free and Open Source** - Licensed under AGPL-3.0
- ✅ **Cross-Platform** - Works on Linux, Windows, and macOS
- ✅ **Fast & Lightweight** - Built with Tauri and Rust for maximum performance
- ✅ **Offline-First** - All data stored locally with SQLite
- ✅ **Privacy-Focused** - Your data never leaves your device
- ✅ **Modern UI** - Beautiful, responsive design with dark mode support
- ✅ **Actively Maintained** - Regular updates and community support

---

## ✨ Features

### 🛍️ Product Management
- Add, edit, and delete products with ease
- Set prices and units (piece, kg, plate, etc.)
- Real-time inventory tracking
- Search and filter products

### 💰 Point of Sale (POS)
- Intuitive shopping cart interface
- Quick product selection and quantity adjustment
- Real-time total calculation
- Instant transaction processing
- Receipt generation and printing

### 📊 Analytics Dashboard
- Visual insights with interactive charts
- Total revenue and order tracking
- Growth rate calculations
- Revenue trends over time
- Top-selling products analysis
- Product distribution visualization
- Date range filtering for custom reports

### 📜 Transaction History
- Complete transaction log with details
- Advanced filtering by date range
- Product statistics (total sold, revenue, average price)
- Transaction deletion and management
- Export capabilities

### ⚙️ Settings & Configuration
- Restaurant information (name, address, phone, email)
- Custom logo upload
- Currency selection (200+ currencies supported)
- Business hours configuration
- Tax rate customization
- Receipt footer customization
- Database import/export for backups

### 📱 Additional Features
- **Dark Mode** - Eye-friendly interface for low-light environments
- **About Page** - Project information, contributors, and links
- **Support Page** - Built-in contact form with SMTP integration
- **Responsive Design** - Optimized for various screen sizes
- **Smooth Animations** - Powered by Framer Motion
- **Type Safety** - Built with TypeScript for reliability

---

## 🎬 Demo

> **Visit our official landing page:** [restaurant-management-system.roboticela.com](https://restaurant-management-system.roboticela.com)

<div align="center">
  
### Key Highlights

| Dashboard | Product Management | Analytics |
|:---------:|:------------------:|:---------:|
| Modern home screen with quick access to all features | Easy product CRUD operations | Beautiful charts and insights |

</div>

---

## 🛠️ Technology Stack

### Frontend
- **[React 19](https://reactjs.org/)** - Modern UI library with latest features
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion 12](https://www.framer.com/motion/)** - Animation library
- **[React Router 6](https://reactrouter.com/)** - Client-side routing
- **[Recharts 2](https://recharts.org/)** - Data visualization
- **[React Icons 5](https://react-icons.github.io/react-icons/)** - Icon library
- **[Vite 7](https://vitejs.dev/)** - Lightning-fast build tool

### Backend
- **[Tauri 2](https://tauri.app/)** - Desktop application framework
- **[Rust](https://www.rust-lang.org/)** - Systems programming language
- **[SQLite](https://www.sqlite.org/)** (via rusqlite) - Embedded database
- **[Serde](https://serde.rs/)** - Serialization framework
- **[Lettre](https://lettre.rs/)** - Email client for SMTP

### Development Tools
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[ESLint](https://eslint.org/)** - Code linting (optional)

---

## 📋 Prerequisites

Before installing, ensure you have the following:

### Required Software

1. **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
2. **Rust** (latest stable) - [Install](https://www.rust-lang.org/tools/install)
3. **pnpm** (recommended) or npm

### System Dependencies

#### Linux (Ubuntu/Debian)
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

#### Linux (Fedora)
```bash
sudo dnf check-update
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

#### Linux (Arch)
```bash
sudo pacman -Syu
sudo pacman -S webkit2gtk \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  appmenu-gtk-module \
  gtk3 \
  libappindicator-gtk3 \
  librsvg
```

#### macOS
```bash
xcode-select --install
```

#### Windows
- Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 10/11)

### For Android Development (Optional)
If you plan to build for Android, you'll also need:
- **JDK 17 or 21**
- **Node.js 24**
- **Android SDK Platform 34 or 35**
- **Android SDK Build-Tools 34.0.0+**
- **NDK (Native Development Kit)**
- **Android Command-line tools**

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Roboticela/Restaurant-Management-System.git
cd Restaurant-Management-System
```

### 2. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

### 3. Build Rust Dependencies

```bash
cd src-tauri
cargo build
cd ..
```

---

## 🚀 Running the Application

### Development Mode

Run the application in development mode with hot-reload:

```bash
pnpm run tauri dev
# or
npm run tauri dev
```

This will:
- Start the Vite development server for the frontend
- Build and run the Tauri application
- Enable hot-reload for both frontend and backend changes

### Frontend Only (Web Preview)

To test the frontend without Tauri:

```bash
pnpm run dev
# or
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## 📦 Building for Production

### Build All Platforms

```bash
pnpm run build
pnpm run tauri build
# or
npm run build
npm run tauri build
```

### Platform-Specific Builds

#### Linux
```bash
pnpm run tauri build -- --target x86_64-unknown-linux-gnu
```

Output files:
- `.deb` package (Debian/Ubuntu)
- `.AppImage` (Universal Linux)

#### Windows
```bash
pnpm run tauri build -- --target x86_64-pc-windows-msvc
```

Output files:
- `.msi` installer
- `.exe` standalone executable

#### macOS
```bash
# Intel Macs
pnpm run tauri build -- --target x86_64-apple-darwin

# Apple Silicon (M1/M2/M3)
pnpm run tauri build -- --target aarch64-apple-darwin
```

Output files:
- `.dmg` disk image
- `.app` application bundle

### Build Output Location

All built applications are available in:
```
src-tauri/target/release/
```

And platform-specific installers in:
```
src-tauri/target/release/bundle/
```

---

## 📚 Usage Guide

### Getting Started

1. **Launch the Application** - Open the built application or run in dev mode
2. **Set Up Your Restaurant** - Go to Settings and configure your restaurant details
3. **Add Products** - Navigate to Product Manager and add your menu items
4. **Start Selling** - Use the POS interface to make your first sale
5. **Analyze Performance** - Check the Analytics dashboard for insights

### Product Management

1. Navigate to **Product Manager** from the home screen
2. Click **Add New Product** button
3. Fill in product details:
   - Product name
   - Price (in your configured currency)
   - Unit (piece, kg, plate, liter, etc.)
4. Click **Save** to add the product
5. Edit or delete products using the action buttons

### Making a Sale (POS)

1. Go to **New Sale** from the home screen
2. Browse available products
3. Click the **+ (Add)** button on products to add to cart
4. Adjust quantities using **+** and **-** buttons in the cart
5. Review the cart summary with total calculation
6. Click **Complete Sale** to finalize the transaction
7. Optionally print or save the receipt

### Viewing Analytics

1. Access **Analytics Dashboard** from the home screen
2. View comprehensive metrics:
   - **Total Revenue** - All-time earnings
   - **Total Orders** - Number of transactions
   - **Growth Rate** - Period-over-period comparison
   - **Revenue Trends** - Interactive line chart
   - **Top Products** - Best-selling items with bar chart
   - **Product Distribution** - Pie chart visualization
3. Use date range filters for custom reports

### Transaction History

1. Open **Transaction History** from the home screen
2. View all past transactions with complete details
3. Filter transactions by date range
4. View individual transaction items and totals
5. See aggregated product statistics:
   - Total quantity sold per product
   - Total revenue per product
   - Average price per product
6. Delete transactions if needed (confirmation required)

### Settings Configuration

1. Go to **Settings** from the home screen
2. Configure the following:

   **Restaurant Information:**
   - Restaurant name
   - Address
   - Phone number
   - Email address

   **Branding:**
   - Upload custom logo (appears on receipts and UI)

   **Localization:**
   - Select currency (200+ options)
   - Set currency symbol position

   **Business Details:**
   - Operating hours
   - Tax rate (percentage)
   - Receipt footer message

   **Data Management:**
   - **Export Database** - Create a backup `.db` file
   - **Import Database** - Restore from a backup file

3. Click **Save Settings** to apply changes

### About Page

1. Navigate to **About** from the home screen
2. View comprehensive information:
   - Project description and purpose
   - Creator and contributor information
   - GitHub repository links
   - How to contribute guidelines
   - Privacy policy and terms of use
   - Technology stack details
   - Version information

3. Quick actions:
   - **View on GitHub** - Open the repository
   - **Star on GitHub** - Support the project

### Support & Contact

1. Go to **Support** from the home screen
2. Fill out the contact form:
   - Your name
   - Your email address
   - Subject line
   - Detailed message

3. Click **Send Message** to submit

**Note:** Email functionality requires SMTP configuration. See the [Configuration](#-configuration) section below.

Alternative support channels:
- **GitHub Issues**: [Report bugs or request features](https://github.com/Roboticela/Restaurant-Management-System/issues)
- **Website**: [Visit our official site](https://restaurant-management-system.roboticela.com)

---

## 📁 Project Structure

```
restaurant-management-system/
│
├── src/                          # React frontend source
│   ├── pages/                   # Page components
│   │   ├── Home.tsx            # Dashboard/home page
│   │   ├── ProductManager.tsx  # Product CRUD interface
│   │   ├── Sale.tsx            # POS interface
│   │   ├── Analytics.tsx       # Analytics dashboard
│   │   ├── Transactions.tsx    # Transaction history
│   │   ├── Settings.tsx        # App settings
│   │   ├── About.tsx           # About page
│   │   └── Support.tsx         # Contact/support page
│   │
│   ├── components/              # Reusable components
│   │   ├── DatePicker.tsx      # Date selection component
│   │   ├── Receipt.tsx         # Receipt display component
│   │   └── ThemeToggle.tsx     # Dark/light mode toggle
│   │
│   ├── contexts/                # React contexts
│   │   └── ThemeContext.tsx    # Theme state management
│   │
│   ├── assets/                  # Static assets
│   │   └── CompanyLogo.png     # Roboticela logo
│   │
│   ├── App.tsx                  # Main app component with routing
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles
│   ├── types.ts                 # TypeScript type definitions
│   └── vite-env.d.ts           # Vite environment types
│
├── src-tauri/                   # Tauri/Rust backend
│   ├── src/
│   │   ├── main.rs             # Tauri entry point
│   │   ├── lib.rs              # Tauri commands (API)
│   │   ├── database.rs         # Database operations
│   │   └── email.rs            # SMTP email functionality
│   │
│   ├── templates/
│   │   └── support_email.html  # HTML email template
│   │
│   ├── icons/                   # Application icons
│   ├── capabilities/            # Tauri security capabilities
│   ├── gen/                     # Generated code
│   ├── Cargo.toml              # Rust dependencies
│   ├── Cargo.lock              # Dependency lock file
│   ├── build.rs                # Build script
│   └── tauri.conf.json         # Tauri configuration
│
├── public/                      # Public static assets
│   └── Logo.png                # Application logo
│
├── scripts/                     # Build/utility scripts
│   └── update-year.cjs         # Copyright year updater
│
├── dist/                        # Built frontend files
│
├── node_modules/                # Node.js dependencies
│
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML entry point
├── package.json                 # Node.js package config
├── pnpm-lock.yaml              # pnpm lock file
├── pnpm-workspace.yaml         # pnpm workspace config
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # TailwindCSS config
├── tsconfig.json               # TypeScript config (app)
├── tsconfig.node.json          # TypeScript config (node)
├── vite.config.ts              # Vite configuration
├── info.txt                     # Android build requirements
├── LICENSE                      # AGPL-3.0 license
└── README.md                    # This file
```

---

## 🗄️ Database

The application uses **SQLite** for local data storage. The database file is automatically created on first launch.

### Database Location

The database file `restaurant.db` is stored in the application data directory:

- **Linux**: `~/.local/share/com.restaurant.management/restaurant.db`
- **macOS**: `~/Library/Application Support/com.restaurant.management/restaurant.db`
- **Windows**: `C:\Users\<Username>\AppData\Roaming\com.restaurant.management\restaurant.db`

### Database Schema

The database consists of four main tables:

#### `products`
Stores product/menu item information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique product ID |
| name | TEXT NOT NULL | Product name |
| price | REAL NOT NULL | Product price |
| unit | TEXT NOT NULL | Unit of measurement |
| created_at | TEXT | Creation timestamp |

#### `sales`
Records individual sales transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique sale ID |
| total | REAL NOT NULL | Total sale amount |
| date | TEXT NOT NULL | Transaction date |
| created_at | TEXT | Creation timestamp |

#### `sale_items`
Stores individual items within each sale.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique item ID |
| sale_id | INTEGER | Foreign key to sales table |
| product_id | INTEGER | Foreign key to products table |
| quantity | INTEGER NOT NULL | Quantity sold |
| price | REAL NOT NULL | Price at time of sale |

#### `settings`
Holds application configuration.

| Column | Type | Description |
|--------|------|-------------|
| key | TEXT PRIMARY KEY | Setting key |
| value | TEXT | Setting value (JSON) |

### Backup & Restore

#### Export Database
1. Go to **Settings** → **Data Management**
2. Click **Export Database**
3. Choose save location
4. A `.db` file will be created

#### Import Database
1. Go to **Settings** → **Data Management**
2. Click **Import Database**
3. Select a previously exported `.db` file
4. Confirm the import (this will replace current data)

**⚠️ Important:** Always backup your database before importing!

---

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file in the project root for SMTP configuration:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_RECIPIENT='Team <support@example.com>'
```

### SMTP Setup for Support Page

To enable the email functionality in the Support page:

1. Choose an SMTP provider (Gmail, SendGrid, Mailgun, etc.)
2. Configure the SMTP settings in your `.env` file
3. For Gmail:
   - Enable 2-factor authentication
   - Generate an [App Password](https://support.google.com/accounts/answer/185833)
   - Use the app password in the `.env` file

Refer to `SMTP_SETUP.md` (if exists) for detailed SMTP configuration instructions.

### Tauri Configuration

The `src-tauri/tauri.conf.json` file contains Tauri-specific settings:

- App identifier and version
- Window size and title
- Security capabilities
- Bundle configuration
- Platform-specific options

Modify this file to customize the application behavior.

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or spreading the word, every contribution matters.

### Ways to Contribute

1. **Report Bugs** - Open an issue on GitHub with detailed information
2. **Suggest Features** - Share your ideas for new features or improvements
3. **Write Code** - Submit pull requests with bug fixes or new features
4. **Improve Documentation** - Help make the docs clearer and more comprehensive
5. **Share the Project** - Star the repository and tell others about it

### Getting Started with Development

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/Restaurant-Management-System.git
   cd Restaurant-Management-System
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style and conventions
   - Add comments where necessary
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

   Commit message prefixes:
   - `Add:` - New feature
   - `Fix:` - Bug fix
   - `Update:` - Improvement to existing feature
   - `Docs:` - Documentation changes
   - `Style:` - Code style changes (formatting, etc.)
   - `Refactor:` - Code refactoring
   - `Test:` - Adding or updating tests
   - `Chore:` - Maintenance tasks

5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of your changes
   - Reference any related issues

### Code Style Guidelines

#### Frontend (TypeScript/React)
- Use functional components with hooks
- Use TypeScript for type safety
- Follow React best practices
- Use TailwindCSS utility classes for styling
- Keep components small and focused
- Write descriptive variable and function names

#### Backend (Rust)
- Follow Rust conventions and idioms
- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Handle errors properly
- Write documentation comments for public APIs

#### Design Guidelines (Per User Requirements)
- ❌ No gradient colors on buttons and elements
- ❌ No scale or bounce hover effects
- ❌ No shadows on elements
- ✅ Use solid colors
- ✅ Use simple y-axis translation for hover effects
- ✅ Keep padding and margin consistent

### Testing

Before submitting a pull request:

1. Test your changes in development mode
2. Build the application and test the production build
3. Test on multiple platforms if possible
4. Verify no existing functionality is broken
5. Check for console errors or warnings

### Pull Request Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Make any requested updates
4. Once approved, your PR will be merged
5. Your contribution will be credited

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive Behavior:**
- Being respectful and inclusive
- Being patient and welcoming to newcomers
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable Behavior:**
- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Publishing others' private information
- Any conduct inappropriate in a professional setting

### Enforcement

Instances of unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly. Maintainers have the right to remove, edit, or reject comments, commits, code, issues, and other contributions that don't align with this Code of Conduct.

---

## 💬 Support

Need help? We're here for you!

### In-App Support

Use the built-in **Support** page to send us a message directly through the application. Fill out the contact form with your name, email, subject, and message.

### GitHub Issues

For bug reports, feature requests, or technical issues:

🐛 **[Open an Issue](https://github.com/Roboticela/Restaurant-Management-System/issues)**

When reporting a bug, please include:
- Operating system and version
- Application version
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Error messages or logs

### Community

- 🌐 **Website**: [restaurant-management-system.roboticela.com](https://restaurant-management-system.roboticela.com)
- 💻 **GitHub**: [Roboticela/Restaurant-Management-System](https://github.com/Roboticela/Restaurant-Management-System)
- ⭐ **Star the Project**: Show your support by starring the repository!

### FAQ

**Q: Is this application free to use?**  
A: Yes! It's completely free and open-source under the AGPL-3.0 license.

**Q: Can I use this for commercial purposes?**  
A: Yes, but you must comply with the AGPL-3.0 license terms. Any modifications made to the software that is used over a network must be made available to users.

**Q: Does my data get sent to any servers?**  
A: No. All data is stored locally on your device. Your privacy is our priority.

**Q: Can I customize the application for my needs?**  
A: Absolutely! Fork the repository and modify it as needed. Contributions back to the main project are welcome.

**Q: What if I find a security vulnerability?**  
A: Please report security issues responsibly by opening a GitHub issue or contacting the maintainers directly.

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **Cloud Sync** - Optional cloud backup and sync
- [ ] **User Management** - Multiple user accounts with permissions
- [ ] **Advanced Reporting** - PDF/Excel export of reports
- [ ] **Inventory Management** - Stock tracking and alerts
- [ ] **Supplier Management** - Track suppliers and purchase orders
- [ ] **Table Management** - Restaurant table and reservation system
- [ ] **Kitchen Display System** - Order management for kitchen staff
- [ ] **Customer Management** - Loyalty programs and customer database
- [ ] **Receipt Customization** - Advanced receipt templates
- [ ] **Tax Reports** - Automated tax calculation and reports
- [ ] **Employee Management** - Staff scheduling and payroll

### Version History

**v0.1.0** (Current)
- Initial release
- Basic POS functionality
- Product management
- Analytics dashboard
- Transaction history
- Settings and configuration
- About and Support pages
- Dark mode support
- Database import/export

See [Releases](https://github.com/Roboticela/Restaurant-Management-System/releases) for detailed changelog.

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### What This Means

✅ **You CAN:**
- Use the software for any purpose
- Study how the software works and modify it
- Distribute copies of the software
- Distribute modified versions of the software
- Use the software commercially

⚠️ **You MUST:**
- Disclose your source code when distributing
- Include the original license and copyright notice
- State any changes made to the original code
- Make your modified source code available under AGPL-3.0
- **If you run a modified version on a server/network, provide source access to users**

❌ **You CANNOT:**
- Hold the authors liable for damages
- Use the authors' names for promotion without permission

The AGPL-3.0 license is similar to GPL-3.0 but adds an important provision: if you modify this software and make it available over a network (e.g., as a web service), you must also make the complete source code available to users of that service.

**Full License Text:** See the [LICENSE](LICENSE) file for complete terms and conditions.

### Why AGPL?

We chose the AGPL license to ensure that improvements to this software remain open and available to the community, even when the software is used as a service. This protects the rights of end users and promotes collaboration.

---

## 🙏 Acknowledgments

This project wouldn't be possible without these amazing open-source projects and communities:

### Core Technologies
- **[Tauri](https://tauri.app/)** - For the incredible desktop application framework
- **[React](https://reactjs.org/)** - For the powerful UI library
- **[Rust](https://www.rust-lang.org/)** - For performance and safety
- **[Vite](https://vitejs.dev/)** - For lightning-fast development experience

### Libraries & Tools
- **[TailwindCSS](https://tailwindcss.com/)** - For beautiful, utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - For smooth animations
- **[Recharts](https://recharts.org/)** - For data visualization
- **[React Router](https://reactrouter.com/)** - For seamless routing
- **[React Icons](https://react-icons.github.io/react-icons/)** - For comprehensive icon sets
- **[SQLite](https://www.sqlite.org/)** - For reliable local database
- **[TypeScript](https://www.typescriptlang.org/)** - For type safety

### Community
- All the contributors who have helped improve this project
- The open-source community for inspiration and support
- Users who provide feedback and report issues

### Special Thanks
- **Free Software Foundation** - For promoting software freedom
- **GitHub** - For hosting and collaboration tools
- All the developers who contribute to open-source

---

## 🏢 About Roboticela

<div align="center">

<img src="https://github.com/Roboticela/Restaurant-Management-System/blob/main/src/assets/CompanyLogo.png" alt="Logo" width="200" style="padding:30px;" />

**[Roboticela](https://github.com/Roboticela)** is dedicated to creating high-quality, open-source software solutions that empower businesses and individuals.

</div>

### Our Mission

To build innovative, accessible, and privacy-focused software that respects user freedom and promotes open collaboration.

### Our Projects

This **Restaurant Management System** is proudly developed and maintained by Roboticela. We believe in:

- 🔓 **Open Source** - Transparency and community collaboration
- 🔒 **Privacy** - Your data belongs to you
- 🚀 **Innovation** - Modern technologies and best practices
- 🌍 **Accessibility** - Software for everyone, everywhere
- 💚 **Sustainability** - Building for the long term

### Get in Touch

- 🐙 **GitHub**: [github.com/Roboticela](https://github.com/Roboticela)
- 🌐 **Website**: [restaurant-management-system.roboticela.com](https://restaurant-management-system.roboticela.com)
- 📧 **Email**: contact@roboticela.com
- 🔗 **Project Repository**: [github.com/Roboticela/Restaurant-Management-System](https://github.com/Roboticela/Restaurant-Management-System)

### More Projects

Check out our other open-source projects on our [GitHub profile](https://github.com/Roboticela). We're always working on new ideas and welcome collaboration!

### Support Roboticela

If you find our projects useful:

- ⭐ **Star our repositories** on GitHub
- 🐛 **Report bugs** and **suggest features**
- 🤝 **Contribute code** or **improve documentation**
- 📣 **Spread the word** and share with others
- ☕ **Support development** (donation links on website)

---

<div align="center">

## 💖 Thank You!

Thank you for using **Restaurant Management System**. We hope it helps streamline your restaurant operations and contributes to your success.

**Built with ❤️ by [Roboticela](https://github.com/Roboticela)**

© 2025 Roboticela. Licensed under AGPL-3.0.

---

⭐ **If you find this project useful, please consider giving it a star on GitHub!** ⭐

[⬆ Back to Top](#️-restaurant-management-system)

</div>

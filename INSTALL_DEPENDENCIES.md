# Build Dependencies Installation Guide

Complete list of packages needed to build for all platforms and architectures.

> 📚 **After installing dependencies, see [README.md - Building for Production](README.md#-building-for-production) for build instructions and commands.**

---

## 🐧 Linux (Ubuntu/Debian)

### Base Build Tools
```bash
sudo apt update
sudo apt install -y \
  curl \
  wget \
  file \
  build-essential \
  libssl-dev \
  pkg-config \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev
```

### Cross-Compilation Tools

#### Windows Cross-Compilation (MinGW)
```bash
sudo apt install -y \
  mingw-w64 \
  gcc-mingw-w64 \
  g++-mingw-w64 \
  clang-17
```

#### ARM64/aarch64 Cross-Compilation
```bash
sudo apt install -y \
  gcc-aarch64-linux-gnu \
  g++-aarch64-linux-gnu \
  crossbuild-essential-arm64 \
  libc6-dev-arm64-cross \
  libssl-dev:arm64 \
  libgtk-3-dev:arm64 \
  libwebkit2gtk-4.1-dev:arm64
```

#### ARMv7 Cross-Compilation
```bash
sudo apt install -y \
  gcc-arm-linux-gnueabihf \
  g++-arm-linux-gnueabihf \
  crossbuild-essential-armhf \
  libc6-dev-armhf-cross \
  libssl-dev:armhf \
  libgtk-3-dev:armhf \
  libwebkit2gtk-4.1-dev:armhf
```

### Android Build Tools

#### Install Android Studio (Recommended)
Download from: https://developer.android.com/studio

Or install via snap:
```bash
sudo snap install android-studio --classic
```

#### Or Install Android SDK/NDK Standalone
```bash
# Install Java (required)
sudo apt install -y openjdk-17-jdk

# Download Android command-line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip -d ~/android-sdk
mkdir -p ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools ~/android-sdk/cmdline-tools/latest

# Set environment variables (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Install SDK components
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0" "ndk;25.2.9519653"
```

### Node.js & pnpm
```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm
```

### Rust & Cargo
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add Rust targets
rustup target add \
  x86_64-unknown-linux-gnu \
  aarch64-unknown-linux-gnu \
  armv7-unknown-linux-gnueabihf \
  x86_64-pc-windows-gnu \
  x86_64-pc-windows-msvc \
  aarch64-pc-windows-msvc \
  i686-pc-windows-msvc \
  x86_64-apple-darwin \
  aarch64-apple-darwin \
  aarch64-linux-android \
  armv7-linux-androideabi \
  i686-linux-android \
  x86_64-linux-android
```

## 🪟 Windows

### Using Windows Package Managers

#### Chocolatey (Recommended)
```powershell
# Install Chocolatey first (as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install build tools
choco install -y nodejs visualstudio2022buildtools visualstudio2022-workload-vctools rust-ms
choco install -y webview2-runtime

# Install pnpm
npm install -g pnpm
```

#### WinGet
```powershell
# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install Rust
winget install Rustlang.Rustup

# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Install WebView2
winget install Microsoft.EdgeWebView2Runtime

# Install pnpm
npm install -g pnpm
```

### Manual Installation
1. **Visual Studio 2022** (Community/Build Tools): https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++" workload
   
2. **Rust**: https://rustup.rs/
   
3. **Node.js**: https://nodejs.org/
   
4. **WebView2**: https://developer.microsoft.com/microsoft-edge/webview2/

### Rust Targets (Windows)
```powershell
rustup target add x86_64-pc-windows-msvc
rustup target add aarch64-pc-windows-msvc
rustup target add i686-pc-windows-msvc
```

## 🍎 macOS

### Xcode & Command Line Tools
```bash
# Install Xcode from App Store
# Then install Command Line Tools
xcode-select --install

# Accept license
sudo xcodebuild -license accept
```

### Homebrew & Dependencies
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node pnpm
```

### Rust & Targets
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add targets
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
```

### iOS Development
```bash
# Additional iOS targets
rustup target add aarch64-apple-ios
rustup target add x86_64-apple-ios
rustup target add aarch64-apple-ios-sim
```

## 📦 All-in-One Installation Scripts

### Linux (Ubuntu/Debian) - Complete Setup
```bash
#!/bin/bash

echo "🚀 Installing all build dependencies for multi-platform builds..."

# Base system tools
sudo apt update
sudo apt install -y curl wget file build-essential libssl-dev pkg-config

# Tauri dependencies
sudo apt install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev

# Cross-compilation tools
echo "📦 Installing cross-compilation tools..."
sudo apt install -y \
  mingw-w64 \
  gcc-mingw-w64 \
  g++-mingw-w64 \
  gcc-aarch64-linux-gnu \
  g++-aarch64-linux-gnu \
  gcc-arm-linux-gnueabihf \
  g++-arm-linux-gnueabihf \
  crossbuild-essential-arm64 \
  crossbuild-essential-armhf

# Node.js & pnpm
echo "📦 Installing Node.js and pnpm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pnpm

# Rust
echo "🦀 Installing Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

# Rust targets
echo "🎯 Adding Rust compilation targets..."
rustup target add \
  x86_64-unknown-linux-gnu \
  aarch64-unknown-linux-gnu \
  armv7-unknown-linux-gnueabihf \
  x86_64-pc-windows-gnu \
  aarch64-linux-android \
  armv7-linux-androideabi \
  i686-linux-android \
  x86_64-linux-android

# Android SDK (optional)
echo "📱 To build for Android, install Android Studio or SDK manually"
echo "Visit: https://developer.android.com/studio"

echo ""
echo "✅ Base dependencies installed!"
echo ""
echo "📋 To enable Android builds:"
echo "   1. Install Android Studio or SDK"
echo "   2. Set ANDROID_HOME environment variable"
echo ""
echo "📋 To enable macOS/iOS builds:"
echo "   Run on macOS with Xcode installed"
echo ""
echo "🎉 Ready to build! Run: pnpm build:desktop"
```

Save this as `install-deps.sh`, make it executable, and run:
```bash
chmod +x install-deps.sh
./install-deps.sh
```

### macOS - Complete Setup
```bash
#!/bin/bash

echo "🚀 Installing all build dependencies for macOS builds..."

# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and pnpm
brew install node pnpm

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

# Add Rust targets
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
rustup target add aarch64-apple-ios
rustup target add x86_64-apple-ios

echo "✅ All dependencies installed!"
echo "🎉 Ready to build! Run: pnpm build:desktop"
```

## 🔍 Verification Commands

After installation, verify everything is set up:

```bash
# Check versions
node --version
pnpm --version
rustc --version
cargo --version

# Check installed Rust targets
rustup target list --installed

# Check cross-compilers (Linux)
x86_64-w64-mingw32-gcc --version
aarch64-linux-gnu-gcc --version
arm-linux-gnueabihf-gcc --version

# Check Android SDK (if installed)
echo $ANDROID_HOME
```

## 📊 Platform Requirements Summary

| Platform | Required Tools | Optional |
|----------|---------------|----------|
| **Linux x86_64** | ✅ Rust, Node.js, GTK3, WebKit2GTK | - |
| **Linux ARM64** | ✅ + ARM64 cross-compiler | - |
| **Linux ARMv7** | ✅ + ARMv7 cross-compiler | - |
| **Windows** | ✅ MinGW (Linux) OR Windows + MSVC | - |
| **macOS** | ❌ Requires macOS + Xcode | - |
| **iOS** | ❌ Requires macOS + Xcode | Apple Developer Account |
| **Android** | ✅ + Android SDK/NDK + JDK | Android Studio |

## 🚀 Quick Start After Installation

```bash
# Clone and setup
cd restaurant-management-system
pnpm install

# Build for current platform
pnpm build:desktop

# Build for all available platforms
pnpm build:all

# Generate checksums
pnpm checksums

# Verify a build
pnpm verify path/to/installer
```

## 💡 Tips

1. **Docker Alternative**: Consider using Docker for consistent cross-platform builds
2. **CI/CD**: Use GitHub Actions with multiple runners for true multi-platform builds
3. **Space Requirements**: Ensure ~20GB free space for all dependencies and builds
4. **Memory**: 8GB+ RAM recommended for parallel builds

## 🔗 Official Documentation

- Tauri Prerequisites: https://tauri.app/v1/guides/getting-started/prerequisites
- Rust Installation: https://rustup.rs/
- Android Studio: https://developer.android.com/studio
- Xcode: https://developer.apple.com/xcode/

---

**Last Updated**: November 3, 2025  
**Tauri Version**: 2.x  
**Tested On**: Ubuntu 22.04, Windows 11, macOS 14

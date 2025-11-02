"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/electron-is-dev/index.js
var require_electron_is_dev = __commonJS({
  "node_modules/electron-is-dev/index.js"(exports2, module2) {
    "use strict";
    var electron = require("electron");
    if (typeof electron === "string") {
      throw new TypeError("Not running in an Electron environment!");
    }
    var isEnvSet = "ELECTRON_IS_DEV" in process.env;
    var getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
    module2.exports = isEnvSet ? getFromEnv : !electron.app.isPackaged;
  }
});

// electron/main.ts
var import_electron3 = require("electron");
var import_pdf_to_printer = require("pdf-to-printer");
var import_puppeteer = __toESM(require("puppeteer"));
var import_path2 = __toESM(require("path"));
var import_promises = __toESM(require("fs/promises"));
var import_electron_is_dev = __toESM(require_electron_is_dev());

// electron/ipcHandlers.ts
var import_electron = require("electron");
var import_better_sqlite3 = __toESM(require("better-sqlite3"));
var import_path = __toESM(require("path"));
var import_electron2 = require("electron");
var dbPath = import_path.default.join(import_electron2.app.getPath("userData"), "restaurant.db");
var db = new import_better_sqlite3.default(dbPath);
import_electron.ipcMain.handle("get-settings", () => {
  const stmt = db.prepare("SELECT * FROM settings LIMIT 1");
  return stmt.get();
});
import_electron.ipcMain.handle("save-settings", (_, settings) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO settings (
      restaurantName, address, phone, email, taxRate, 
      currency, openingTime, closingTime, receiptFooter, logo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    settings.restaurantName,
    settings.address,
    settings.phone,
    settings.email,
    settings.taxRate,
    settings.currency,
    settings.openingTime,
    settings.closingTime,
    settings.receiptFooter,
    settings.logo
  );
  return true;
});
import_electron.ipcMain.handle("get-products", () => {
  const stmt = db.prepare("SELECT * FROM products ORDER BY name");
  return stmt.all();
});
import_electron.ipcMain.handle("add-product", (_, product) => {
  const stmt = db.prepare(`
    INSERT INTO products (name, price, category, unit) 
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(
    product.name,
    product.price,
    product.category,
    product.unit
  );
  return result.lastInsertRowid;
});
var setupDatabaseHandlers = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      restaurantName TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      taxRate TEXT,
      currency TEXT,
      openingTime TEXT,
      closingTime TEXT,
      receiptFooter TEXT,
      logo TEXT
    );
    
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT,
      unit TEXT
    );
  `);
};

// electron/main.ts
var mainWindow = null;
var preloadPath = import_electron_is_dev.default ? import_path2.default.join(__dirname, "preload.js") : import_path2.default.join(__dirname, "preload.js");
function createWindow() {
  console.log("Creating main window");
  mainWindow = new import_electron3.BrowserWindow({
    width: 1200,
    height: 800,
    title: "Restaurant Management System",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      sandbox: false
    },
    icon: import_path2.default.join(__dirname, "../assets/icon.ico"),
    autoHideMenuBar: true,
    frame: true
  });
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Failed to load:", errorCode, errorDescription);
  });
  if (import_electron_is_dev.default) {
    console.log("Loading dev URL");
    mainWindow.loadURL("http://localhost:3000");
  } else {
    console.log("Loading production file");
    const indexPath = import_path2.default.join(__dirname, "..", ".next/server/pages/index.html");
    console.log("Trying to load:", indexPath);
    try {
      if (import_promises.default.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
      } else {
        console.error("Index file not found at:", indexPath);
        const altPath = import_path2.default.join(__dirname, "..", ".next/static/index.html");
        if (import_promises.default.existsSync(altPath)) {
          mainWindow.loadFile(altPath);
        } else {
          console.error("No index file found in alternative location either");
        }
      }
    } catch (error) {
      console.error("Error loading index file:", error);
    }
  }
  setupDatabaseHandlers();
  setupIPCHandlers();
}
function generateReceiptHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            width: 80mm;
            padding: 10mm;
            margin: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 5mm;
          }
          .restaurant-name {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 2mm;
          }
          .separator {
            border-top: 1px dashed #000;
            margin: 3mm 0;
          }
          .items-header {
            display: grid;
            grid-template-columns: 40% 30% 30%;
            font-weight: bold;
            margin-bottom: 2mm;
            font-size: 9pt;
          }
          .item-row {
            display: grid;
            grid-template-columns: 40% 30% 30%;
            margin-bottom: 1mm;
            font-size: 9pt;
          }
          .price {
            text-align: right;
          }
          .quantity {
            text-align: center;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-top: 3mm;
            font-size: 11pt;
          }
          .footer {
            text-align: center;
            margin-top: 5mm;
            padding-top: 3mm;
            border-top: 1px dashed #000;
            font-size: 9pt;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">${data.settings.restaurantName}</div>
          ${data.settings.address ? `<div>${data.settings.address}</div>` : ""}
          ${data.settings.phone ? `<div>Tel: ${data.settings.phone}</div>` : ""}
          <div style="margin-top: 2mm; font-size: 9pt;">
            <span>Date: ${data.date}</span>
            <span style="margin-left: 10mm;">Time: ${data.time}</span>
          </div>
          <div style="font-size: 9pt;">Receipt #: ${data.receiptNumber}</div>
        </div>

        <div class="separator"></div>

        <!-- Items Header -->
        <div class="items-header">
          <div>Item</div>
          <div class="quantity">Qty</div>
          <div class="price">Price</div>
        </div>

        <!-- Items -->
        ${data.products.map((product) => `
          <div class="item-row">
            <div>${product.name}</div>
            <div class="quantity">${product.quantity}${product.unit}</div>
            <div class="price">${data.settings.currency} ${(product.price * product.quantity).toFixed(2)}</div>
          </div>
        `).join("")}

        <div class="separator"></div>

        <!-- Total -->
        <div class="total-row">
          <span>Total</span>
          <span>${data.settings.currency} ${data.totalAmount.toFixed(2)}</span>
        </div>

        <!-- Footer -->
        <div class="footer">
          ${data.settings.receiptFooter}
        </div>
      </body>
    </html>
  `;
}
var getPuppeteerPath = async () => {
  if (import_electron_is_dev.default) {
    return await import_puppeteer.default.launch({ headless: "new" });
  }
  const executablePath = import_path2.default.join(
    process.resourcesPath,
    "app",
    "node_modules",
    "puppeteer",
    ".local-chromium",
    // You'll need to update this path based on your Puppeteer version and OS
    "win64-115.0.5790.170",
    "chrome-win",
    "chrome.exe"
  );
  return await import_puppeteer.default.launch({
    executablePath,
    headless: "new"
  });
};
function setupIPCHandlers() {
  console.log("Setting up IPC handlers");
  import_electron3.ipcMain.handle("generate-pdf", async (_, data) => {
    try {
      const browser = await getPuppeteerPath();
      const page = await browser.newPage();
      await page.setContent(generateReceiptHTML(data));
      const pdfBuffer = await page.pdf({
        width: "80mm",
        height: "297mm",
        // A4 height
        printBackground: true,
        margin: {
          top: "10mm",
          bottom: "10mm",
          left: "0mm",
          right: "0mm"
        }
      });
      await browser.close();
      const { filePath } = await import_electron3.dialog.showSaveDialog({
        defaultPath: `receipt-${data.receiptNumber}.pdf`,
        filters: [{ name: "PDF Files", extensions: ["pdf"] }]
      });
      if (filePath) {
        await import_promises.default.writeFile(filePath, pdfBuffer);
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      throw error;
    }
  });
  import_electron3.ipcMain.handle("get-printers", async () => {
    console.log("Handling get-printers request");
    try {
      const printers = await (0, import_pdf_to_printer.getPrinters)();
      console.log("Available printers:", printers);
      return printers;
    } catch (error) {
      console.error("Error getting printers:", error);
      throw error;
    }
  });
  import_electron3.ipcMain.handle("print-receipt", async (_, data, selectedPrinterId) => {
    try {
      const browser = await getPuppeteerPath();
      const page = await browser.newPage();
      await page.setContent(generateReceiptHTML(data));
      const tempPath = import_path2.default.join(import_electron3.app.getPath("temp"), `receipt-${data.receiptNumber}.pdf`);
      await page.pdf({
        path: tempPath,
        width: "80mm",
        height: "297mm",
        printBackground: true,
        margin: {
          top: "10mm",
          bottom: "10mm",
          left: "0mm",
          right: "0mm"
        }
      });
      await browser.close();
      await (0, import_pdf_to_printer.print)(tempPath, selectedPrinterId ? { printer: selectedPrinterId } : void 0);
      await import_promises.default.unlink(tempPath);
    } catch (error) {
      console.error("Printing error:", error);
      throw error;
    }
  });
}
import_electron3.app.whenReady().then(createWindow);
import_electron3.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron3.app.quit();
  }
});
import_electron3.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
//# sourceMappingURL=main.js.map

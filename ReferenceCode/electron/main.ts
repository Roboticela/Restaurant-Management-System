import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { print, getPrinters } from 'pdf-to-printer';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import isDev from 'electron-is-dev';
import { setupDatabaseHandlers } from './ipcHandlers';

interface ReceiptData {
    products: {
      name: string;
      quantity: number;
      unit: string;
      price: number;
    }[];
    totalAmount: number;
    date: string;
    time: string;
    settings: {
      restaurantName: string;
      address: string;
      phone: string;
      currency: string;
      receiptFooter: string;
    };
    receiptNumber: string;
  }

let mainWindow: BrowserWindow | null = null;

// Update the path resolution for production
const preloadPath = isDev
  ? path.join(__dirname, 'preload.js')
  : path.join(__dirname, 'preload.js');

function createWindow() {
  console.log('Creating main window');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Restaurant Management System',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      sandbox: false,
    },
    icon: path.join(__dirname, '../assets/icon.ico'),
    autoHideMenuBar: true,
    frame: true,
  });

  // Add this for debugging in production
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  if (isDev) {
    console.log('Loading dev URL');
    mainWindow.loadURL('http://localhost:3000');
  } else {
    console.log('Loading production file');
    // Update the production path
    const indexPath = path.join(__dirname, '..', '.next/server/pages/index.html');
    console.log('Trying to load:', indexPath);
    
    // Check if the file exists
    try {
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
      } else {
        console.error('Index file not found at:', indexPath);
        // Try alternative path
        const altPath = path.join(__dirname, '..', '.next/static/index.html');
        if (fs.existsSync(altPath)) {
          mainWindow.loadFile(altPath);
        } else {
          console.error('No index file found in alternative location either');
        }
      }
    } catch (error) {
      console.error('Error loading index file:', error);
    }
  }

  setupDatabaseHandlers();
  setupIPCHandlers();
}

// Helper function to generate HTML for the receipt
function generateReceiptHTML(data: ReceiptData) {
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
          ${data.settings.address ? `<div>${data.settings.address}</div>` : ''}
          ${data.settings.phone ? `<div>Tel: ${data.settings.phone}</div>` : ''}
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
        ${data.products.map(product => `
          <div class="item-row">
            <div>${product.name}</div>
            <div class="quantity">${product.quantity}${product.unit}</div>
            <div class="price">${data.settings.currency} ${(product.price * product.quantity).toFixed(2)}</div>
          </div>
        `).join('')}

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

// Update the getPuppeteerPath function
const getPuppeteerPath = async () => {
  if (isDev) {
    return await puppeteer.launch({ headless: 'new' });
  }
  // In production, use the bundled Chromium
  const executablePath = path.join(
    process.resourcesPath,
    'app',
    'node_modules',
    'puppeteer',
    '.local-chromium',
    // You'll need to update this path based on your Puppeteer version and OS
    'win64-115.0.5790.170',
    'chrome-win',
    'chrome.exe'
  );
  
  return await puppeteer.launch({
    executablePath,
    headless: 'new'
  });
};

// Set up IPC handlers
function setupIPCHandlers() {
  // Add debug logging for handler setup
  console.log('Setting up IPC handlers');

  // Handle PDF generation
  ipcMain.handle('generate-pdf', async (_, data: ReceiptData) => {
    try {
      const browser = await getPuppeteerPath();
      const page = await browser.newPage();
      
      // Set content and generate PDF
      await page.setContent(generateReceiptHTML(data));
      const pdfBuffer = await page.pdf({
        width: '80mm',
        height: '297mm', // A4 height
        printBackground: true,
        margin: {
          top: '10mm',
          bottom: '10mm',
          left: '0mm',
          right: '0mm'
        }
      });

      await browser.close();

      // Show save dialog
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: `receipt-${data.receiptNumber}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (filePath) {
        await fs.writeFile(filePath, pdfBuffer);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  });

  // Add handler to get available printers
  ipcMain.handle('get-printers', async () => {
    console.log('Handling get-printers request');
    try {
      const printers = await getPrinters();
      console.log('Available printers:', printers);
      return printers;
    } catch (error) {
      console.error('Error getting printers:', error);
      throw error;
    }
  });

  // Update the print-receipt handler
  ipcMain.handle('print-receipt', async (_, data: ReceiptData, selectedPrinterId?: string) => {
    try {
      const browser = await getPuppeteerPath();
      const page = await browser.newPage();
      
      await page.setContent(generateReceiptHTML(data));
      const tempPath = path.join(app.getPath('temp'), `receipt-${data.receiptNumber}.pdf`);
      
      await page.pdf({
        path: tempPath,
        width: '80mm',
        height: '297mm',
        printBackground: true,
        margin: {
          top: '10mm',
          bottom: '10mm',
          left: '0mm',
          right: '0mm'
        }
      });

      await browser.close();

      // Print with selected printer using deviceId
      await print(tempPath, selectedPrinterId ? { printer: selectedPrinterId } : undefined);

      await fs.unlink(tempPath);
    } catch (error) {
      console.error('Printing error:', error);
      throw error;
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 
import { contextBridge, ipcRenderer } from 'electron';

// Define the type for clarity
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

interface Printer {
  deviceId: string;
  name: string;
  paperSizes: string[];
}

console.log('Preload script starting...');

const electronBridge = {
  printReceipt: async (data: ReceiptData, selectedPrinter?: string) => {
    console.log('Calling printReceipt from preload', { data, selectedPrinter });
    return await ipcRenderer.invoke('print-receipt', data, selectedPrinter);
  },
  generatePDF: async (data: ReceiptData) => {
    console.log('Calling generatePDF from preload', { data });
    return await ipcRenderer.invoke('generate-pdf', data);
  },
  getPrinters: async (): Promise<Printer[]> => {
    console.log('Calling getPrinters from preload');
    try {
      const printers = await ipcRenderer.invoke('get-printers');
      console.log('Received printers:', printers);
      return printers;
    } catch (error) {
      console.error('Error getting printers:', error);
      throw error;
    }
  }
};

try {
  console.log('Exposing electron bridge with methods:', Object.keys(electronBridge));
  contextBridge.exposeInMainWorld('electron', electronBridge);
  console.log('Electron bridge exposed successfully');
} catch (error) {
  console.error('Failed to expose electron bridge:', error);
} 
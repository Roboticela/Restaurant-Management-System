interface Printer {
  deviceId: string;
  name: string;
  paperSizes: string[];
}

interface Window {
  electron: {
    printReceipt: (data: ReceiptData, selectedPrinter?: string) => Promise<void>;
    generatePDF: (data: ReceiptData) => Promise<void>;
    getPrinters: () => Promise<Printer[]>;
  };
  electronAPI: {
    getSettings: () => Promise<any>;
    saveSettings: (settings: any) => Promise<boolean>;
    getProducts: () => Promise<any[]>;
    addProduct: (product: any) => Promise<number>;
  }
}

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

// Add this to ensure TypeScript recognizes the electron property
declare interface Window {
  electron: {
    printReceipt: (data: ReceiptData, selectedPrinter?: string) => Promise<void>;
    generatePDF: (data: ReceiptData) => Promise<void>;
    getPrinters: () => Promise<Printer[]>;
  };
} 
"use strict";

// electron/preload.ts
var import_electron = require("electron");
console.log("Preload script starting...");
var electronBridge = {
  printReceipt: async (data, selectedPrinter) => {
    console.log("Calling printReceipt from preload", { data, selectedPrinter });
    return await import_electron.ipcRenderer.invoke("print-receipt", data, selectedPrinter);
  },
  generatePDF: async (data) => {
    console.log("Calling generatePDF from preload", { data });
    return await import_electron.ipcRenderer.invoke("generate-pdf", data);
  },
  getPrinters: async () => {
    console.log("Calling getPrinters from preload");
    try {
      const printers = await import_electron.ipcRenderer.invoke("get-printers");
      console.log("Received printers:", printers);
      return printers;
    } catch (error) {
      console.error("Error getting printers:", error);
      throw error;
    }
  }
};
try {
  console.log("Exposing electron bridge with methods:", Object.keys(electronBridge));
  import_electron.contextBridge.exposeInMainWorld("electron", electronBridge);
  console.log("Electron bridge exposed successfully");
} catch (error) {
  console.error("Failed to expose electron bridge:", error);
}
//# sourceMappingURL=preload.js.map

declare module 'pdf-to-printer' {
  interface PrintOptions {
    printer?: string;
    pages?: string;
    copies?: number;
  }

  export function print(pdf: string, options?: PrintOptions): Promise<void>;
  export function getPrinters(): Promise<string[]>;
} 
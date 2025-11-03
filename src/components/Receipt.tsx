import { forwardRef } from 'react';
import { Settings } from '../types';

interface ReceiptProps {
  products: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }[];
  totalAmount: number;
  date: string;
  time: string;
  settings: Settings;
  receiptNumber: string;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ products, totalAmount, date, time, settings, receiptNumber }, ref) => {
    return (
      <div ref={ref} className="receipt-container">
        <div className="receipt-content bg-white text-black p-6 max-w-sm mx-auto rounded-lg">
          {/* Header */}
          <div className="text-center mb-4">
            {settings.logo && (
              <img 
                src={settings.logo} 
                alt="Logo" 
                className="mx-auto mb-2 max-w-[100px] max-h-[100px] object-contain"
              />
            )}
            <h2 className="text-xl font-bold mb-1">
              {settings.restaurant_name || 'Restaurant Management System'}
            </h2>
            {settings.address && (
              <p className="text-xs text-gray-600">{settings.address}</p>
            )}
            {settings.phone && (
              <p className="text-xs text-gray-600">Tel: {settings.phone}</p>
            )}
            <div className="text-xs text-gray-600 mt-2">
              <span>Date: {date}</span>
              <span className="ml-4">Time: {time}</span>
            </div>
            <p className="text-xs text-gray-600">Receipt #: {receiptNumber}</p>
          </div>

          {/* Separator */}
          <div className="border-t-2 border-dashed border-gray-400 my-3" />

          {/* Items Header */}
          <div className="grid grid-cols-3 text-xs font-bold mb-2">
            <div>Item</div>
            <div className="text-center">Qty</div>
            <div className="text-right">Price</div>
          </div>

          {/* Items */}
          <div className="space-y-1 mb-3">
            {products.map((product, index) => (
              <div key={index} className="grid grid-cols-3 text-xs">
                <div className="truncate">{product.name}</div>
                <div className="text-center">
                  {product.quantity} {product.unit}
                </div>
                <div className="text-right">
                  {settings.currency} {product.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t-2 border-dashed border-gray-400 my-3" />

          {/* Total */}
          <div className="flex justify-between items-center font-bold text-base mb-4">
            <span>Total</span>
            <span>{settings.currency} {totalAmount.toFixed(2)}</span>
          </div>

          {/* Footer */}
          {settings.receipt_footer && (
            <>
              <div className="border-t-2 border-dashed border-gray-400 my-3" />
              <div className="text-center text-xs text-gray-600">
                {settings.receipt_footer}
              </div>
            </>
          )}
        </div>

        {/* Print styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .receipt-container,
            .receipt-container * {
              visibility: visible;
            }
            .receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
            }
            .receipt-content {
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: 80mm !important;
              margin: 0 !important;
              padding: 10mm !important;
            }
          }
        `}} />
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';

export default Receipt;


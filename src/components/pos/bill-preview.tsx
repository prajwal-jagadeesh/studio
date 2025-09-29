
import React, { useState, useEffect } from "react";
import type { Order } from "@/lib/data";

interface BillPreviewProps {
  order: Order;
}

const RESTAURANT_NAME_KEY = "restaurant-name-setting";
const BILL_FOOTER_KEY = "bill-footer-setting";
const DEFAULT_RESTAURANT_NAME = "Nikee's Zara Veg Rooftop";
const DEFAULT_BILL_FOOTER = "Thank you for visiting!";

export const BillPreview = React.forwardRef<HTMLDivElement, BillPreviewProps>(
  ({ order }, ref) => {
    const [restaurantName, setRestaurantName] = useState(DEFAULT_RESTAURANT_NAME);
    const [billFooter, setBillFooter] = useState(DEFAULT_BILL_FOOTER);
    
    useEffect(() => {
      setRestaurantName(localStorage.getItem(RESTAURANT_NAME_KEY) || DEFAULT_RESTAURANT_NAME);
      setBillFooter(localStorage.getItem(BILL_FOOTER_KEY) || DEFAULT_BILL_FOOTER);
    }, []);

    const subtotal = order.items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const gst = subtotal * 0.05; 
    const total = subtotal + gst;

    return (
      <div ref={ref} className="p-4 font-code text-sm text-black bg-white">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold font-headline">{restaurantName}</h2>
          <p className="text-xs">Tax Invoice</p>
        </div>
        <div className="flex justify-between text-xs mb-2">
            <span>Order: {order.id}</span>
            <span>Table: {order.tableName}</span>
        </div>
        <div className="text-xs mb-2">
            Date: {new Date().toLocaleString()}
        </div>
        <hr className="my-2 border-dashed border-black" />
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dashed border-black">
              <th className="text-left pb-1">ITEM</th>
              <th className="text-center pb-1">QTY</th>
              <th className="text-right pb-1">PRICE</th>
              <th className="text-right pb-1">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.menuId}>
                <td className="pt-1">{item.name}</td>
                <td className="text-center pt-1">{item.qty}</td>
                <td className="text-right pt-1">{item.price.toFixed(2)}</td>
                <td className="text-right pt-1">{(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-2 border-dashed border-black" />
        <div className="space-y-1 text-xs">
            <div className="flex justify-between">
                <span className="font-semibold">Subtotal:</span>
                <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-semibold">GST (5%):</span>
                <span>{gst.toFixed(2)}</span>
            </div>
        </div>
        <hr className="my-2 border-dashed border-black" />
        <div className="flex justify-between items-center font-bold text-base">
            <span>TOTAL:</span>
            <span>₹{total.toFixed(2)}</span>
        </div>
         <hr className="my-2 border-dashed border-black" />
        <div className="text-center mt-4 text-xs">
            <p>{billFooter}</p>
        </div>
      </div>
    );
  }
);

BillPreview.displayName = "BillPreview";

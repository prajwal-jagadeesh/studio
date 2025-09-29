
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
          <h2 className="text-xl font-bold font-headline">{restaurantName}</h2>
          <p>Tax Invoice</p>
        </div>
        <p>Order: {order.id}</p>
        <p>Table: {order.tableName}</p>
        <p>Date: {new Date().toLocaleString()}</p>
        <hr className="my-2 border-dashed border-black" />
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">ITEM</th>
              <th className="text-center">QTY</th>
              <th className="text-right">PRICE</th>
              <th className="text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.menuId}>
                <td>{item.name}</td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">{item.price.toFixed(2)}</td>
                <td className="text-right">{(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-2 border-dashed border-black" />
        <table className="w-full">
            <tbody>
                <tr>
                    <td className="text-right">Subtotal:</td>
                    <td className="text-right">{subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td className="text-right">GST (5%):</td>
                    <td className="text-right">{gst.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        <hr className="my-2 border-dashed border-black" />
        <div className="text-right font-bold text-lg">
            <p>TOTAL: ₹{total.toFixed(2)}</p>
        </div>
        <div className="text-center mt-4">
            <p>{billFooter}</p>
        </div>
      </div>
    );
  }
);

BillPreview.displayName = "BillPreview";

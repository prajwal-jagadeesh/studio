
import React, { useState, useEffect } from "react";
import type { Order } from "@/lib/data";

interface KOTPreviewProps {
  order: Order;
}

const KOT_NOTES_KEY = "kot-notes-setting";
const DEFAULT_KOT_NOTES = "";

export const KOTPreview = React.forwardRef<HTMLDivElement, KOTPreviewProps>(
  ({ order }, ref) => {
    const [kotNotes, setKotNotes] = useState(DEFAULT_KOT_NOTES);

    useEffect(() => {
        setKotNotes(localStorage.getItem(KOT_NOTES_KEY) || DEFAULT_KOT_NOTES);
    }, []);

    return (
      <div ref={ref} className="p-4 font-code text-black bg-white text-sm">
        <div className="text-center">
          <h2 className="text-lg font-bold">KITCHEN ORDER TICKET</h2>
        </div>
        <hr className="my-2 border-dashed border-black" />
        <div className="flex justify-between font-semibold">
          <span>Order: {order.id}</span>
          <span>Table: {order.tableName}</span>
        </div>
        <div className="text-xs">
            {new Date().toLocaleString()}
        </div>
        <hr className="my-2 border-dashed border-black" />
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left font-bold">QTY</th>
              <th className="text-left font-bold">ITEM</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.menuId} className="border-b border-dashed border-gray-400">
                <td className="align-top py-1 font-semibold pr-2">{item.qty}x</td>
                <td className="py-1">{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {kotNotes && (
            <>
                <hr className="my-2 border-dashed border-black" />
                <div className="mt-2">
                    <p className="font-bold">Notes:</p>
                    <p className="text-xs">{kotNotes}</p>
                </div>
            </>
        )}
        <hr className="my-2 border-dashed border-black" />
      </div>
    );
  }
);

KOTPreview.displayName = "KOTPreview";

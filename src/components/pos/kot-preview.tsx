import React from "react";
import type { Order } from "@/lib/data";

interface KOTPreviewProps {
  order: Order;
}

export const KOTPreview = React.forwardRef<HTMLDivElement, KOTPreviewProps>(
  ({ order }, ref) => {
    return (
      <div ref={ref} className="p-4 font-code text-black bg-white">
        <div className="text-center">
          <h2 className="text-lg font-bold">KOT</h2>
          <p>Order: {order.id}</p>
          <p>Table: {order.tableName}</p>
          <p>Date: {new Date().toLocaleString()}</p>
        </div>
        <hr className="my-2 border-dashed border-black" />
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">QTY</th>
              <th className="text-left">ITEM</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.menuId}>
                <td className="align-top">{item.qty}</td>
                <td>{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-2 border-dashed border-black" />
      </div>
    );
  }
);

KOTPreview.displayName = "KOTPreview";

import { PlaceHolderImages } from "@/lib/placeholder-images";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Starters" | "Main Course" | "Breads" | "Desserts" | "Beverages";
  imageUrl: string;
  imageHint: string;
  available: boolean;
};

export type OrderItem = {
  menuId: string;
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "billed" | "closed" | "cancelled";
  createdAt: Date;
};

export type Table = {
  id: string;
  name: string;
  status: "available" | "occupied" | "billing";
  currentOrderId: string | null;
};

export type AnalyticsData = {
  date: string;
  totalOrders: number;
  revenue: number;
};

const findImage = (id: string) => {
    const image = PlaceHolderImages.find(img => img.id === id);
    if (!image) return { imageUrl: 'https://picsum.photos/seed/default/600/400', imageHint: 'food' };
    return { imageUrl: image.imageUrl, imageHint: image.imageHint };
}

export const menuItems: MenuItem[] = [
    {
      id: "1",
      name: "Paneer Tikka",
      description: "Creamy chunks of paneer marinated in spices and grilled in a tandoor.",
      price: 250,
      category: "Starters",
      ...findImage("paneer_tikka"),
      available: true,
    },
    {
      id: "2",
      name: "Veg Seekh Kebab",
      description: "Minced vegetables blended with spices, skewered and cooked.",
      price: 220,
      category: "Starters",
      ...findImage("veg_kebab"),
      available: true,
    },
    {
      id: "3",
      name: "Shahi Paneer",
      description: "Paneer cooked in a rich, creamy tomato-based gravy.",
      price: 350,
      category: "Main Course",
      ...findImage("shahi_paneer"),
      available: true,
    },
    {
      id: "4",
      name: "Dal Makhani",
      description: "Black lentils and kidney beans cooked in a buttery, creamy gravy.",
      price: 300,
      category: "Main Course",
      ...findImage("dal_makhani"),
      available: true,
    },
    {
      id: "5",
      name: "Veg Biryani",
      description: "Aromatic rice dish with mixed vegetables and fragrant spices.",
      price: 280,
      category: "Main Course",
      ...findImage("veg_biryani"),
      available: true,
    },
    {
      id: "6",
      name: "Butter Naan",
      description: "Soft, fluffy flatbread with a generous layer of butter.",
      price: 60,
      category: "Breads",
      ...findImage("naan"),
      available: true,
    },
    {
      id: "7",
      name: "Garlic Naan",
      description: "Flatbread flavored with garlic and herbs.",
      price: 70,
      category: "Breads",
      ...findImage("naan"),
      available: true,
    },
    {
      id: "8",
      name: "Gulab Jamun",
      description: "Soft, spongy balls made of milk solids, soaked in sweet syrup.",
      price: 120,
      category: "Desserts",
      ...findImage("gulab_jamun"),
      available: true,
    },
    {
      id: "9",
      name: "Ras Malai",
      description: "Chenna discs soaked in thickened, sweetened milk.",
      price: 150,
      category: "Desserts",
      ...findImage("ras_malai"),
      available: true,
    },
    {
      id: "10",
      name: "Fresh Lime Soda",
      description: "A refreshing drink with lemon juice, soda, and a hint of spice.",
      price: 90,
      category: "Beverages",
      ...findImage("lime_soda"),
      available: true,
    }
  ];

export let tables: Table[] = [
  { id: "T1", name: "Table 1", status: "available", currentOrderId: null },
  { id: "T2", name: "Table 2", status: "available", currentOrderId: null },
  { id: "T3", name: "Table 3", status: "available", currentOrderId: null },
  { id: "T4", name: "Table 4", status: "available", currentOrderId: null },
  { id: "T5", name: "Table 5", status: "available", currentOrderId: null },
  { id: "T6", name: "Table 6", status: "available", currentOrderId: null },
];

export let orders: Order[] = [];

export const analyticsData: AnalyticsData[] = [
    { date: "2023-10-01", totalOrders: 15, revenue: 12500 },
    { date: "2023-10-02", totalOrders: 20, revenue: 17000 },
    { date: "2023-10-03", totalOrders: 18, revenue: 15500 },
    { date: "2023-10-04", totalOrders: 25, revenue: 21000 },
    { date: "2023-10-05", totalOrders: 22, revenue: 19000 },
    { date: "2023-10-06", totalOrders: 30, revenue: 25500 },
    { date: "2023-10-07", totalOrders: 28, revenue: 23000 },
]

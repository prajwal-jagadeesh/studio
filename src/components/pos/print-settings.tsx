
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const PRINT_WIDTH_KEY = "print-width-setting";
const RESTAURANT_NAME_KEY = "restaurant-name-setting";
const BILL_FOOTER_KEY = "bill-footer-setting";
const KOT_NOTES_KEY = "kot-notes-setting";

const DEFAULT_PRINT_WIDTH = "80mm";
const DEFAULT_RESTAURANT_NAME = "Nikee's Zara Veg Rooftop";
const DEFAULT_BILL_FOOTER = "Thank you for visiting!";
const DEFAULT_KOT_NOTES = "";


export function PrintSettings() {
  const [printWidth, setPrintWidth] = useState(DEFAULT_PRINT_WIDTH);
  const [restaurantName, setRestaurantName] = useState(DEFAULT_RESTAURANT_NAME);
  const [billFooter, setBillFooter] = useState(DEFAULT_BILL_FOOTER);
  const [kotNotes, setKotNotes] = useState(DEFAULT_KOT_NOTES);

  const { toast } = useToast();

  useEffect(() => {
    const savedWidth = localStorage.getItem(PRINT_WIDTH_KEY) || DEFAULT_PRINT_WIDTH;
    const savedName = localStorage.getItem(RESTAURANT_NAME_KEY) || DEFAULT_RESTAURANT_NAME;
    const savedFooter = localStorage.getItem(BILL_FOOTER_KEY) || DEFAULT_BILL_FOOTER;
    const savedKotNotes = localStorage.getItem(KOT_NOTES_KEY) || DEFAULT_KOT_NOTES;
    
    setPrintWidth(savedWidth);
    setRestaurantName(savedName);
    setBillFooter(savedFooter);
    setKotNotes(savedKotNotes);

    // Set the CSS variable on initial load
    document.documentElement.style.setProperty('--print-width', savedWidth);
  }, []);

  const handleSave = () => {
    localStorage.setItem(PRINT_WIDTH_KEY, printWidth);
    localStorage.setItem(RESTAURANT_NAME_KEY, restaurantName);
    localStorage.setItem(BILL_FOOTER_KEY, billFooter);
    localStorage.setItem(KOT_NOTES_KEY, kotNotes);

    document.documentElement.style.setProperty('--print-width', printWidth);
    toast({
      title: "Settings Saved",
      description: "Print and receipt settings have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Print & Receipt Settings</CardTitle>
        <CardDescription>
          Configure the paper size and customize the content of your printed bills and KOTs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="print-width">Printer Paper Width</Label>
          <Select value={printWidth} onValueChange={setPrintWidth}>
            <SelectTrigger id="print-width" className="w-[280px]">
              <SelectValue placeholder="Select paper width" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="58mm">58mm (Small Thermal Printer)</SelectItem>
              <SelectItem value="80mm">80mm (TVS RP 3230 / Standard Thermal)</SelectItem>
              <SelectItem value="100%">A4/Full Width</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Default is 80mm for TVS RP 3230 and similar thermal printers.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="restaurant-name">Restaurant Name</Label>
          <Input
            id="restaurant-name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Your Restaurant Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bill-footer">Bill Footer Message</Label>
          <Textarea
            id="bill-footer"
            value={billFooter}
            onChange={(e) => setBillFooter(e.target.value)}
            placeholder="e.g., Thank you for dining with us!"
          />
        </div>
         <div className="space-y-2">
          <Label htmlFor="kot-notes">KOT Notes</Label>
          <Textarea
            id="kot-notes"
            value={kotNotes}
            onChange={(e) => setKotNotes(e.target.value)}
            placeholder="e.g., Please specify spice level."
          />
        </div>
        <div>
          <Button onClick={handleSave}>Save Print Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
}

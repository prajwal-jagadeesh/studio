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

const PRINT_WIDTH_KEY = "print-width-setting";
const DEFAULT_PRINT_WIDTH = "80mm";

export function PrintSettings() {
  const [printWidth, setPrintWidth] = useState(DEFAULT_PRINT_WIDTH);
  const { toast } = useToast();

  useEffect(() => {
    const savedWidth = localStorage.getItem(PRINT_WIDTH_KEY);
    if (savedWidth) {
      setPrintWidth(savedWidth);
    }
    // Set the CSS variable on initial load
    document.documentElement.style.setProperty('--print-width', savedWidth || DEFAULT_PRINT_WIDTH);
  }, []);

  const handleSave = () => {
    localStorage.setItem(PRINT_WIDTH_KEY, printWidth);
    document.documentElement.style.setProperty('--print-width', printWidth);
    toast({
      title: "Settings Saved",
      description: "Print width has been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Print Settings</CardTitle>
        <CardDescription>
          Configure the paper size for printing KOTs and bills.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button onClick={handleSave}>Save Settings</Button>
      </CardContent>
    </Card>
  );
}

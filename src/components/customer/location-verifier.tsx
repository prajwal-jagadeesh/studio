"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export function LocationVerifier() {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AlertDialog open={isVerifying}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center gap-4 font-headline text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Verifying Your Location
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2">
            To ensure the best experience, we're just making sure you're at
            Nikee's Zara Veg Rooftop. Please wait a moment.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

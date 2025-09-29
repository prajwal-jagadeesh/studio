
"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Loader2, MapPin, XCircle } from "lucide-react";
import { Button } from "../ui/button";

const VERIFICATION_STATUS = {
  VERIFYING: 'VERIFYING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ERROR: 'ERROR',
};

// Haversine formula to calculate distance between two lat/lng points
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}


export function LocationVerifier() {
  const [status, setStatus] = useState(VERIFICATION_STATUS.VERIFYING);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    const verifyLocation = async () => {
      try {
        // 1. Fetch restaurant coordinates from the server
        const settingsRes = await fetch('/api/settings');
        if (!settingsRes.ok) {
            // If settings aren't set, we can't verify. Default to success for now.
             setStatus(VERIFICATION_STATUS.SUCCESS);
             setTimeout(() => setIsDialogOpen(false), 1000);
             return;
        }
        const settings = await settingsRes.json();
        const { latitude: restaurantLat, longitude: restaurantLng } = settings;

        if (!restaurantLat || !restaurantLng) {
            // If coordinates are not set, we can't verify.
            setStatus(VERIFICATION_STATUS.SUCCESS); // Bypass verification
            setTimeout(() => setIsDialogOpen(false), 1000);
            return;
        }

        // 2. Get user's location
        if (!navigator.geolocation) {
          setStatus(VERIFICATION_STATUS.ERROR);
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude: userLat, longitude: userLng } = position.coords;

            // 3. Compare locations
            const distance = getDistanceInMeters(userLat, userLng, restaurantLat, restaurantLng);

            if (distance < 200) { // 200 meters radius
              setStatus(VERIFICATION_STATUS.SUCCESS);
              setTimeout(() => setIsDialogOpen(false), 1500); // Close dialog after a short delay
            } else {
              setStatus(VERIFICATION_STATUS.FAILURE);
            }
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setStatus(VERIFICATION_STATUS.PERMISSION_DENIED);
            } else {
              setStatus(VERIFICATION_STATUS.ERROR);
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

      } catch (error) {
        // In case of any other error (e.g., API fetch fails), bypass verification for now
        setStatus(VERIFICATION_STATUS.SUCCESS);
        setTimeout(() => setIsDialogOpen(false), 1000);
      }
    };

    verifyLocation();
  }, []);

  let title, description, icon;

  switch (status) {
    case VERIFICATION_STATUS.VERIFYING:
      title = "Verifying Your Location...";
      description = "We're just making sure you're at the restaurant before you can order.";
      icon = <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      break;
    case VERIFICATION_STATUS.SUCCESS:
      title = "Location Verified!";
      description = "You're all set. Welcome!";
      icon = <MapPin className="h-8 w-8 text-green-500" />;
      break;
    case VERIFICATION_STATUS.FAILURE:
      title = "You're Too Far Away";
      description = "You must be at Nikee's Zara Veg Rooftop to place an order. Please visit us to enjoy our delicious food!";
      icon = <XCircle className="h-8 w-8 text-destructive" />;
      break;
    case VERIFICATION_STATUS.PERMISSION_DENIED:
      title = "Location Access Denied";
      description = "Please enable location services in your browser settings to continue. We need it to confirm you're at the restaurant.";
      icon = <XCircle className="h-8 w-8 text-destructive" />;
      break;
    case VERIFICATION_STATUS.ERROR:
    default:
      title = "Could Not Verify Location";
      description = "There was an error checking your location. Please ensure location services are enabled and try again.";
      icon = <XCircle className="h-8 w-8 text-destructive" />;
      break;
  }

  return (
    <AlertDialog open={isDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center text-center">
          <div className="mb-4">
            {icon}
          </div>
          <AlertDialogTitle className="font-headline text-2xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
         {status === VERIFICATION_STATUS.PERMISSION_DENIED && (
            <Button onClick={() => window.location.reload()}>Retry</Button>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

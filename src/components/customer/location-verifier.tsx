
"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Loader2, MapPin, XCircle, AlertTriangle, QrCode } from "lucide-react";
import { Button } from "../ui/button";
import { useSearchParams } from 'next/navigation'

const VERIFICATION_STATUS = {
  VERIFYING: 'VERIFYING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ERROR: 'ERROR',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
};

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

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
  const searchParams = useSearchParams();

  useEffect(() => {
    const tableId = searchParams.get('tableId');
    const sessionKey = `table_${tableId}_session`;
    const orderPlacedKey = `order_placed_${tableId}`;

    const verifySessionAndLocation = async () => {
      try {
        const sessionData = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
        const isOrderPlaced = sessionStorage.getItem(orderPlacedKey) === 'true';
        
        const isSessionValid = () => {
            if (isOrderPlaced) return true; // Session persists if an order was placed
            if (!sessionData || !sessionData.timestamp) return false;
            return (new Date().getTime() - sessionData.timestamp) < SESSION_TIMEOUT_MS;
        }

        if (tableId && isSessionValid()) {
            // Session is valid, proceed directly to location check
            console.log("Valid session found. Verifying location.");
        } else {
            // New scan or expired session
            if(sessionData) {
                console.log("Session expired or invalid. Re-verification needed.");
                setStatus(VERIFICATION_STATUS.SESSION_EXPIRED);
                // Don't return, let it fall through to re-verify and create a new session.
            }

            if (tableId) {
                const newSession = {
                    token: crypto.randomUUID(),
                    timestamp: new Date().getTime()
                };
                sessionStorage.setItem(sessionKey, JSON.stringify(newSession));
                sessionStorage.removeItem(orderPlacedKey); // Clear old order flag
                console.log("New session created for table:", tableId);
            }
        }
        
        // --- Location Verification Logic ---
        const settingsRes = await fetch('/api/settings');
        if (!settingsRes.ok) {
          setStatus(VERIFICATION_STATUS.NOT_CONFIGURED);
          return;
        }
        const settings = await settingsRes.json();
        const { latitude: restaurantLat, longitude: restaurantLng } = settings;

        if (!restaurantLat || !restaurantLng) {
          setStatus(VERIFICATION_STATUS.NOT_CONFIGURED);
          return;
        }

        if (!navigator.geolocation) {
          setStatus(VERIFICATION_STATUS.ERROR);
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude: userLat, longitude: userLng } = position.coords;
            const distance = getDistanceInMeters(userLat, userLng, restaurantLat, restaurantLng);

            if (distance < 200) { // 200 meters radius
              setStatus(VERIFICATION_STATUS.SUCCESS);
              setTimeout(() => setIsDialogOpen(false), 1500);
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
        setStatus(VERIFICATION_STATUS.ERROR);
      }
    };

    verifySessionAndLocation();
  }, [searchParams]);

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
    case VERIFICATION_STATUS.NOT_CONFIGURED:
      title = "Location Verification Not Set Up";
      description = "The restaurant location has not been configured in the POS settings. Ordering is disabled until this is resolved.";
      icon = <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      break;
    case VERIFICATION_STATUS.SESSION_EXPIRED:
      title = "Session Expired";
      description = "Your session has timed out. Please scan the QR code again to start a new order.";
      icon = <QrCode className="h-8 w-8 text-destructive" />;
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
         {(status === VERIFICATION_STATUS.PERMISSION_DENIED || status === VERIFICATION_STATUS.SESSION_EXPIRED) && (
            <Button onClick={() => window.location.reload()}>Re-scan / Retry</Button>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

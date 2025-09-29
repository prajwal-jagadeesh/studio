
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";

const locationSchema = z.object({
  latitude: z.coerce.number({ invalid_type_error: 'Must be a number' }).min(-90).max(90),
  longitude: z.coerce.number({ invalid_type_error: 'Must be a number' }).min(-180).max(180),
});

type LocationFormValues = z.infer<typeof locationSchema>;

export function LocationSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      latitude: '' as any,
      longitude: '' as any,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.latitude && data.longitude) {
            form.reset({
                latitude: data.latitude,
                longitude: data.longitude,
            });
          }
        }
      } catch (error) {
        // Ignore fetch errors on load
      }
    };
    fetchSettings();
  }, [form]);

  const handleGetCurrentLocation = () => {
    setIsFetchingLocation(true);
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
      });
      setIsFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.reset({ latitude, longitude });
        toast({
          title: "Location Found!",
          description: "Coordinates have been filled in.",
        });
        setIsFetchingLocation(false);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Could Not Get Location",
          description: error.message || "Please ensure location services are enabled.",
        });
        setIsFetchingLocation(false);
      }
    );
  };


  const onSubmit = async (data: LocationFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings.');
      }
      
      toast({
        title: "Success",
        description: "Location coordinates have been saved.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Could not save settings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Settings</CardTitle>
        <CardDescription>
          Set the restaurant's GPS coordinates to verify customer location for ordering. You can enter them manually or use the button to get your current location.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 26.8500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 80.9500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Coordinates
                </Button>
                <Button type="button" variant="outline" onClick={handleGetCurrentLocation} disabled={isFetchingLocation}>
                    {isFetchingLocation ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <MapPin className="mr-2 h-4 w-4" />
                    )}
                    Use Current Location
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

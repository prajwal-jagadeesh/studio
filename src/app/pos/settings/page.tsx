
import { PrintSettings } from "@/components/pos/print-settings";
import { LocationSettings } from "@/components/pos/location-settings";

export default function SettingsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage restaurant, printer, and receipt customization settings.
        </p>
      </header>
      <div className="space-y-6">
        <LocationSettings />
        <PrintSettings />
      </div>
    </div>
  );
}

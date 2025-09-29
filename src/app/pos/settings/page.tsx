import { PrintSettings } from "@/components/pos/print-settings";

export default function SettingsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage application settings.
        </p>
      </header>
      <PrintSettings />
    </div>
  );
}

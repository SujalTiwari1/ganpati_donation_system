import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/providers/theme-provider";
import { SETTINGS_STORAGE_KEY } from "@/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — Vargani CMS" },
      { name: "description", content: "Customize your dashboard appearance and preferences." },
      { property: "og:title", content: "Settings — Vargani CMS" },
    ],
  }),
  component: SettingsPage,
});

interface AppSettings {
  defaultYear: number;
  pageSize: number;
  showVolunteerName: boolean;
  enableWhatsAppPreview: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultYear: new Date().getFullYear(),
  pageSize: 20,
  showVolunteerName: true,
  enableWhatsAppPreview: true,
};

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings) {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function SettingsPage() {
  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  const update = (updates: Partial<AppSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    saveSettings(next);
  };

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Customize your dashboard and preferences." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <Card className="card-elevated rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setTheme(opt.value === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : opt.value)
                    }
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border px-3 py-4 text-sm transition-colors",
                      theme === opt.value
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-input text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    <opt.icon className="size-5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Preferences */}
        <Card className="card-elevated rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Donation Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Default Year</Label>
                <p className="text-xs text-muted-foreground">
                  Pre-filled when recording a new donation
                </p>
              </div>
              <Select
                value={String(settings.defaultYear)}
                onValueChange={(value) => update({ defaultYear: Number(value) })}
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Table Page Size</Label>
                <p className="text-xs text-muted-foreground">
                  Rows shown per page in tables
                </p>
              </div>
              <Select
                value={String(settings.pageSize)}
                onValueChange={(value) => update({ pageSize: Number(value) })}
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Preferences */}
        <Card className="card-elevated rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Receipt Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show volunteer name on receipts</Label>
                <p className="text-xs text-muted-foreground">
                  Display the collector's name on the receipt preview
                </p>
              </div>
              <Switch
                checked={settings.showVolunteerName}
                onCheckedChange={(checked) => update({ showVolunteerName: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable WhatsApp preview</Label>
                <p className="text-xs text-muted-foreground">
                  Show WhatsApp delivery status badges
                </p>
              </div>
              <Switch
                checked={settings.enableWhatsAppPreview}
                onCheckedChange={(checked) => update({ enableWhatsAppPreview: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="card-elevated rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              <div className="flex justify-between py-3">
                <dt className="text-sm text-muted-foreground">Application</dt>
                <dd className="text-sm font-medium text-foreground">Vargani CMS</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-sm text-muted-foreground">Version</dt>
                <dd className="text-sm font-medium text-foreground">1.0.0</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-sm text-muted-foreground">Backend</dt>
                <dd className="text-sm font-medium text-foreground">Connected</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          className="active:scale-95"
          onClick={() => {
            setSettings(DEFAULT_SETTINGS);
            saveSettings(DEFAULT_SETTINGS);
          }}
        >
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Download, Check, Smartphone, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/app/AppLayout";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <AppLayout title="Install App">
      <div className="space-y-6">
        {/* Connection Status */}
        <Card className={isOnline ? "border-green-500/50 bg-green-500/10" : "border-yellow-500/50 bg-yellow-500/10"}>
          <CardContent className="flex items-center gap-3 py-4">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="text-green-500 font-medium">You're online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-yellow-500" />
                <span className="text-yellow-500 font-medium">You're offline - app still works!</span>
              </>
            )}
          </CardContent>
        </Card>

        {/* Install Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Install Aggregate Tools</CardTitle>
            <CardDescription>
              Add to your home screen for quick access and offline use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="flex items-center justify-center gap-2 text-green-500 py-4">
                <Check className="h-5 w-5" />
                <span className="font-medium">App installed!</span>
              </div>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full" size="lg">
                <Download className="h-5 w-5 mr-2" />
                Install App
              </Button>
            ) : (
              <div className="space-y-4 text-center text-muted-foreground">
                <p className="text-sm">
                  To install this app on your device:
                </p>
                <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4">
                  <p className="text-sm"><strong>iPhone/iPad:</strong></p>
                  <p className="text-xs">Tap the Share button, then "Add to Home Screen"</p>
                  <p className="text-sm mt-3"><strong>Android:</strong></p>
                  <p className="text-xs">Tap the menu (⋮), then "Add to Home screen"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offline Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Works Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Tonnage calculator
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Equipment specifications
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Saved runs (local storage)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Material calculations
              </li>
              <li className="flex items-center gap-2 text-muted-foreground/60">
                <WifiOff className="h-4 w-4" />
                AI troubleshooting (requires internet)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default InstallPage;

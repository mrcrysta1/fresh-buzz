import { useState } from "react";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [breakingNews, setBreakingNews] = useState(true);

  const handleSaveSettings = () => {
    // Here you would save settings to localStorage or send to your backend
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushNotifications(true);
        toast({
          title: "Push notifications enabled",
          description: "You'll now receive push notifications for breaking news.",
        });
      } else {
        toast({
          title: "Permission denied", 
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your notification preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure when and how you want to receive news updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Enable Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive news updates and alerts
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="breaking-news" className="text-sm font-medium">
                  Breaking News Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified immediately for urgent news
                </p>
              </div>
              <Switch
                id="breaking-news"
                checked={breakingNews}
                onCheckedChange={setBreakingNews}
                disabled={!notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications even when the app is closed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  disabled={!notifications}
                />
                {!pushNotifications && notifications && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestNotificationPermission}
                    className="text-xs"
                  >
                    <Smartphone className="h-3 w-3 mr-1" />
                    Enable
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
            <CardDescription>
              Connect to your Python backend for real-time news updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Ready for integration:</strong> This app is designed to receive news data from your Python backend.
                Configure your API endpoint to send news data to this app via webhook or REST API.
              </p>
            </div>
            <Button variant="outline" className="w-full" disabled>
              API Configuration (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-6">
          <Button onClick={handleSaveSettings} className="px-8">
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
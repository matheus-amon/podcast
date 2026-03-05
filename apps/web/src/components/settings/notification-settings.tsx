'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newLeads: true,
    upcomingEvents: true,
    paymentReminders: true,
    weeklyReports: false,
  })

  const handleSave = () => {
    console.log("Saving notification settings:", settings)
    // Would save to API in real implementation
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive all notifications via email.
            </p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Leads</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when a new lead is added.
            </p>
          </div>
          <Switch
            checked={settings.newLeads}
            onCheckedChange={(checked) => setSettings({ ...settings, newLeads: checked })}
            disabled={!settings.emailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Upcoming Events</Label>
            <p className="text-sm text-muted-foreground">
              Reminders for upcoming events and recordings.
            </p>
          </div>
          <Switch
            checked={settings.upcomingEvents}
            onCheckedChange={(checked) => setSettings({ ...settings, upcomingEvents: checked })}
            disabled={!settings.emailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Payment Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Notifications for pending and overdue payments.
            </p>
          </div>
          <Switch
            checked={settings.paymentReminders}
            onCheckedChange={(checked) => setSettings({ ...settings, paymentReminders: checked })}
            disabled={!settings.emailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Weekly Reports</Label>
            <p className="text-sm text-muted-foreground">
              Weekly summary of your podcast metrics.
            </p>
          </div>
          <Switch
            checked={settings.weeklyReports}
            onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
            disabled={!settings.emailNotifications}
          />
        </div>

        <Button onClick={handleSave} className="mt-4">
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  )
}

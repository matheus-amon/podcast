'use client'

import { useWhitelabelConfig, useUpdateWhitelabelConfig } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

export function GeneralSettings() {
  const { data: config, isLoading } = useWhitelabelConfig()
  const updateConfig = useUpdateWhitelabelConfig()

  const form = useForm({
    defaultValues: {
      companyName: config?.companyName || 'Podcast SaaS',
      subdomain: config?.subdomain || '',
    },
    values: config ? {
      companyName: config.companyName || '',
      subdomain: config.subdomain || '',
    } : undefined,
  })

  const onSubmit = async (data: any) => {
    await updateConfig.mutateAsync(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage your account and company information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              {...form.register("companyName")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                placeholder="your-company"
                {...form.register("subdomain")}
              />
              <span className="text-muted-foreground whitespace-nowrap">.podcastsaas.com</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your custom subdomain for whitelabel access.
            </p>
          </div>

          <Button type="submit" disabled={updateConfig.isPending}>
            {updateConfig.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

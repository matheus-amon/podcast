'use client'

import { useWhitelabelConfig, useUpdateWhitelabelConfig } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

export function AppearanceSettings() {
  const { data: config, isLoading } = useWhitelabelConfig()
  const updateConfig = useUpdateWhitelabelConfig()

  const form = useForm({
    defaultValues: {
      primaryColor: config?.primaryColor || '#3B82F6',
      secondaryColor: config?.secondaryColor || '#1E40AF',
    },
    values: config ? {
      primaryColor: config.primaryColor || '#3B82F6',
      secondaryColor: config.secondaryColor || '#1E40AF',
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
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize your brand colors and logo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primaryColor"
                type="color"
                className="w-20 h-9"
                {...form.register("primaryColor")}
              />
              <Input
                type="text"
                {...form.register("primaryColor")}
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secondaryColor"
                type="color"
                className="w-20 h-9"
                {...form.register("secondaryColor")}
              />
              <Input
                type="text"
                {...form.register("secondaryColor")}
                className="flex-1"
              />
            </div>
          </div>

          <Button type="submit" disabled={updateConfig.isPending}>
            {updateConfig.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

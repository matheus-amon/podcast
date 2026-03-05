export interface WhitelabelConfig {
  id: number
  logoUrl?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  companyName?: string | null
  subdomain?: string | null
  updatedAt: string
}

export interface UpdateWhitelabelConfigDTO {
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  companyName?: string
  subdomain?: string
}

export interface UserSettings {
  name: string
  email: string
  language: 'pt-BR' | 'en'
  timezone: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  newLeads: boolean
  upcomingEvents: boolean
  paymentReminders: boolean
  weeklyReports: boolean
}

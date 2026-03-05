import { fetchAPI } from "@/lib/api"
import type { WhitelabelConfig, UpdateWhitelabelConfigDTO } from "@/types/settings"

export async function getWhitelabelConfig(): Promise<WhitelabelConfig> {
  return fetchAPI('/api/whitelabel/config')
}

export async function updateWhitelabelConfig(data: UpdateWhitelabelConfigDTO): Promise<WhitelabelConfig> {
  return fetchAPI('/api/whitelabel/config', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

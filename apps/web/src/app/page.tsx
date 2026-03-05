import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import DashboardPage from "./dashboard/page"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="ml-64 p-8">
        <DashboardPage />
      </main>
    </div>
  )
}

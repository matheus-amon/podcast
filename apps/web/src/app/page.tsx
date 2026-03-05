import { redirect } from "next/navigation";
import DashboardPage from "./dashboard/page";

export default function Home() {
  // Redirect to dashboard
  return <DashboardPage />;
}

import { Dashboard } from "@/components/dashboard/dashboard";
import { getDashboardData, getGroupedHistoryData } from "@/server/sensors";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [dashboard, history] = await Promise.all([getDashboardData(), getGroupedHistoryData()]);

  return <Dashboard initialDashboard={dashboard} initialHistory={history} />;
}

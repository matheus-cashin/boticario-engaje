
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { StatisticsCard } from "@/components/dashboard/StatisticsCard";
import { CampaignsTable } from "@/components/dashboard/CampaignsTable";
import { ABCCurveCard } from "@/components/dashboard/ABCCurveCard";
import { GlobalRankingCard } from "@/components/dashboard/GlobalRankingCard";

export default function Index() {

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-xl font-semibold">Cashin Sales</h1>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-6 p-6">
            <DashboardHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SalesChart />
              <StatisticsCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CampaignsTable />
              <ABCCurveCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlobalRankingCard />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

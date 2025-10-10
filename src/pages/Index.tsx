
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { CampaignFilters, FilterValues } from "@/components/CampaignFilters";
import { CampaignList } from "@/components/CampaignList";

export default function Index() {
  const [filters, setFilters] = useState<FilterValues>({
    arquivo: "",
    dataEnvio: undefined,
    campanha: "",
    aprovacao: "",
    credito: "",
  });

  const handleFiltersChange = (newFilters: FilterValues) => {
    console.log('🔍 Filtros atualizados na página Index:', newFilters);
    setFilters(newFilters);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-xl font-semibold">Cashin Engaje</h1>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Área reservada para novos elementos */}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

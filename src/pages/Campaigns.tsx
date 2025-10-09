import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { CampaignFilters, FilterValues } from "@/components/CampaignFilters";
import { CampaignList } from "@/components/CampaignList";
import { AICampaignConsultant } from "@/components/AICampaignConsultant";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function Campaigns() {
  const [filters, setFilters] = useState<FilterValues>({
    arquivo: "",
    dataEnvio: undefined,
    campanha: "",
    aprovacao: "",
    credito: "",
  });
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaignName, setSelectedCampaignName] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFiltersChange = (newFilters: FilterValues) => {
    console.log('🔍 Filtros atualizados na página Campaigns:', newFilters);
    setFilters(newFilters);
  };

  const handleCampaignCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
            <div className="flex items-center justify-between w-full px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <h1 className="text-xl font-semibold">Gestão de Campanhas</h1>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Campanha
              </Button>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Tabs defaultValue="campaigns" className="w-full">
              <TabsList>
                <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
                <TabsTrigger value="consultant" disabled={!selectedCampaignId}>
                  Consultor AI
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="campaigns" className="space-y-4">
                <CampaignFilters onFiltersChange={handleFiltersChange} />
                <CampaignList 
                  filters={filters}
                  refreshTrigger={refreshTrigger}
                  onSelectCampaign={(id, name) => {
                    setSelectedCampaignId(id);
                    setSelectedCampaignName(name);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="consultant">
                {selectedCampaignId && (
                  <AICampaignConsultant
                    campaignId={selectedCampaignId}
                    campaignName={selectedCampaignName}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCampaignCreated}
      />
    </SidebarProvider>
  );
}

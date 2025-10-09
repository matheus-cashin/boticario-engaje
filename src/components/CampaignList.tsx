
import React from "react";
import { CampaignItem } from "./CampaignItem";
import { useFilteredCampaigns } from "@/hooks/useFilteredCampaigns";
import { FilterValues } from "./CampaignFilters";

interface CampaignListProps {
  filters: FilterValues;
  refreshTrigger?: number;
  onSelectCampaign?: (campaignId: string, campaignName: string) => void;
}

export function CampaignList({ filters, refreshTrigger, onSelectCampaign }: CampaignListProps) {
  const { data: campaigns, isLoading, error, refetch } = useFilteredCampaigns(filters);
  
  // Recarregar quando refreshTrigger mudar
  React.useEffect(() => {
    if (refreshTrigger !== undefined) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="border rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <p className="text-red-600">Erro ao carregar campanhas: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Verifique o console para mais detalhes</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <p className="text-gray-500">Nenhuma campanha encontrada com os filtros aplicados.</p>
        <p className="text-sm text-gray-400 mt-2">Verifique se há dados na base de dados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        return (
          <CampaignItem 
            key={campaign.id}
            {...campaign}
            onSelect={() => onSelectCampaign?.(campaign.id, campaign.name)}
          />
        );
      })}
    </div>
  );
}

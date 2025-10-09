
import { useMemo } from "react";
import { useCampaigns, Campaign } from "./useCampaigns";
import { FilterValues } from "@/components/CampaignFilters";
import { format } from "date-fns";

export function useFilteredCampaigns(filters: FilterValues) {
  const { data: campaigns, isLoading, error, refetch } = useCampaigns();

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) {
      return [];
    }

    // Se não há filtros aplicados, retorna todas as campanhas
    const hasActiveFilters = filters.arquivo || filters.dataEnvio || filters.campanha || filters.aprovacao || filters.credito;
    
    if (!hasActiveFilters) {
      return campaigns;
    }

    const filtered = campaigns.filter((campaign: Campaign) => {
      // Filtro por nome da campanha
      if (filters.campanha) {
        const matchesCampaign = campaign.name.toLowerCase().includes(filters.campanha.toLowerCase());
        if (!matchesCampaign) return false;
      }

      // Filtro por arquivo
      if (filters.arquivo) {
        const hasMatchingFile = campaign.files.some(file =>
          file.name.toLowerCase().includes(filters.arquivo.toLowerCase())
        );
        if (!hasMatchingFile) return false;
      }

      // Filtro por data de envio
      if (filters.dataEnvio) {
        const filterDate = format(filters.dataEnvio, "dd/MM/yyyy");
        const hasMatchingDate = campaign.files.some(file =>
          file.uploadDate === filterDate
        );
        if (!hasMatchingDate) return false;
      }

      // Filtro por aprovação
      if (filters.aprovacao) {
        const hasMatchingStatus = campaign.files.some(file =>
          file.status === filters.aprovacao
        );
        if (!hasMatchingStatus) return false;
      }

      // Filtro por crédito
      if (filters.credito) {
        const hasMatchingCredit = campaign.files.some(file =>
          file.credit === filters.credito
        );
        if (!hasMatchingCredit) return false;
      }

      return true;
    });

    return filtered;
  }, [campaigns, filters]);

  return {
    data: filteredCampaigns,
    isLoading,
    error,
    refetch
  };
}

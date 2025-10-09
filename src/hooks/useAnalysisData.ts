import { useQuery } from "@tanstack/react-query";
import { getProcessedFileData, ProcessedFileData } from "@/services/apuracaoProcessingService";

export function useAnalysisData(fileId: string) {
  return useQuery({
    queryKey: ["analysis", fileId],
    queryFn: async (): Promise<ProcessedFileData | null> => {
      return await getProcessedFileData(fileId);
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
}

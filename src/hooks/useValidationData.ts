import { useQuery } from "@tanstack/react-query";
import { validateFileData, ValidationData } from "@/services/apuracaoValidationService";

export function useValidationData(fileId: string) {
  return useQuery({
    queryKey: ["validation", fileId],
    queryFn: () => validateFileData(fileId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

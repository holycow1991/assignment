import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refetchEventById } from "../../../entities/event/api/events";

export function useRefetchEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (externalId: string) => {
      const match = await refetchEventById(externalId);
      return { externalId, match };
    },
    onSuccess: ({ externalId, match }) => {
      queryClient.setQueryData(["event", externalId], match);
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refetchEvents } from "../../../entities/event/api/events";

export function useRefetchEvents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refetchEvents,
    onSuccess: (data) => {
      queryClient.setQueryData(["events"], data);
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

interface RefetchEventButtonProps {
  isPending: boolean;
  onClick: () => void;
}

export function RefetchEventButton({
  isPending,
  onClick,
}: RefetchEventButtonProps) {
  return (
    <button className="button ghost" onClick={onClick} disabled={isPending}>
      {isPending ? "Refetching..." : "Refetch row"}
    </button>
  );
}

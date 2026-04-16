interface RefetchEventsButtonProps {
  isPending: boolean;
  onClick: () => void;
}

export function RefetchEventsButton({
  isPending,
  onClick,
}: RefetchEventsButtonProps) {
  return (
    <button className="button" onClick={onClick} disabled={isPending}>
      {isPending ? "Refetching all..." : "Fetch rows"}
    </button>
  );
}

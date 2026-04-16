interface ExportEventJsonButtonProps {
  isPending: boolean;
  onClick: () => void;
}

export function ExportEventJsonButton({
  isPending,
  onClick,
}: ExportEventJsonButtonProps) {
  return (
    <button className="button secondary" onClick={onClick} disabled={isPending}>
      {isPending ? "Exporting..." : "Export JSON"}
    </button>
  );
}

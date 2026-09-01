import * as React from "react";

export function StatusIndicator({
  status,
  className = "",
}: {
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
  className?: string;
}) {
  const statusColors = {
    AVAILABLE: "bg-status-available",
    BUSY: "bg-status-busy",
    OFFLINE: "bg-status-offline",
  };

  return (
    <div
      className={`h-3 w-3 rounded-full ${statusColors[status]} ${className}`}
      role="status"
      aria-label={`Status: ${status}`}
    />
  );
}

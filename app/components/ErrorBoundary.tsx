"use client";

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

export function ErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ReactErrorBoundary
      fallback={
        fallback ?? (
          <div className="text-red-400 text-sm">Feature unavailable</div>
        )
      }
    >
      {children}
    </ReactErrorBoundary>
  );
}

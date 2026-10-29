import React from "react";
import { AlertCircle, X } from "lucide-react";

export default function ErrorBanner({ message, onDismiss, className = "" }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm flex items-start justify-between shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <span className="font-medium leading-relaxed">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-500 hover:text-rose-700 p-1 rounded-md transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}


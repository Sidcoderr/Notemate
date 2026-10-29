import React from "react";

export default function TagChip({ tag, className = "" }) {
  if (!tag) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 transition-colors hover:bg-indigo-100 ${className}`}
    >
      #{tag.toLowerCase()}
    </span>
  );
}


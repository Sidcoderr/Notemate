import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, ChevronRight } from "lucide-react";
import TagChip from "./TagChip.jsx";

export default function NoteCard({ note }) {
  const contentPreview =
    note.content && note.content.length > 120
      ? `${note.content.slice(0, 120)}...`
      : note.content || "No content";

  const formattedDate = new Date(note.updated_at || note.created_at).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <Link
      to={`/notes/${note.id}`}
      className="group block bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Title */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-base">
            {note.title}
          </h3>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
        </div>

        {/* Content Preview (first 120 chars) */}
        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {contentPreview}
        </p>

        {/* AI Summary snippet if available */}
        {note.summary && (
          <div className="mb-4 p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span className="line-clamp-2 italic">{note.summary}</span>
          </div>
        )}
      </div>

      <div>
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.map((tag, idx) => (
              <TagChip key={`${tag}-${idx}`} tag={tag} />
            ))}
          </div>
        )}

        {/* Footer: Date */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Updated {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  );
}


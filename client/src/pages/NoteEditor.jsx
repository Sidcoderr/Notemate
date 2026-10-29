import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import Navbar from "../components/Navbar.jsx";
import TagChip from "../components/TagChip.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Spinner from "../components/Spinner.jsx";
import {
  ArrowLeft,
  Save,
  Trash2,
  Sparkles,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);

  // Status states
  const [fetching, setFetching] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch existing note if editing
  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;
    const loadNote = async () => {
      try {
        setFetching(true);
        setError("");
        const note = await api.getNote(id);
        if (isMounted) {
          setTitle(note.title || "");
          setContent(note.content || "");
          setSummary(note.summary || "");
          setTags(note.tags || []);
          setUpdatedAt(note.updated_at || note.created_at);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading note:", err);
          setError(err.message || "Failed to load note. It may not exist or belongs to another user.");
        }
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    loadNote();
    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please provide a note title.");
      return;
    }

    if (trimmedTitle.length > 200) {
      setError("Title cannot exceed 200 characters.");
      return;
    }

    if (content.length > 20000) {
      setError("Content cannot exceed 20,000 characters.");
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        const updated = await api.updateNote(id, { title: trimmedTitle, content });
        setTitle(updated.title);
        setContent(updated.content);
        setUpdatedAt(updated.updated_at);
      } else {
        const created = await api.createNote({ title: trimmedTitle, content });
        navigate(`/notes/${created.id}`, { replace: true });
      }
    } catch (err) {
      console.error("Error saving note:", err);
      setError(err.message || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;

    try {
      setDeleting(true);
      setError("");
      await api.deleteNote(id);
      navigate("/");
    } catch (err) {
      console.error("Error deleting note:", err);
      setError(err.message || "Failed to delete note.");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSummarize = async () => {
    if (!isEditing) {
      setError("Please save the note first before requesting an AI summary.");
      return;
    }

    if (!content || content.trim().length < 20) {
      setError("Note is too short to summarize. Please write at least 20 characters.");
      return;
    }

    try {
      setSummarizing(true);
      setError("");

      // If there are unsaved changes to title or content, save them first
      await api.updateNote(id, { title: title.trim(), content });

      const aiData = await api.summarizeNote(id);
      setSummary(aiData.summary);
      setTags(aiData.tags || []);
    } catch (err) {
      console.error("Error summarizing note:", err);
      setError(err.message || "AI service unavailable, please try again.");
    } finally {
      setSummarizing(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <Spinner size="lg" className="text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Notes</span>
          </Link>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting || saving || summarizing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || deleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Spinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? "Save Note" : "Create Note"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
          </div>
        )}

        {/* Editor Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-6 space-y-6">
          {/* Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="note-title"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Title <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  title.length > 200 ? "text-rose-600 font-bold" : "text-slate-400"
                }`}
              >
                {title.length}/200
              </span>
            </div>
            <input
              id="note-title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Architecture Plan"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-base font-medium placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="note-content"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Content
              </label>
              <span
                className={`text-xs ${
                  content.length > 20000 ? "text-rose-600 font-bold" : "text-slate-400"
                }`}
              >
                {content.length.toLocaleString()}/20,000
              </span>
            </div>
            <textarea
              id="note-content"
              rows={14}
              maxLength={20000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here... (AI summarize requires at least 20 characters)"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
            />
          </div>

          {/* Footer timestamp */}
          {updatedAt && (
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Last updated{" "}
                {new Date(updatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}
        </div>

        {/* AI Summarize Section */}
        {isEditing && (
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-indigo-100/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">AI Intelligence</h2>
                  <p className="text-xs text-slate-500">
                    Generate an executive summary and 3 key tags using Gemini
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSummarize}
                disabled={summarizing || saving || deleting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium shadow-sm transition-colors disabled:opacity-50 self-start sm:self-auto"
              >
                {summarizing ? (
                  <>
                    <Spinner size="sm" />
                    <span>Summarizing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Summarize</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Results Display */}
            {summary ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-1.5">
                    Summary
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed bg-white/80 rounded-xl p-4 border border-indigo-100">
                    {summary}
                  </p>
                </div>

                {tags && tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-2">
                      Generated Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t, idx) => (
                        <TagChip key={`${t}-${idx}`} tag={t} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No summary generated yet. Click &ldquo;AI Summarize&rdquo; above to automatically summarize this note.
              </p>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Note</h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Spinner size="sm" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


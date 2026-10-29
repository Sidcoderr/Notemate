import { supabase } from "./supabase.js";

const getBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${rawUrl.replace(/\/+$/, "")}/api`;
};

async function request(endpoint, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  let responseData;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const errorMessage =
      responseData?.error ||
      (responseData?.details && responseData.details.map((d) => d.message).join(", ")) ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = responseData?.details;
    throw error;
  }

  return responseData;
}

export const api = {
  health: () => request("/health"),
  getNotes: () => request("/notes"),
  getNote: (id) => request(`/notes/${id}`),
  createNote: ({ title, content }) =>
    request("/notes", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    }),
  updateNote: (id, { title, content }) =>
    request(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    }),
  deleteNote: (id) =>
    request(`/notes/${id}`, {
      method: "DELETE",
    }),
  summarizeNote: (id) =>
    request(`/notes/${id}/summarize`, {
      method: "POST",
    }),
};


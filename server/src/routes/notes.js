import express from "express";
import rateLimit from "express-rate-limit";
import { supabaseAdmin } from "../lib/supabase.js";
import { summarizeNote } from "../lib/gemini.js";
import { requireAuth } from "../middleware/auth.js";
import {
  noteInputSchema,
  idParamSchema,
  validateBody,
  validateParams,
} from "../middleware/validate.js";

const router = express.Router();

// Rate limit /api/notes/:id/summarize: 10 requests/minute per IP
const summarizeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many summarize requests. Please try again after a minute." },
});

// All notes routes require authentication
router.use(requireAuth);

// GET /api/notes - List user's notes, newest first
router.get("/", async (req, res, next) => {
  try {
    const { data: notes, error } = await supabaseAdmin
      .from("notes")
      .select("*")
      .eq("user_id", req.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(notes || []);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id - One note; 404 if not the user's
router.get("/:id", validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: note, error } = await supabaseAdmin
      .from("notes")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes - Create note { title, content }
router.post("/", validateBody(noteInputSchema), async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const { data: note, error } = await supabaseAdmin
      .from("notes")
      .insert({
        user_id: req.user.id,
        title,
        content: content || "",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id - Update note { title, content }
router.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(noteInputSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      const { data: note, error } = await supabaseAdmin
        .from("notes")
        .update({
          title,
          content: content || "",
        })
        .eq("id", id)
        .eq("user_id", req.user.id)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      res.json(note);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/notes/:id - Delete note
router.delete("/:id", validateParams(idParamSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: note, error } = await supabaseAdmin
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// POST /api/notes/:id/summarize - Send note to Gemini, save and return { summary, tags }
router.post(
  "/:id/summarize",
  summarizeLimiter,
  validateParams(idParamSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // 1. Fetch note ensuring ownership
      const { data: note, error: fetchError } = await supabaseAdmin
        .from("notes")
        .select("*")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      // 2. Validate note content length (under 20 characters returns 400)
      if (!note.content || note.content.trim().length < 20) {
        return res.status(400).json({ error: "Note is too short to summarize." });
      }

      // 3. Call Gemini
      let aiResult;
      try {
        aiResult = await summarizeNote(note.title, note.content);
      } catch (geminiError) {
        console.error("Gemini AI error:", geminiError);
        return res.status(502).json({ error: "AI service unavailable, please try again." });
      }

      // 4. Save summary and tags
      const { data: updatedNote, error: updateError } = await supabaseAdmin
        .from("notes")
        .update({
          summary: aiResult.summary,
          tags: aiResult.tags,
        })
        .eq("id", id)
        .eq("user_id", req.user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        summary: updatedNote.summary,
        tags: updatedNote.tags,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;


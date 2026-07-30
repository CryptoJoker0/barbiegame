import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// GET /announcements — only active ones for players
router.get("/announcements", async (_req, res) => {
  const active = await db.query.announcementsTable.findMany({
    where: eq(announcementsTable.isActive, true),
    orderBy: desc(announcementsTable.createdAt),
  });
  res.json(active);
});

// POST /announcements — admin create
router.post("/announcements", async (req, res) => {
  const { title, message, isActive } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: "Title and message required" });
    return;
  }
  const [ann] = await db.insert(announcementsTable)
    .values({ title, message, isActive: isActive ?? true })
    .returning();
  res.json(ann);
});

// PATCH /announcements/:id — admin update
router.patch("/announcements/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, message, isActive } = req.body;

  const update: Record<string, any> = {};
  if (title !== undefined) update.title = title;
  if (message !== undefined) update.message = message;
  if (isActive !== undefined) update.isActive = isActive;

  const [ann] = await db
    .update(announcementsTable)
    .set(update)
    .where(eq(announcementsTable.id, id))
    .returning();

  if (!ann) { res.status(404).json({ error: "Not found" }); return; }
  res.json(ann);
});

// DELETE /announcements/:id — admin delete
router.delete("/announcements/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  res.json({ success: true });
});

export default router;

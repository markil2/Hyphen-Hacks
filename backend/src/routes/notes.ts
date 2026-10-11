import { Router } from "express";
import { z } from "zod";
import { activeFamilyMembership } from "../auth";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";

/** The family fridge: short notes between the people caring for the baby. */
export const notesRouter = Router();

const familyParams = z.object({ familyId: z.string().min(1) });
const colors = ["cream", "sage", "blue", "terracotta"] as const;
const author = { select: { id: true, name: true } };

notesRouter.get("/families/:familyId/notes", validate(z.object({ params: familyParams })), async (req, res, next) => {
  try {
    await activeFamilyMembership(req.authUserId!, req.params.familyId);
    const notes = await prisma.familyNote.findMany({ where: { familyId: req.params.familyId }, orderBy: { createdAt: "desc" }, take: 50, include: { author } });
    ok(res, { items: notes.map((note) => ({ ...note, mine: note.authorId === req.authUserId })) });
  } catch (e) { next(e); }
});

notesRouter.post("/families/:familyId/notes", validate(z.object({ params: familyParams, body: z.object({ body: z.string().trim().min(1).max(1000), color: z.enum(colors).default("cream") }) })), async (req, res, next) => {
  try {
    await activeFamilyMembership(req.authUserId!, req.params.familyId);
    const note = await prisma.familyNote.create({ data: { familyId: req.params.familyId, authorId: req.authUserId!, body: req.body.body, color: req.body.color }, include: { author } });
    ok(res, { note: { ...note, mine: true } }, "Note added", 201);
  } catch (e) { next(e); }
});

notesRouter.delete("/notes/:id", validate(z.object({ params: z.object({ id: z.string().min(1) }) })), async (req, res, next) => {
  try {
    const note = await prisma.familyNote.findUnique({ where: { id: req.params.id } });
    // Only the author can take their note down; other members get the same 404 as a missing note.
    if (!note || note.authorId !== req.authUserId) throw new AppError(404, "NOTE_NOT_FOUND", "Note was not found");
    await activeFamilyMembership(req.authUserId!, note.familyId);
    await prisma.familyNote.delete({ where: { id: note.id } });
    ok(res, { id: note.id }, "Note removed");
  } catch (e) { next(e); }
});

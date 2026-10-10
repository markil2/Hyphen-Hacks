import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import request from "supertest";
import express from "express";
import { afterAll, describe, expect, it } from "vitest";
import { app, createRateLimiter } from "../src/app";
import { prisma } from "../src/db";

let token = ""; let babyId = ""; let questionId = ""; let otherToken = ""; let familyId = ""; let otherMembershipId = "";
const auth = () => ({ Authorization: `Bearer ${token}` });
const supabaseUsers = new Map<string, string>();
/** A Supabase-shaped access token, as the app would get from supabase.auth.signInWithPassword. */
function supabaseToken(name: string, email: string, sub = supabaseUsers.get(email) ?? randomUUID(), secret = process.env.SUPABASE_JWT_SECRET!) {
  supabaseUsers.set(email, sub);
  return jwt.sign({ sub, email, role: "authenticated", user_metadata: { name } }, secret, { audience: "authenticated", expiresIn: "1h" });
}
/** Signs a parent in; the API creates their Nurture profile and household on first use. */
async function signIn(name: string, email: string) {
  const token = supabaseToken(name, email);
  const me = await request(app).get("/api/auth/me").set({ Authorization: `Bearer ${token}` });
  expect(me.status).toBe(200); expect(me.body.data.email).toBe(email);
  return token;
}

describe("Nurture API", () => {
  it("creates a Nurture profile on first Supabase sign-in and adds a baby", async () => {
    token = await signIn("Test Parent", "parent@example.test");
    const baby = await request(app).post("/api/babies").set(auth()).send({ name: "Test Baby", birthDate: "2026-01-01", sexAtBirth: "not_recorded", initialWeight: 7.5, weightUnit: "lb", initialHeight: 50, heightUnit: "cm" });
    expect(baby.status).toBe(201); expect(baby.body.data.name).toBe("Test Baby"); expect(baby.body.data.familyId).toBeTruthy(); babyId = baby.body.data.id;
  });

  it("starts sleep and rejects a duplicate active session", async () => {
    const start = await request(app).post(`/api/babies/${babyId}/sleep/start`).set(auth()).send({ startTime: "2026-10-10T01:00:00.000Z" });
    expect(start.status).toBe(201);
    const duplicate = await request(app).post(`/api/babies/${babyId}/sleep/start`).set(auth()).send({});
    expect(duplicate.status).toBe(409); expect(duplicate.body.error.code).toBe("SLEEP_ALREADY_ACTIVE");
  });

  it("stops sleep, calculates duration, and handles repeat stops", async () => {
    const stop = await request(app).post(`/api/babies/${babyId}/sleep/stop`).set(auth()).send({ endTime: "2026-10-10T02:30:00.000Z" });
    expect(stop.status).toBe(200); expect(stop.body.data.session.durationMinutes).toBe(90);
    const repeated = await request(app).post(`/api/babies/${babyId}/sleep/stop`).set(auth()).send({});
    expect(repeated.status).toBe(200); expect(repeated.body.data.alreadyStopped).toBe(true);
  });

  it("rejects invalid sleep ranges and invalid feeding inputs", async () => {
    await request(app).post(`/api/babies/${babyId}/sleep/start`).set(auth()).send({ startTime: "2026-10-10T04:00:00.000Z" });
    const invalidStop = await request(app).post(`/api/babies/${babyId}/sleep/stop`).set(auth()).send({ endTime: "2026-10-10T03:00:00.000Z" });
    expect(invalidStop.status).toBe(400); expect(invalidStop.body.error.code).toBe("VALIDATION_ERROR");
    const invalidFeeding = await request(app).post(`/api/babies/${babyId}/feedings`).set(auth()).send({ feedingType: "formula", amount: -1 });
    expect(invalidFeeding.status).toBe(400);
    await request(app).post(`/api/babies/${babyId}/sleep/stop`).set(auth()).send({ endTime: "2026-10-10T05:00:00.000Z" });
  });

  it("records a feeding and returns dashboard summaries", async () => {
    const feeding = await request(app).post(`/api/babies/${babyId}/feedings`).set(auth()).send({ feedingType: "formula", feedingMethod: "bottle", milkType: "formula", amount: 90, unit: "ml", startTime: new Date().toISOString() });
    expect(feeding.status).toBe(201);
    const dashboard = await request(app).get(`/api/babies/${babyId}/dashboard`).set(auth());
    expect(dashboard.status).toBe(200); expect(dashboard.body.data.latestFeeding.amount).toBe(90); expect(dashboard.body.data.feedingsToday).toHaveLength(1);
  });

  it("tracks milestones and health observations for the monitor panel", async () => {
    const milestone = await request(app).post(`/api/babies/${babyId}/milestones`).set(auth()).send({ type: "rolling", title: "Rolled tummy to back", achievedAt: "2026-10-09T12:00:00.000Z" });
    expect(milestone.status).toBe(201);
    const health = await request(app).post(`/api/babies/${babyId}/health`).set(auth()).send({ type: "temperature", value: 98.4, unit: "F", observedAt: "2026-10-10T13:00:00.000Z" });
    expect(health.status).toBe(201);
    const dashboard = await request(app).get(`/api/babies/${babyId}/dashboard`).set(auth());
    expect(dashboard.body.data.recentMilestones[0].type).toBe("rolling"); expect(dashboard.body.data.recentHealth[0].value).toBe(98.4);
  });

  it("records nursery measuring-stick height and includes it in the dashboard", async () => {
    const created = await request(app).post(`/api/babies/${babyId}/heights`).set(auth()).send({ height: 25.5, unit: "in", measuredAt: "2026-10-10T12:00:00.000Z", notes: "Measured using nursery ruler" });
    expect(created.status).toBe(201); expect(created.body.data.measurement.height).toBe(25.5); expect(created.body.data.notice).toContain("parent-recorded");
    const latest = await request(app).get(`/api/babies/${babyId}/heights/latest`).set(auth());
    expect(latest.status).toBe(200); expect(latest.body.data.measurement.unit).toBe("in");
    const dashboard = await request(app).get(`/api/babies/${babyId}/dashboard`).set(auth());
    expect(dashboard.status).toBe(200); expect(dashboard.body.data.latestHeight.height).toBe(25.5);
  });

  it("submits a question and deterministically matches specialties", async () => {
    await prisma.expert.createMany({ data: [{ name: "Demo Doctor", specialty: "Pediatrician", credentials: "Fictional demo", verificationStatus: "demo_not_verified", description: "Demo", availabilityStatus: "demo_unknown" }, { name: "Demo Consultant", specialty: "Lactation Consultant", credentials: "Fictional demo", verificationStatus: "demo_not_verified", description: "Demo", availabilityStatus: "demo_unknown" }] });
    const response = await request(app).post("/api/questions").set(auth()).send({ babyId, question: "How can I tell whether feeding is going well?", category: "feeding" });
    expect(response.status).toBe(201); questionId = response.body.data.question.id;
    const match = await request(app).post(`/api/questions/${questionId}/match-experts`).set(auth());
    expect(match.status).toBe(200); expect(match.body.data.recommendedSpecialties).toEqual(["Pediatrician", "Lactation Consultant"]); expect(match.body.data.matchingMethod).toBe("deterministic_category_rules");
  });

  it("creates and retrieves a consultation request", async () => {
    const expert = await prisma.expert.findFirstOrThrow();
    const response = await request(app).post("/api/consultations").set(auth()).send({ expertId: expert.id, questionId, message: "I would like general educational support for this concern." });
    expect(response.status).toBe(201); expect(response.body.data.request.status).toBe("pending"); expect(response.body.data.demoNotice).toContain("demonstration");
  });

  it("categorizes external experts and exposes only explicit contact options", async () => {
    const directoryEntry = await prisma.expert.create({ data: { name: "External Therapy Center", organization: "External Therapy Center", specialty: "Pediatric Occupational Therapy", serviceCategory: "occupational_therapy", audience: "baby_child", credentials: "Public information; test record", verificationStatus: "public_information_not_verified_by_nurture", affiliationStatus: "external_unpartnered", description: "Test directory entry", contactMethod: "phone,website", phone: "510-555-0100", website: "https://example.test/contact", availabilityStatus: "contact_provider", isDemo: false } });
    const list = await request(app).get("/api/experts?serviceCategory=occupational_therapy&audience=baby_child").set(auth());
    expect(list.status).toBe(200); expect(list.body.data.items.some((item: { id: string }) => item.id === directoryEntry.id)).toBe(true); expect(list.body.data.directoryNotice).toContain("no partnership");
    const options = await request(app).get(`/api/experts/${directoryEntry.id}/contact-options`).set(auth());
    expect(options.status).toBe(200); expect(options.body.data.options).toEqual([{ type: "phone", value: "510-555-0100" }, { type: "website", value: "https://example.test/contact" }]); expect(options.body.data.affiliationStatus).toBe("external_unpartnered");
  });

  it("prevents another parent from accessing this family's baby", async () => {
    otherToken = await signIn("Other Parent", "other@example.test");
    const response = await request(app).get(`/api/babies/${babyId}/dashboard`).set({ Authorization: `Bearer ${otherToken}` });
    expect(response.status).toBe(404); expect(response.body.error.code).toBe("BABY_NOT_FOUND");
  });

  it("invites a second parent into a shared family and grants baby access", async () => {
    const families = await request(app).get("/api/families").set(auth()); familyId = families.body.data[0].family.id;
    const invite = await request(app).post(`/api/families/${familyId}/invitations`).set(auth()).send({ email: "other@example.test", role: "parent" });
    expect(invite.status).toBe(201); expect(invite.body.data.emailSent).toBe(true);
    const accepted = await request(app).post("/api/families/invitations/accept").set({ Authorization: `Bearer ${otherToken}` }).send({ token: invite.body.data.developmentToken });
    expect(accepted.status).toBe(200);
    const shared = await request(app).get(`/api/babies/${babyId}/dashboard`).set({ Authorization: `Bearer ${otherToken}` });
    expect(shared.status).toBe(200);
    const members = await request(app).get(`/api/families/${familyId}/members`).set(auth());
    otherMembershipId = members.body.data.find((item: { user: { email: string } }) => item.user.email === "other@example.test").id;
  });

  it("supports separation by revoking one parent's family access without deleting shared baby records", async () => {
    const removed = await request(app).delete(`/api/families/${familyId}/members/${otherMembershipId}`).set(auth());
    expect(removed.status).toBe(200); expect(removed.body.data.accessRevoked).toBe(true);
    const denied = await request(app).get(`/api/babies/${babyId}/dashboard`).set({ Authorization: `Bearer ${otherToken}` });
    expect(denied.status).toBe(404);
    const ownerStillHasAccess = await request(app).get(`/api/babies/${babyId}/dashboard`).set(auth());
    expect(ownerStillHasAccess.status).toBe(200);
  });

  it("records privacy consent and exports account data", async () => {
    const consent = await request(app).post("/api/settings/privacy/consent").set(auth()).send({ policyVersion: "2026-10-10" });
    expect(consent.status).toBe(200);
    const privacy = await request(app).get("/api/settings/privacy").set(auth());
    expect(privacy.body.data.currentAccepted).toBe(true);
    const exported = await request(app).get("/api/settings/export").set(auth());
    expect(exported.status).toBe(200); expect(exported.body.data.babies.some((baby: { id: string }) => baby.id === babyId)).toBe(true); expect(exported.body.data.user.passwordHash).toBeUndefined();
  });

  it("rejects forged, wrong-audience and anonymous Supabase tokens", async () => {
    const forged = await request(app).get("/api/auth/me").set({ Authorization: `Bearer ${supabaseToken("Forger", "forger@example.test", randomUUID(), "not-the-project-secret-at-all")}` });
    expect(forged.status).toBe(401);
    const anon = jwt.sign({ sub: randomUUID(), role: "anon" }, process.env.SUPABASE_JWT_SECRET!, { audience: "authenticated" });
    expect((await request(app).get("/api/auth/me").set({ Authorization: `Bearer ${anon}` })).status).toBe(401);
    const wrongAudience = jwt.sign({ sub: randomUUID(), email: "aud@example.test", role: "authenticated" }, process.env.SUPABASE_JWT_SECRET!, { audience: "someone-else" });
    expect((await request(app).get("/api/auth/me").set({ Authorization: `Bearer ${wrongAudience}` })).status).toBe(401);
    expect((await request(app).get("/api/babies")).status).toBe(401);
  });

  it("links the same Supabase user to the same profile every time", async () => {
    const first = await request(app).get("/api/auth/me").set({ Authorization: `Bearer ${supabaseToken("Other Parent", "other@example.test")}` });
    const again = await request(app).get("/api/auth/me").set({ Authorization: `Bearer ${supabaseToken("Other Parent", "other@example.test")}` });
    expect(first.body.data.id).toBe(again.body.data.id);
    const families = await request(app).get("/api/families").set({ Authorization: `Bearer ${otherToken}` });
    expect(families.status).toBe(200); expect(families.body.data.some((m: { role: string }) => m.role === "owner")).toBe(true);
  });

  it("rejects expired invitation tokens", async () => {
    const inviteeToken = await signIn("Expired Invitee", "expired-invite@example.test");
    const invitation = await request(app).post(`/api/families/${familyId}/invitations`).set(auth()).send({ email: "expired-invite@example.test", role: "parent" });
    await prisma.familyInvitation.update({ where: { id: invitation.body.data.invitation.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const accepted = await request(app).post("/api/families/invitations/accept").set({ Authorization: `Bearer ${inviteeToken}` }).send({ token: invitation.body.data.developmentToken });
    expect(accepted.status).toBe(400); expect(accepted.body.error.code).toBe("INVALID_INVITATION");
  });

  it("prevents duplicate, mismatched, reused, and revoked family invitations", async () => {
    const invitedToken = await signIn("Invite Rules", "invite-rules@example.test");
    const first = await request(app).post(`/api/families/${familyId}/invitations`).set(auth()).send({ email: "invite-rules@example.test", role: "parent" });
    expect(first.status).toBe(201);
    const duplicate = await request(app).post(`/api/families/${familyId}/invitations`).set(auth()).send({ email: "invite-rules@example.test", role: "parent" });
    expect(duplicate.status).toBe(409); expect(duplicate.body.error.code).toBe("INVITATION_PENDING");
    const mismatch = await request(app).post("/api/families/invitations/accept").set({ Authorization: `Bearer ${otherToken}` }).send({ token: first.body.data.developmentToken });
    expect(mismatch.status).toBe(403); expect(mismatch.body.error.code).toBe("INVITATION_EMAIL_MISMATCH");
    const accepted = await request(app).post("/api/families/invitations/accept").set({ Authorization: `Bearer ${invitedToken}` }).send({ token: first.body.data.developmentToken });
    expect(accepted.status).toBe(200);
    const reused = await request(app).post("/api/families/invitations/accept").set({ Authorization: `Bearer ${invitedToken}` }).send({ token: first.body.data.developmentToken });
    expect(reused.status).toBe(400); expect(reused.body.error.code).toBe("INVALID_INVITATION");

    const revokedUserToken = await signIn("Revoked Invite", "revoked@example.test");
    const revocable = await request(app).post(`/api/families/${familyId}/invitations`).set(auth()).send({ email: "revoked@example.test", role: "caregiver" });
    const revoked = await request(app).delete(`/api/families/${familyId}/invitations/${revocable.body.data.invitation.id}`).set(auth());
    expect(revoked.status).toBe(200);
    const revokedAccept = await request(app).post("/api/families/invitations/accept").set({ Authorization: `Bearer ${revokedUserToken}` }).send({ token: revocable.body.data.developmentToken });
    expect(revokedAccept.status).toBe(400); expect(revokedAccept.body.error.code).toBe("INVALID_INVITATION");
  });

  it("enforces caregiver permissions while allowing shared care tracking", async () => {
    const caregiverToken = await signIn("Care Giver", "caregiver@example.test");
    const invite = await request(app).post(`/api/families/${familyId}/invitations`).set(auth()).send({ email: "caregiver@example.test", role: "caregiver" });
    await request(app).post("/api/families/invitations/accept").set({ Authorization: `Bearer ${caregiverToken}` }).send({ token: invite.body.data.developmentToken });
    const caregiverAuth = { Authorization: `Bearer ${caregiverToken}` };
    const diaper = await request(app).post(`/api/babies/${babyId}/diapers`).set(caregiverAuth).send({ type: "wet", notes: "Shared care entry" });
    expect(diaper.status).toBe(201);
    const edited = await request(app).patch(`/api/diapers/${diaper.body.data.id}`).set(caregiverAuth).send({ notes: "Updated shared care entry" });
    expect(edited.status).toBe(200);
    const rename = await request(app).patch(`/api/families/${familyId}`).set(caregiverAuth).send({ name: "Not allowed" });
    expect(rename.status).toBe(403); expect(rename.body.error.code).toBe("OWNER_REQUIRED");
    const inviteAttempt = await request(app).post(`/api/families/${familyId}/invitations`).set(caregiverAuth).send({ email: "nope@example.test", role: "parent" });
    expect(inviteAttempt.status).toBe(403); expect(inviteAttempt.body.error.code).toBe("INVITE_FORBIDDEN");
    const updateBaby = await request(app).patch(`/api/babies/${babyId}`).set(caregiverAuth).send({ name: "Not allowed" });
    expect(updateBaby.status).toBe(403); expect(updateBaby.body.error.code).toBe("BABY_ROLE_REQUIRED");
    const deleteBaby = await request(app).delete(`/api/babies/${babyId}`).set(caregiverAuth);
    expect(deleteBaby.status).toBe(403); expect(deleteBaby.body.error.code).toBe("BABY_ROLE_REQUIRED");
  });

  it("preserves shared baby records when an owner deletes their account", async () => {
    const ownerToken = await signIn("Deleting Owner", "deleting-owner@example.test");
    const coParentToken = await signIn("Remaining Parent", "remaining-parent@example.test");
    const ownerAuth = { Authorization: `Bearer ${ownerToken}` };
    const ownerFamilies = await request(app).get("/api/families").set(ownerAuth);
    const sharedFamilyId = ownerFamilies.body.data[0].family.id;
    const sharedBaby = await request(app).post("/api/babies").set(ownerAuth).send({ name: "Preserved Baby", birthDate: "2026-02-01", familyId: sharedFamilyId });
    const invitation = await request(app).post(`/api/families/${sharedFamilyId}/invitations`).set(ownerAuth).send({ email: "remaining-parent@example.test", role: "parent" });
    await request(app).post("/api/families/invitations/accept").set({ Authorization: `Bearer ${coParentToken}` }).send({ token: invitation.body.data.developmentToken });
    const deleted = await request(app).delete("/api/settings/account").set(ownerAuth).send({ confirmation: "DELETE MY ACCOUNT" });
    expect(deleted.status).toBe(200);
    const preserved = await request(app).get(`/api/babies/${sharedBaby.body.data.id}`).set({ Authorization: `Bearer ${coParentToken}` });
    expect(preserved.status).toBe(200); expect(preserved.body.data.name).toBe("Preserved Baby");
    const promoted = await prisma.familyMembership.findFirstOrThrow({ where: { familyId: sharedFamilyId, status: "active" } });
    expect(promoted.role).toBe("owner");
  });

  it("allows only one active sleep session during concurrent starts", async () => {
    const now = new Date(Date.now() - 60_000).toISOString();
    const responses = await Promise.all([
      request(app).post(`/api/babies/${babyId}/sleep/start`).set(auth()).send({ startTime: now }),
      request(app).post(`/api/babies/${babyId}/sleep/start`).set(auth()).send({ startTime: now }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await prisma.sleepSession.count({ where: { babyId, endTime: null } })).toBe(1);
    await request(app).post(`/api/babies/${babyId}/sleep/stop`).set(auth()).send({});
  });

  it("returns safe errors for malformed and oversized JSON", async () => {
    const malformed = await request(app).post("/api/questions").set(auth()).set("Content-Type", "application/json").send('{"question":');
    expect(malformed.status).toBe(400); expect(malformed.body.error.code).toBe("INVALID_JSON");
    const oversized = await request(app).post("/api/questions").set(auth()).set("Content-Type", "application/json").send(JSON.stringify({ question: "x".repeat(110_000), category: "general" }));
    expect(oversized.status).toBe(413); expect(oversized.body.error.code).toBe("REQUEST_TOO_LARGE");
  });

  it("calibrates menstrual tracking and saves a daily log", async () => {
    const setup = await request(app).put("/api/maternal/profile").set(auth()).send({ trackingMode: "menstrual", lastPeriodStartDate: "2026-10-01", averageCycleLength: 28, averagePeriodDays: 5, multiplesCount: 1 });
    expect(setup.status).toBe(200); expect(setup.body.data.profile.trackingMode).toBe("menstrual");
    const daily = await request(app).put("/api/maternal/menstrual/daily").set(auth()).send({ date: "2026-10-10", bleedingIntensity: "light", basalTemperature: 98.1, temperatureUnit: "F", cervicalMucus: "creamy", lhTestResult: "negative", lhPhotoReference: "private-object-key/lh-test-1" });
    expect(daily.status).toBe(200); expect(daily.body.data.log.bleedingIntensity).toBe("light");
  });

  it("records health and hormone measurements without interpreting them", async () => {
    const bp = await request(app).post("/api/maternal/health").set(auth()).send({ type: "blood_pressure", systolic: 110, diastolic: 70, context: "resting" });
    expect(bp.status).toBe(201); expect(bp.body.data.measurement.systolic).toBe(110);
    const hormone = await request(app).post("/api/maternal/hormones").set(auth()).send({ hormone: "lh", value: 12.5, unit: "mIU/mL", source: "lab" });
    expect(hormone.status).toBe(201); expect(hormone.body.data.measurement.value).toBe(12.5); expect(hormone.body.data.interpretationNotice).toContain("exactly as entered");
  });

  it("switches to pregnancy mode with multiples context and saves symptoms", async () => {
    const setup = await request(app).put("/api/maternal/profile").set(auth()).send({ trackingMode: "pregnancy", estimatedDueDate: "2027-05-20", multiplesCount: 2 });
    expect(setup.status).toBe(200); expect(setup.body.data.profile.multiplesCount).toBe(2); expect(setup.body.data.multiplesNotice).toContain("context only");
    const daily = await request(app).put("/api/maternal/pregnancy/daily").set(auth()).send({ date: "2026-10-10", nauseaVomiting: "nausea", fatigue: "moderate", brainFog: "mild", mood: "mixed", anxiety: "mild" });
    expect(daily.status).toBe(200); expect(daily.body.data.log.nauseaVomiting).toBe("nausea"); expect(daily.body.data.supportNotice).toContain("does not provide therapy");
  });

  it("keeps maternal tracking private to its authenticated owner", async () => {
    const response = await request(app).get("/api/maternal/profile").set({ Authorization: `Bearer ${otherToken}` });
    expect(response.status).toBe(404); expect(response.body.error.code).toBe("MATERNAL_PROFILE_NOT_FOUND");
  });

  it("anonymizes a deleted account and refuses its token afterwards", async () => {
    const deleteToken = await signIn("Delete Test", "delete@example.test");
    const missingConfirmation = await request(app).delete("/api/settings/account").set({ Authorization: `Bearer ${deleteToken}` }).send({});
    expect(missingConfirmation.status).toBe(400);
    const deleted = await request(app).delete("/api/settings/account").set({ Authorization: `Bearer ${deleteToken}` }).send({ confirmation: "DELETE MY ACCOUNT" });
    expect(deleted.status).toBe(200); expect(deleted.body.data.accountDeleted).toBe(true);
    const row = await prisma.user.findFirstOrThrow({ where: { supabaseUserId: supabaseUsers.get("delete@example.test") } });
    expect(row.deletedAt).toBeTruthy(); expect(row.name).toBe("Deleted User"); expect(row.email).toMatch(/^deleted-/);
    // A still-valid token for the deleted Supabase user must not quietly recreate the account.
    const denied = await request(app).get("/api/auth/me").set({ Authorization: `Bearer ${deleteToken}` });
    expect(denied.status).toBe(401);
  });

  it("rate limits repeated authentication attempts", async () => {
    const limitedApp = express();
    limitedApp.use(createRateLimiter(2));
    limitedApp.get("/", (_req, res) => res.status(200).send("ok"));
    expect((await request(limitedApp).get("/")).status).toBe(200);
    expect((await request(limitedApp).get("/")).status).toBe(200);
    expect((await request(limitedApp).get("/")).status).toBe(429);
  });
});

afterAll(async () => prisma.$disconnect());

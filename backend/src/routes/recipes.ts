import { Router } from "express";
import { z } from "zod";
import { askClaude } from "../ai";
import { prisma } from "../db";
import { ok } from "../http";

/**
 * Recipe ideas for the fridge. With ANTHROPIC_API_KEY set, Claude suggests meals
 * from what the parent has been logging; otherwise a small built-in library is used.
 *
 * Safety: the model sees *which* things were logged (hormone names, measurement
 * types, life stage, whether baby is breastfed), never the values. It is told not
 * to diagnose or read meaning into results, and every response carries a notice.
 */
export const recipesRouter = Router();

const notice = "General food ideas, not medical or nutrition advice. Logged hormone values are never interpreted. Check with your doctor or a registered dietitian about allergies, medications, or specific dietary needs.";

const idea = z.object({
  title: z.string().min(1).max(80),
  why: z.string().min(1).max(220),
  minutes: z.number().int().min(1).max(240),
  ingredients: z.array(z.string().min(1).max(80)).min(2).max(12),
  steps: z.array(z.string().min(1).max(240)).min(1).max(8),
});
const ideasShape = z.object({ ideas: z.array(idea).min(1).max(4) });
type Idea = z.infer<typeof idea>;

type Context = {
  stage: "postpartum" | "cycle" | "pregnancy" | "not set up";
  breastfeeding: boolean;
  babyAgeMonths: number | null;
  hormonesLogged: string[];
  measurementsLogged: string[];
};

const HORMONE_NAMES: Record<string, string> = { lh: "LH", hcg: "hCG", estrogen: "estrogen", progesterone: "progesterone", fsh: "FSH", other: "other hormone" };

async function contextFor(userId: string): Promise<Context> {
  const since = new Date(Date.now() - 30 * 24 * 3600_000);
  const [profile, baby] = await Promise.all([
    prisma.maternalProfile.findUnique({ where: { userId } }),
    prisma.baby.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);
  const [hormones, measurements, breastFeeds] = await Promise.all([
    profile ? prisma.hormoneMeasurement.findMany({ where: { maternalProfileId: profile.id, measuredAt: { gte: since } }, select: { hormone: true }, distinct: ["hormone"] }) : [],
    profile ? prisma.healthMeasurement.findMany({ where: { maternalProfileId: profile.id, measuredAt: { gte: since } }, select: { type: true }, distinct: ["type"] }) : [],
    baby ? prisma.feedingSession.count({ where: { babyId: baby.id, feedingType: "breast_milk", startTime: { gte: new Date(Date.now() - 7 * 24 * 3600_000) } } }) : 0,
  ]);
  const mode = profile?.trackingMode;
  return {
    stage: mode === "pregnancy" ? "pregnancy" : mode === "menstrual" ? "cycle" : mode === "postpartum" ? "postpartum" : baby ? "postpartum" : "not set up",
    breastfeeding: breastFeeds > 0,
    babyAgeMonths: baby ? Math.max(0, Math.floor((Date.now() - baby.birthDate.getTime()) / (30.44 * 24 * 3600_000))) : null,
    hormonesLogged: hormones.map((h) => HORMONE_NAMES[h.hormone] ?? h.hormone),
    measurementsLogged: measurements.map((m) => m.type.replace("_", " ")),
  };
}

const SYSTEM = `You suggest simple home recipes for a parent using a baby-care app.
Rules:
- Suggest 3 practical recipes for a tired parent: short ingredient lists, mostly under 30 minutes, ideally one-handed or make-ahead.
- Use the context (life stage, whether they are breastfeeding, what kinds of things they have been tracking) only to choose generally nourishing, everyday foods.
- You are NOT given hormone or measurement values. Never guess, diagnose, or say anything about their hormone levels, fertility, blood pressure, blood sugar, or weight. Never promise a food will change a hormone, milk supply, or a symptom.
- If pregnant: avoid raw or undercooked fish, meat and eggs, unpasteurised dairy, and high-mercury fish. Avoid alcohol in every case.
- "why" is one friendly sentence about why it suits a busy day at this stage (e.g. "Make-ahead and easy to eat with one hand"), with no health claims.
Reply with JSON only, no prose: {"ideas":[{"title":"","why":"","minutes":20,"ingredients":[""],"steps":[""]}]}`;

async function fromClaude(ctx: Context): Promise<Idea[] | null> {
  const text = await askClaude(SYSTEM, `Context: ${JSON.stringify(ctx)}`, 1500);
  if (!text) return null;
  try {
    return ideasShape.parse(JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1))).ideas;
  } catch {
    return null;
  }
}

const LIBRARY: (Idea & { for: Context["stage"][] })[] = [
  { for: ["postpartum", "cycle", "not set up"], title: "Red lentil & spinach soup", why: "One pot, freezes well, and reheats in minutes.", minutes: 30, ingredients: ["1 cup red lentils", "1 onion", "2 garlic cloves", "1 can chopped tomatoes", "4 cups stock", "2 handfuls spinach", "Lemon"], steps: ["Soften the chopped onion and garlic in a little oil.", "Add lentils, tomatoes and stock; simmer 20 minutes.", "Stir in spinach until wilted, then add a squeeze of lemon."] },
  { for: ["postpartum", "cycle", "pregnancy", "not set up"], title: "Overnight oats with nut butter", why: "Made the night before, eaten with one hand in the morning.", minutes: 5, ingredients: ["1/2 cup rolled oats", "1/2 cup milk or yogurt", "1 tbsp nut butter", "1 tbsp chia seeds", "Berries"], steps: ["Stir oats, milk, chia and nut butter together in a jar.", "Refrigerate overnight.", "Top with berries in the morning."] },
  { for: ["postpartum", "cycle", "pregnancy", "not set up"], title: "Sheet-pan salmon & sweet potato", why: "One tray, ten minutes of hands-on time.", minutes: 30, ingredients: ["2 salmon fillets", "2 sweet potatoes", "1 head broccoli", "Olive oil", "Lemon", "Salt & pepper"], steps: ["Roast cubed sweet potato at 425°F / 220°C for 10 minutes.", "Add broccoli florets and salmon, drizzle with oil, season.", "Roast 12–15 minutes until the salmon is cooked through; finish with lemon."] },
  { for: ["postpartum", "not set up"], title: "Egg & veggie muffin cups", why: "Bake a batch and grab two whenever you get a minute.", minutes: 25, ingredients: ["8 eggs", "1 bell pepper", "Handful of spinach", "1/2 cup grated cheese", "Salt & pepper"], steps: ["Whisk eggs; stir in chopped pepper, spinach and cheese.", "Pour into a greased muffin tin.", "Bake at 350°F / 180°C for 18–20 minutes until set."] },
  { for: ["pregnancy"], title: "Chicken, rice & veg bowls", why: "Simple, well-cooked and easy to batch for the week.", minutes: 30, ingredients: ["2 chicken breasts", "1 cup rice", "Frozen peas & corn", "Soy sauce", "Sesame oil"], steps: ["Cook the rice.", "Slice chicken and cook through in a hot pan.", "Add frozen veg until hot; season with soy and a drop of sesame oil and serve over rice."] },
];

recipesRouter.post("/recipes/ideas", async (req, res, next) => {
  try {
    const ctx = await contextFor(req.authUserId!);
    const ai = await fromClaude(ctx);
    const ideas = ai ?? LIBRARY.filter((r) => r.for.includes(ctx.stage)).slice(0, 3).map(({ for: _for, ...r }) => r);
    ok(res, { ideas, source: ai ? "ai" : "library", basedOn: { stage: ctx.stage, breastfeeding: ctx.breastfeeding, hormonesLogged: ctx.hormonesLogged }, notice });
  } catch (e) { next(e); }
});

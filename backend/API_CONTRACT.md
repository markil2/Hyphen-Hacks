# Nurture API Contract

Base URL: `http://localhost:8000/api`. JSON request and response bodies use UTF-8. Except for health, registration, and login, endpoints require `Authorization: Bearer <JWT>`. In local `DEMO_MODE=true`, an omitted token uses the seeded fictional parent.

## Response envelope

Success:

```json
{ "success": true, "data": {}, "message": "Operation completed successfully" }
```

Error:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Invalid request data", "details": {} } }
```

Typical status codes are `200`, `201`, `400`, `401`, `404`, `409`, `429`, and `500`. IDs are opaque strings. All timestamps are ISO-8601 strings. List endpoints return `{ items, pagination: { page, limit, total, pages } }`; `page` defaults to 1 and `limit` to 20 (maximum 100).

## Health and authentication

| Method | Path | Body / query | Result |
|---|---|---|---|
| GET | `/health` | none | `{ status, demoMode }` |
| POST | `/auth/register` | `{ name, email, password }` (password 8–128 chars) | unverified user and email-delivery acknowledgement |
| POST | `/auth/verify-email` | `{ token }` | verified user and JWT |
| POST | `/auth/resend-verification` | `{ email }` | generic delivery acknowledgement |
| POST | `/auth/login` | `{ email, password }` | `{ user, token }` |
| POST | `/auth/forgot-password` | `{ email }` | generic delivery acknowledgement |
| POST | `/auth/reset-password` | `{ token, password }` | reset acknowledgement |
| GET | `/auth/me` | none | authenticated user |

```json
POST /auth/register
{ "name": "Parent Name", "email": "parent@example.com", "password": "long-password" }
```

Registration creates a separate user account and a default family household, then emails a 24-hour verification link. It does not return a JWT until verification succeeds. Password-reset links expire after one hour. Production responses never include raw tokens; `developmentToken` is returned only when `EMAIL_PROVIDER=console`.

## Family accounts

| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/families` | none | current user's active memberships, babies, and members |
| POST | `/families` | `{ name }` | new family with caller as owner |
| PATCH | `/families/:familyId` | `{ name }` | renamed family; owner only |
| GET | `/families/:familyId/members` | none | active members |
| POST | `/families/:familyId/invitations` | `{ email, role }` | expiring invitation email |
| POST | `/families/invitations/accept` | `{ token }` | active membership |
| DELETE | `/families/:familyId/invitations/:invitationId` | none | revoke invitation; owner only |
| PATCH | `/families/:familyId/members/:membershipId` | `{ role }` | change role; owner only |
| DELETE | `/families/:familyId/members/:membershipId` | none | leave or revoke member access |

Roles are `owner`, `parent`, and `caregiver`. Owners manage roles, revoke invitations, remove other members, and delete baby profiles. Parents may update baby profiles, invite parents/caregivers, and record care. Caregivers may view shared babies and record or update care events, but cannot manage the family or baby profile. Invitations are bound to the invited email, expire after seven days, are single-use, and cannot be duplicated while an active invitation is pending. Every adult uses a separate login. Maternal records remain private to their individual account. The last owner cannot leave until ownership is transferred. Removing a parent revokes future shared-family access but preserves the baby's records for remaining members.

## Account settings and privacy

| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/settings/account` | none | account and family memberships |
| PATCH | `/settings/account` | `{ name? }` or `{ email, currentPassword }` | updated account; changed email requires verification |
| PATCH | `/settings/password` | `{ currentPassword, newPassword }` | password changed |
| GET | `/settings/privacy` | none | current policy version and consent history |
| POST | `/settings/privacy/consent` | `{ policyVersion }` | versioned consent record |
| GET | `/settings/export` | none | JSON export of personal and accessible family data |
| DELETE | `/settings/account` | `{ password, confirmation: "DELETE MY ACCOUNT" }` | account deletion/anonymization |

Exports omit password hashes and credentials. Account deletion removes private maternal records, questions, consultation requests, tokens, consents, and memberships. It anonymizes the user record so shared baby rows created by that user can remain available to other active family members.

## Babies

| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/babies` | `{ name, birthDate, familyId?, sexAtBirth?, initialWeight?, weightUnit?, initialHeight?, heightUnit? }` | created baby |
| GET | `/babies` | none | current parent's babies |
| GET | `/babies/:babyId` | none | baby |
| PATCH | `/babies/:babyId` | any of `{ name, birthDate }` | updated baby |
| DELETE | `/babies/:babyId` | none | deleted ID |

`birthDate` cannot be in the future. A parent receives `BABY_NOT_FOUND` rather than another family's record.

`sexAtBirth` is optional and may be `female`, `male`, `intersex`, or `not_recorded`. Weight units are `kg`, `lb`, or `oz`; height units are `cm` or `in`. Calibration values are parent-entered records, not medical interpretations.

## Sleep

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/babies/:babyId/sleep/start` | `{ startTime?, notes? }` | new active session |
| POST | `/babies/:babyId/sleep/stop` | `{ endTime? }` | `{ session, alreadyStopped }` |
| GET | `/babies/:babyId/sleep` | `page?`, `limit?`, `from?`, `to?` | paginated sessions, newest first |
| GET | `/babies/:babyId/sleep/active` | none | active session or `null` |
| PATCH | `/sleep/:sessionId` | any of `{ startTime, endTime, notes }`; `endTime` may be `null` | updated session |
| DELETE | `/sleep/:sessionId` | none | deleted ID |

Only one active sleep session may exist per baby. This rule is enforced by the database as well as the API, so concurrent start requests produce one success and one `409 SLEEP_ALREADY_ACTIVE` response.

```json
POST /babies/baby_id/sleep/start
{ "startTime": "2026-10-10T20:00:00.000Z", "notes": "Parent-recorded bedtime" }
```

Only one active session is allowed per baby (`SLEEP_ALREADY_ACTIVE`, 409). Stop is idempotent: if none is active it returns 200 with `alreadyStopped: true`. Completed sessions contain integer `durationMinutes`; invalid ranges are rejected.

## Feedings

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/babies/:babyId/feedings` | feeding body below | created feeding |
| GET | `/babies/:babyId/feedings` | `page?`, `limit?`, `from?`, `to?`, `type?` | paginated feedings |
| PATCH | `/feedings/:feedingId` | partial feeding body | updated feeding |
| DELETE | `/feedings/:feedingId` | none | deleted ID |
| GET | `/babies/:babyId/feeding-summary` | `date?` (`YYYY-MM-DD`), `timezoneOffsetMinutes?` | daily entries, count, and totals by type/unit |

```json
{
  "feedingType": "formula",
  "feedingMethod": "bottle",
  "milkType": "formula",
  "amount": 120,
  "unit": "ml",
  "foodName": null,
  "startTime": "2026-10-10T18:00:00.000Z",
  "endTime": null,
  "notes": null
}
```

`feedingType` is `breast_milk`, `formula`, or `solids`; `feedingMethod` is `breast`, `bottle`, or `solid`; `milkType` is `breast_milk`, `formula`, or `mixed`. Unit is `ml`, `oz`, `g`, or `serving`. Bottle entries require `milkType`; solids require `foodName` and may include `foodDescription`. `startTime` defaults to now. Supplying an amount requires a unit.

## Diapers

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/babies/:babyId/diapers` | `{ type, timestamp?, notes? }` | created entry |
| GET | `/babies/:babyId/diapers` | `page?`, `limit?` | paginated entries |
| PATCH | `/diapers/:id` | partial entry | updated entry |
| DELETE | `/diapers/:id` | none | deleted ID |

`type` is `wet`, `dirty`, or `mixed`; timestamp defaults to now.

## Dashboard and timeline

| Method | Path | Query | Result |
|---|---|---|---|
| GET | `/babies/:babyId/dashboard` | `timezoneOffsetMinutes?` | baby, latest feeding/sleep/height, active sleep, today's sleep minutes/feedings, recent diapers/questions, day bounds |
| GET | `/babies/:babyId/timeline` | `limit?` (1–100) | reverse-chronological `{ type, timestamp, data }[]` |

Daily boundaries are calculated from `timezoneOffsetMinutes` using JavaScript's convention: UTC = 0, locations west of UTC are positive. The response includes the exact UTC `start` and `end` used.

## Nursery measuring stick

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/babies/:babyId/heights` | `{ height, unit, measuredAt?, notes? }` | created height measurement |
| GET | `/babies/:babyId/heights` | `page?`, `limit?` | reverse-chronological height history and latest entry |
| GET | `/babies/:babyId/heights/latest` | none | latest measurement or `null` |
| PATCH | `/heights/:id` | any of `{ height, unit, measuredAt, notes }` | corrected measurement |
| DELETE | `/heights/:id` | none | deleted ID |

```json
{
  "height": 66.2,
  "unit": "cm",
  "measuredAt": "2026-10-10T12:00:00.000Z",
  "notes": "Measured using the nursery ruler"
}
```

Units are `cm` or `in`. When omitted, `measuredAt` defaults to the current time. The dashboard returns `latestHeight`, and timeline entries use `type: "height"`. These are parent-recorded observations; the API does not calculate percentiles, diagnose growth concerns, or interpret development. The frontend owns ruler tick marks, animations, hit areas, and marker placement.

## Developmental milestones and baby health

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/babies/:babyId/milestones` | `{ type, title, achievedAt, notes? }` | created milestone |
| GET | `/babies/:babyId/milestones` | `page?`, `limit?`, `type?` | milestone history |
| PATCH | `/milestones/:id` | partial milestone fields | corrected milestone |
| DELETE | `/milestones/:id` | none | deleted ID |
| POST | `/babies/:babyId/health` | `{ type, value?, unit?, severity?, notes?, observedAt? }` | created observation |
| GET | `/babies/:babyId/health` | `page?`, `limit?`, `type?` | health-observation history |
| DELETE | `/baby-health/:id` | none | deleted ID |

Milestone types include `rolling`, `sitting`, `crawling`, `standing`, `walking`, `first_word`, `talking`, `social`, `motor`, and `other`. Health-observation types are `temperature`, `symptom`, `medication`, `appointment`, and `general`. These parent-entered records appear in `recentMilestones` and `recentHealth` on the dashboard and as `milestone` or `health` timeline events.

These endpoints do not determine developmental delay, assess symptoms, or provide treatment. The nursery zoom, baby-monitor camera treatment, retro display, and interactive controls belong to the frontend; the dashboard supplies their persistent data.

## Questions and expert matching

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/questions` | `{ babyId?, question, category }` | question and safety notice |
| GET | `/questions` | `page?`, `limit?`, `status?`, `category?` | parent's questions |
| GET | `/questions/:id` | none | parent's question |
| POST | `/questions/:id/match-experts` | none | specialties, fictional experts, resources, matching method, safety notice |
| GET | `/experts` | `page?`, `limit?`, `specialty?`, `serviceCategory?`, `audience?` | public external listings plus fictional matching profiles |
| GET | `/experts/categories` | none | available service categories and audiences |
| GET | `/experts/:id/contact-options` | none | explicit phone/email/website options and external-contact notice |
| GET | `/experts/:id` | none | expert-directory record and affiliation notice |

Categories are `feeding`, `sleep`, `development`, `health`, and `general`. Questions must be 10–3000 characters. Matching is deterministic category routing, not AI, diagnosis, treatment, or medical triage. Potentially urgent wording returns `mayBeUrgent: true` and directs the parent toward immediate qualified care; absence of that flag is not reassurance.

Expert-directory filtering also accepts `serviceCategory` and `audience`. Audiences are `parent`, `baby_child`, and `family`. Seeded categories include `lactation`, `nutrition`, `sleep`, `newborn_care`, `perinatal_mental_health`, `postpartum_doula`, `pediatric_therapy`, `occupational_therapy`, `early_intervention`, and `pediatrics`.

Public listings use `affiliationStatus: "external_unpartnered"`. Qualifications in these records are descriptions from linked public sources and are not independently verified or endorsed by Nurture. The client should display the returned directory notice. `contact-options` returns only contact fields explicitly present on the record:

```json
{
  "expertId": "expert_id",
  "options": [
    { "type": "phone", "value": "510-555-0100" },
    { "type": "website", "value": "https://provider.example/contact" }
  ],
  "affiliationStatus": "external_unpartnered",
  "contactNotice": "Contact goes to an external provider..."
}
```

The backend does not send email directly, promise that a provider will reply, or transmit private tracking records. A client may use these options to open the device's phone, browser, or email composer. Consultation requests remain local demonstration records until an approved delivery integration and provider consent are established.

```json
POST /questions
{ "babyId": "baby_id", "question": "How can I establish a bedtime routine?", "category": "sleep" }
```

## Consultations

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/consultations` | `{ expertId, questionId?, message }` | stored request plus demo notice |
| GET | `/consultations` | `page?`, `limit?`, `status?` | parent's requests |
| GET | `/consultations/:id` | none | parent's request |
| PATCH | `/consultations/:id/status` | `{ status }` | updated request |

Statuses are `pending`, `accepted`, `completed`, and `cancelled`. Messages must be 10–3000 characters. The current hackathon workflow only persists demonstration requests; it does not contact a professional or fabricate a response.

## Nutrition and resources

| Method | Path | Query | Result |
|---|---|---|---|
| GET | `/nutrition/products` | `page?`, `limit?`, `category?`, `brand?` | sample products and disclaimer |
| GET | `/nutrition/products/:id` | none | sample product and disclaimer |
| GET | `/nutrition/search` | required `q`, plus pagination/category/brand | name/category/brand matches |
| GET | `/nutrition/categories` | none | sorted category strings |
| GET | `/resources` | `page?`, `limit?`, `category?` | source-linked educational resources |
| GET | `/baby-products` | `page?`, `limit?`, `category?`, `brand?` | sample product directory |
| GET | `/baby-products/categories` | none | baby-product categories |
| GET | `/baby-products/:id` | none | product details and safety disclaimer |

Nutrition entries are sample interface data, not endorsements or medical recommendations. Their source URLs and guidance/disclaimer fields must be displayed by clients when product details are shown.

Baby products use explicit `expertReviewStatus` and `reviewNotes`. Seed records are fictional samples marked `not_reviewed`; that field must not become an endorsement unless a qualified reviewer completes and documents a review. Clients must preserve the returned recall, manufacturer-guidance, and suitability disclaimer.

## Maternal tracking

All maternal routes belong to the authenticated parent and never accept a user ID from the client. Responses include a reminder that tracking is informational and does not provide diagnosis, treatment, emergency monitoring, or medical care.

### Setup

| Method | Path | Body | Result |
|---|---|---|---|
| PUT | `/maternal/profile` | setup body below | creates or replaces the parent's setup |
| GET | `/maternal/profile` | none | current setup |

Menstrual setup:

```json
{
  "trackingMode": "menstrual",
  "lastPeriodStartDate": "2026-10-01",
  "averageCycleLength": 28,
  "averagePeriodDays": 5,
  "multiplesCount": 1
}
```

Pregnancy setup:

```json
{
  "trackingMode": "pregnancy",
  "estimatedDueDate": "2027-05-20",
  "multiplesCount": 2
}
```

Postpartum setup needs only `{ "trackingMode": "postpartum" }`. It lets a parent record health measurements after birth without cycle or pregnancy details.

`multiplesCount` is 1–5 and records singleton/twin/triplet context. It never adjusts or predicts hormone values.

### Menstrual daily logs

| Method | Path | Body / query | Result |
|---|---|---|---|
| PUT | `/maternal/menstrual/daily` | daily body; one upserted record per date | saved log |
| GET | `/maternal/menstrual/daily` | `page?`, `limit?`, `from?`, `to?` | parent's logs |

```json
{
  "date": "2026-10-10",
  "bleedingIntensity": "light",
  "basalTemperature": 98.1,
  "temperatureUnit": "F",
  "cervicalMucus": "creamy",
  "lhTestResult": "negative",
  "lhPhotoReference": "private-object-key/lh-strip-123",
  "notes": null
}
```

Bleeding options: `none`, `spotting`, `light`, `medium`, `heavy`. Cervical mucus options: `dry`, `sticky`, `creamy`, `watery`, `egg_white`, `other`. LH options: `not_taken`, `negative`, `positive`, `unclear`. The photo field is a private storage reference—not a public URL or an image upload endpoint.

### Pregnancy daily logs

| Method | Path | Body / query | Result |
|---|---|---|---|
| PUT | `/maternal/pregnancy/daily` | daily body; one upserted record per date | saved log |
| GET | `/maternal/pregnancy/daily` | `page?`, `limit?`, `from?`, `to?` | parent's logs |

```json
{
  "date": "2026-10-10",
  "nauseaVomiting": "nausea",
  "fatigue": "moderate",
  "brainFog": "mild",
  "mood": "mixed",
  "anxiety": "mild",
  "notes": null
}
```

Nausea/vomiting uses exactly three options: `none`, `nausea`, `vomiting`. Fatigue, brain fog, and anxiety use `none`, `mild`, `moderate`, `severe`. Mood uses `very_low`, `low`, `neutral`, `good`, `very_good`, `mixed`. These fields do not provide therapy or crisis assessment.

### Health measurements

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/maternal/health` | measurement body | created measurement |
| GET | `/maternal/health` | `page?`, `limit?`, `type?` | parent's measurements |
| DELETE | `/maternal/health/:id` | none | deleted ID |

Blood pressure uses `{ "type": "blood_pressure", "systolic": 110, "diastolic": 70, "context": "resting", "measuredAt": "..." }`. Weight uses `value` plus `kg` or `lb`; blood glucose uses `value` plus `mg/dL` or `mmol/L`. Glucose context may be `unspecified`, `fasting`, `before_meal`, or `after_meal`.

### Hormone measurements

| Method | Path | Body / query | Result |
|---|---|---|---|
| POST | `/maternal/hormones` | `{ hormone, value, unit, measuredAt?, source?, notes? }` | created measurement |
| GET | `/maternal/hormones` | `page?`, `limit?`, `hormone?` | parent's measurements |
| DELETE | `/maternal/hormones/:id` | none | deleted ID |

Hormones: `lh`, `hcg`, `estrogen`, `progesterone`, `fsh`, `other`. Sources: `lab`, `home_test`, `manual_entry`, `other`. Values and units are retained exactly as entered; the API does not assign expected ranges, diagnose from trends, or adjust results for twins/triplets.

## Fridge, statistics, scale and shop

| Method | Path | Body / query | Result |
|---|---|---|---|
| GET | `/families/:familyId/notes` | none | `{ items }`: the family's fridge notes, newest first, each with `author { name }` and `mine` |
| POST | `/families/:familyId/notes` | `{ body (1–1000), color? }` (`cream`, `sage`, `blue`, `terracotta`) | `{ note }` |
| DELETE | `/notes/:id` | none | deleted ID; only the author can remove a note (others get 404) |
| POST | `/recipes/ideas` | none | `{ ideas[], source: "ai" \| "library", basedOn, notice }` |
| GET | `/babies/:babyId/summary` | none | `{ summary, source: "ai" \| "logs", facts[] }` |
| GET | `/babies/:babyId/stats` | `days?` (1–60, default 14), `timezoneOffsetMinutes?` | `{ daily[], last24h, previous24h, heights[], weights[] }` |
| POST | `/babies/:babyId/weights` | `{ weight, unit: "kg" \| "lb", measuredAt?, notes? }` | `{ measurement }` |
| GET | `/babies/:babyId/weights` | `page?`, `limit?` | weight history, newest first |
| PATCH / DELETE | `/weights/:id` | partial fields / none | corrected measurement / deleted ID |
| GET | `/foods/search` | `q` (2–80 chars), `baby?` (`true` limits to baby foods) | `{ items[], source: "Open Food Facts" }`: name, brand, image, labelled allergens, link |
| GET | `/shop/products` | none | `{ items[], notice }`: a curated list of baby-food brands linking to their own stores |

Recipe ideas and the baby summary use Claude when `ANTHROPIC_API_KEY` is set, and fall back to a built-in recipe list and a plain sentence built from the logs otherwise. Claude is given *which* things were logged (life stage, whether the baby is breastfed, hormone names, measurement types), never hormone or measurement values, and is instructed not to interpret, diagnose, or judge. Neither prompts nor replies are logged.

Statistics are counts and sums of what was logged; comparisons say only "more", "fewer" or "same". Weights follow the same rules as heights: stored exactly as entered, no percentiles. The shop is not sponsored, has no prices, and never handles payment. Maternal setup also accepts `{ "trackingMode": "postpartum" }`, which the app creates automatically the first time a parent logs a measurement or hormone result.

# Auth Module — Reference for Building Other Modules

This document is for whoever builds the **next** module (`donors`,
`transactions`, `festivals`, `settings`, ...). It explains exactly what the
auth module exposes, what each helper does, what it throws, and how to wire
a brand-new module into authentication/authorization without duplicating
any of this logic.

Everything here lives under `src/modules/auth/`. **Only import from
`src/modules/auth` (the barrel file, `index.ts`) — never reach into
`auth.repository.ts` or other internal files directly.** The barrel is the
module's public contract; internals can change without breaking you as long
as the barrel's shape stays the same.

```ts
import {
  authenticate,
  requireRole,
  getCurrentUser,
  authService,
} from "../auth";
import type { JwtPayload, SafeUser, LoginResult } from "../auth";
```

---

## 1. Protecting a new module's routes

Every other module follows the same three-line pattern in its `*.routes.ts`:

```ts
// src/modules/donors/donor.routes.ts
import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, requireRole } from "../auth";
import { validate } from "../../middleware/validation.middleware";
import { createDonorSchema } from "./donor.schema";
import { createDonor, listDonors, deleteDonor } from "./donor.controller";

const router = Router();

// Any authenticated user (ADMIN or VOLUNTEER) can list/create donors
router.get("/", authenticate, listDonors);
router.post("/", authenticate, validate(createDonorSchema), createDonor);

// Only ADMIN can delete a donor record
router.delete("/:id", authenticate, requireRole(UserRole.ADMIN), deleteDonor);

export default router;
```

Rules of thumb:

- **`authenticate` always comes first** in the middleware chain — it's what
  populates `req.user`. Nothing else in this list works without it.
- **`requireRole(...)` comes right after `authenticate`**, before
  `validate(...)`. Reject on identity/permission before you spend effort
  parsing the body.
- **A route with no `authenticate` at all is public.** Use this
  deliberately (like `POST /auth/login`), not by omission.
- Then mount the router in `src/routes/index.ts`:
  ```ts
  import donorRoutes from "../modules/donors/donor.routes";
  router.use("/donors", donorRoutes);
  ```

---

## 2. `authenticate` — verify the JWT, populate `req.user`

```ts
function authenticate(req: Request, res: Response, next: NextFunction): void
```

- Reads `Authorization: Bearer <token>`.
- On success: sets `req.user: JwtPayload` and calls `next()`.
- On failure: calls `next(new UnauthorizedError(...))` — **it never throws
  directly**, so you never need a try/catch around it. Missing header,
  malformed header, empty token, invalid signature, and expired token all
  produce the same `401` with a generic message (deliberately — don't leak
  *why* a token failed).

You will basically never call this yourself outside a route definition; it's
middleware, not a utility function.

---

## 3. `requireRole(...roles)` — RBAC gate

```ts
function requireRole(...allowedRoles: UserRole[]): RequestHandler
```

- A **factory**: call it with the roles allowed to proceed, get back a
  middleware.
- Must run **after** `authenticate` (it reads `req.user`, and calls
  `next(new UnauthorizedError(...))` if that's missing — i.e. if you forgot
  `authenticate` on the route, you'll find out immediately in testing).
- If `req.user.role` isn't in the allowed list, calls
  `next(new ForbiddenError(...))` → `403`.
- Accepts any number of roles:
  ```ts
  requireRole(UserRole.ADMIN)                          // ADMIN only
  requireRole(UserRole.ADMIN, UserRole.VOLUNTEER)       // either
  ```

**When a new role is added later** (e.g. `ACCOUNTANT`), you don't touch this
function. Add the enum value to `prisma/schema.prisma`, run a migration, add
it to `ALL_ROLES` in `auth.constants.ts`, and list it on whichever routes
should accept it.

---

## 4. `getCurrentUser(req)` — read the caller inside a controller/service

```ts
function getCurrentUser(req: Request): JwtPayload
```

- Returns `req.user` if `authenticate` already ran (throws
  `UnauthorizedError` if it didn't — this is a real `throw`, not a
  `next(...)` call, because it's meant to be used *inside* an
  `asyncHandler`-wrapped controller, where a thrown error is automatically
  forwarded to the error middleware).
- This is how a new module's controller finds out *who's calling*:

  ```ts
  // src/modules/donors/donor.controller.ts
  export const createDonor = asyncHandler(async (req, res) => {
    const currentUser = getCurrentUser(req); // { userId, role, email }
    const donor = await donorService.create(req.body, currentUser.userId);
    ApiResponse.send(res, { statusCode: 201, message: "Donor created", data: donor });
  });
  ```

  Never read `req.user` directly in a controller — always go through
  `getCurrentUser(req)` so the "what if auth didn't run" case is handled in
  one place, not reimplemented per module.

---

## 5. `JwtPayload` — what you actually know about the caller

```ts
interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}
```

This is **all** that's available from `getCurrentUser`/`req.user` — no
`name`, no `mobile`, no `status`. It's deliberately minimal so a token can't
carry stale profile data. If your module needs more than `userId`/`role`
(e.g. the donor-creation flow wants to stamp the volunteer's name onto a
receipt), fetch it fresh:

```ts
const profile = await authService.getProfile(currentUser.userId); // SafeUser
```

`getProfile` re-checks the user is still `ACTIVE` and not soft-deleted, so
it also acts as a "is this session still valid" check, not just a lookup.

---

## 6. `authService` — the only auth business logic other modules should call

```ts
class AuthService {
  login(input: LoginInput): Promise<LoginResult>;
  register(input: RegisterInput, createdById: string): Promise<SafeUser>;
  getProfile(userId: string): Promise<SafeUser>;
}
```

Other modules will realistically only ever call **`getProfile`** (see §5).
`login`/`register` are consumed by `auth.controller.ts` itself — there's no
reason another module would call them directly.

If a future module needs "does this user still exist and is active" as a
building block (e.g. before assigning a donor to a volunteer), reuse
`authService.getProfile(userId)` rather than querying `prisma.user` directly
— it already encodes the active/soft-delete rules in one place.

---

## 7. `SafeUser` / `toSafeUser` — never leak `passwordHash`

```ts
type SafeUser = Omit<User, "passwordHash">;
function toSafeUser(user: User): SafeUser;
```

Any time a module fetches a `User` row via Prisma directly (e.g. to show
"created by" on a donor record) and puts it in an API response, run it
through `toSafeUser` first:

```ts
import { toSafeUser } from "../auth";

const donorWithCreator = {
  ...donor,
  createdBy: toSafeUser(rawUserRowFromPrisma),
};
```

---

## 8. Password & token helpers (`auth.utils.ts`)

These are used internally by `authService`. Reuse them if a future module
needs password/JWT behavior that isn't literally login/register — for
example, a password-reset feature would reuse `hashPassword`.

```ts
hashPassword(plainPassword: string): Promise<string>
comparePassword(plainPassword: string, passwordHash: string): Promise<boolean>
generateAccessToken(payload: JwtPayload): string
verifyAccessToken(token: string): JwtPayload   // throws UnauthorizedError on failure
```

- `hashPassword`/`comparePassword` wrap bcrypt with the salt-round count
  from `env.BCRYPT_SALT_ROUNDS` — never call `bcrypt` directly elsewhere in
  the codebase, always go through these so the cost factor stays consistent
  and configurable in one place.
- `verifyAccessToken` is what `authenticate` calls internally. You generally
  won't call it yourself — use `authenticate` as middleware instead.

---

## 9. Shared building blocks every module should reuse

These aren't auth-specific, but the auth module is the reference
implementation for how to use them — copy its patterns.

| From                              | What                                      | Use it for |
|------------------------------------|--------------------------------------------|------------|
| `shared/errors`                    | `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `InternalServerError` | `throw new NotFoundError("Donor not found")` — never a generic `Error` |
| `shared/responses` (`ApiResponse`) | `ApiResponse.send(res, { statusCode, message, data })` | Every successful controller response |
| `shared/utils` (`asyncHandler`)    | wraps an async controller so thrown errors reach the error middleware | Wrap every controller export |
| `shared/validators`                | `paginationSchema`, `idParamSchema`, `passwordSchema`, `mobileSchema` | Reuse instead of re-writing the same Zod rules per module |
| `middleware/validation.middleware` (`validate`) | `validate(schema)` / `validate(schema, "params")` | Every `POST`/`PATCH`/`PUT` route, and any route with param/query validation |

A new module's controller should look structurally identical to
`auth.controller.ts`: no `try/catch`, no Prisma, just
`asyncHandler(async (req, res) => { ...; ApiResponse.send(res, {...}); })`.

---

## 10. What NOT to import from the auth module

- **`auth.repository.ts`** — Prisma-only, internal to this module. If a new
  module needs user data, go through `authService.getProfile(userId)`, or
  build its **own** repository the same way this one is built (one
  repository per module, each owning its own slice of Prisma calls).
- **`auth.middleware.ts` internals beyond `authenticate`/`requireRole`/`getCurrentUser`**
  — there's nothing else in there meant for external use.
- **`AUTH_MESSAGES`** (`auth.constants.ts`) — these are login/register/me/logout-specific
  copy. Define your own module's user-facing messages in its own
  `*.constants.ts`, following the same naming pattern
  (`{MODULE}_MESSAGES.SOMETHING`).

---

## 11. Quick checklist for wiring a new module to auth

- [ ] Route file imports `authenticate`, `requireRole` from `"../auth"` (not from `auth.middleware.ts` directly)
- [ ] Every route decides: public, "any authenticated user", or `requireRole(...)`
- [ ] `authenticate` always precedes `requireRole`, which always precedes `validate`
- [ ] Controllers use `getCurrentUser(req)`, never `req.user` directly
- [ ] Controllers are wrapped in `asyncHandler`, use `ApiResponse.send`, never `res.json` directly
- [ ] Services throw the specific `shared/errors` class that matches the situation, never a bare `Error`
- [ ] If the module returns `User` rows in any response, they go through `toSafeUser` (or your module's own equivalent) first — `passwordHash` must never appear in a response body

# Pass 3 — React Patterns

Code quality review focusing on canonical React best practices, re-render correctness, state management, and component design.

**Scope:** All components with React hooks (TanStack Router project — no `"use client"` directives, all hook-using components are in scope).

**Components reviewed:** 8 files with hooks, plus all presentational components in `src/components/` and `src/routes/`.

---

## 1. Index Key on Dynamic List

**File:** `src/components/feed/poll-builder.tsx` (line 71)
**Issue:** [React] — `value.options.map((opt, i) => <div key={i}>)` uses array index as key on a list where items can be added, removed, and reordered via `addOption()`, `removeOption()`, and `updateOption()`.
**Impact:** High
**Fix:** Add stable IDs to poll options. Change the `PollDraft` type so `options` is `{ id: string; text: string }[]` instead of `string[]`, or use a composite key like `key={crypto.randomUUID()}` at creation time. At minimum, a stopgap of `key={\`${i}-${opt}\`}` avoids the worst mismatches, but real IDs are the correct solution.

---

## 2. Index Key on Static List (Acceptable)

**File:** `src/components/ui/circular-text.tsx` (line 126)
**Issue:** [React] — `letters.map((letter, i) => <span key={i}>)` uses index as key.
**Impact:** None — `letters` is derived from the `text` prop via `Array.from(text)` and is never reordered, filtered, or mutated. Index key is correct here.
**Fix:** No fix needed.

---

## 3. Inline Array Literals in JSX

**File:** `src/routes/_main/feed/index.tsx` (lines 41–45)
**Issue:** [React] — Sort button config array `[{ label: "Hot", icon: Flame }, ...]` is created inline inside the component body on every render.
**Impact:** Low — this route component doesn't re-render frequently (no state), and no memoized children consume this array.
**Fix:** Extract to a module-level constant:
```tsx
const SORT_OPTIONS = [
  { label: "Hot", icon: Flame },
  { label: "New", icon: Clock },
  { label: "Top", icon: TrendingUp },
] as const;
```

**File:** `src/routes/_main/events/$id.tsx` (lines 189–204)
**Issue:** [React] — Event details array `[{ label: "Type", value: event.gameType }, ...]` created inline.
**Impact:** Low — same reasoning as above, no frequent re-renders.
**Fix:** Since values depend on `event`, this is less extractable. Acceptable as-is given no re-render pressure.

---

## 4. ESLint Suppressed Hook Dependencies

**File:** `src/components/ui/letter-glitch.tsx` (line 184)
**Issue:** [React] — `eslint-disable-next-line react-hooks/exhaustive-deps` suppresses missing deps warning. The effect depends on `[glitchSpeed, smooth]` but also closes over `glitchColors`, `characters`, `charWidth`, `charHeight`, and several helper functions (`initializeLetters`, `drawLetters`, `updateLetters`, `handleSmoothTransitions`, `resizeCanvas`).
**Impact:** Medium — if `glitchColors` or `characters` props change without `glitchSpeed`/`smooth` also changing, the canvas will continue using stale values. Currently the component is used with static props, so this is latent.
**Fix:** Either add the missing props to the dependency array, or document why the suppression is intentional (e.g., "these props are expected to be static for the lifetime of the component"). The helpers are defined inside the component but outside the effect and reference refs, so they're safe as long as the refs are current.

---

## 5. Form State Could Use useReducer

**File:** `src/routes/_main/feed/new.tsx` (lines 19–24)
**Issue:** [React] — 6 separate `useState` calls for related form fields: `title`, `body`, `category`, `tagsInput`, `tags`, `poll`.
**Impact:** Medium — functionally correct, but as the form grows (validation errors, dirty tracking, submission state), managing 6+ independent state variables becomes error-prone. The `canSubmit` derived value (line 47) already combines multiple states.
**Fix:** Consider consolidating into `useReducer` or a form state object:
```tsx
const [form, setForm] = useReducer(
  (prev, next) => ({ ...prev, ...next }),
  { title: "", body: "", category: "", tagsInput: "", tags: [], poll: null }
);
```
This is a suggestion for future maintainability, not a current bug.

---

## 6. Uncancelled requestAnimationFrame

**File:** `src/components/feed/post-editor.tsx` (line ~91)
**Issue:** [React] — `requestAnimationFrame` used for cursor restoration after markdown insertion, without storing the frame ID for cancellation on unmount.
**Impact:** Low — this is a single-shot rAF (not a loop), and the callback only accesses a ref. The worst case is the callback firing after unmount on a null ref, which would be a no-op since the ref check guards it.
**Fix:** For completeness, store the frame ID and cancel in a cleanup, but this is not a practical concern.

---

## Good Patterns Observed

These areas were reviewed and found to follow best practices:

| Pattern | Status | Details |
|---------|--------|---------|
| Derived state | Correct | `comment-thread.tsx:18` — `score` computed inline, not stored in state |
| Derived state | Correct | `poll.tsx:30` — `maxVotes` computed in render |
| useEffect data fetching | None found | All data comes from mock imports or props |
| useEffect cleanup | Correct | `letter-glitch.tsx:180-183` — cancels rAF, removes resize listener |
| Stale closures | None found | `circular-text.tsx` uses `rotation.get()` (Framer Motion reactive value), not stale state |
| Prop drilling | Minimal | No props passed through more than 2 levels |
| Constants outside components | Correct | `TOOLBAR`, `EXPIRY_OPTIONS`, `navLinks`, `SORT_OPTIONS` all at module scope |
| Stable keys | Correct | All `.map()` calls except poll-builder use `.id`, `.href`, `.label`, or unique strings |
| useCallback/useMemo | Not needed | Component tree is shallow, no `React.memo` wrappers, no expensive computations |

---

## Summary

| Category | Issues | Impact |
|----------|--------|--------|
| Index keys (dynamic) | 1 | High |
| Inline literals | 2 | Low |
| Suppressed ESLint deps | 1 | Medium |
| Form state organization | 1 | Medium |
| Missing rAF cleanup | 1 | Low |
| **Total** | **6** | |

### Top Priority Fixes

1. **`poll-builder.tsx:71`** — Replace index keys with stable IDs on the dynamic options list. This is the only finding that can cause real bugs (state mismatches when options are added/removed).
2. **`letter-glitch.tsx:184`** — Add missing dependencies to the useEffect or document why the suppression is safe, to prevent stale prop values if the component is reused with dynamic props.
3. **`feed/index.tsx:41`** — Extract inline sort button array to module scope (quick cleanup).
4. **`feed/new.tsx:19-24`** — Consider `useReducer` when the form grows more complex (not urgent).

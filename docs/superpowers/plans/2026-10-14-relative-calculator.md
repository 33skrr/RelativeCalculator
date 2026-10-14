# Relative Calculator Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans in this session, task by task. No subagents are requested. Preserve existing spec edits; do not push or deploy.

**Goal:** Build the confirmed screenshot-based Chinese kinship calculator.

**Architecture:** Typed relation registry, independent deterministic calculation adapter, pure state reducer, and React UI. Test real calculations and state transitions before implementation, then verify rendered behavior in a browser.

**Tech Stack:** React, TypeScript, Vite, relationship.js 1.2.9 (MIT), Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-14-relative-calculator-design.md`

## Global Constraints

- 女生禁用“老公”、男生禁用“老婆”；仅关联顶部性别，不随链末端人物改变。
- “切换”仅切换称呼方向，保留从“我”出发的原始关系链。
- 去掉祝福语、AI计算、关系、设置、历史及手机系统状态栏。
- 浅灰底、白色圆角键、橙黄色强调；四列网格，“切换”和“＝”各占两格。
- 按等号才显示结果，编辑清除旧答案；已计算时切换方向或性别立即重算。
- 纯静态前端，无登录、后端、AI、自动部署或推送。
- Existing checkout has no executable code or baseline tests. Preserve design changes and use local feature branch `feat/calculator`.

## File Map

- `package.json`, lockfile, `.gitignore`, `index.html`, `tsconfig.json`, `vite.config.ts`: pinned tooling, relative build URLs and scripts.
- `src/calculator/relations.ts`: `Gender`, `Direction`, `RelationId`, registry, disabled predicate.
- `src/calculator/engine.ts`: `calculate(chain, gender, direction): CalculationResult`.
- `src/calculator/state.ts`: typed `CalculatorState`, actions and reducer.
- `src/types/relationship.d.ts`: dependency types if needed.
- `src/App.tsx`, `src/main.tsx`, `src/styles.css`: accessible responsive UI.
- `src/calculator/*.test.ts`, `src/App.test.tsx`, `src/test/setup.ts`: real-engine domain/UI tests.
- `playwright.config.ts`, `tests/calculator.spec.ts`: browser flows, screenshots and responsive checks.
- `README.md`, `THIRD_PARTY_NOTICES.md`: commands, behavior, limitations, MIT attribution.

### Task 1: Domain model and calculation

Consumes relationship.js documented `text`, `sex`, `reverse` options. Produces registry, `calculate(chain: readonly RelationId[], gender: Gender, direction: Direction): CalculationResult` and `calculatorReducer(state, action): CalculatorState`.

- [x] Inspect installed package README, license and browser entry; pin dependencies and retain lockfile. Set up TypeScript/Vite/Vitest.
- [x] Write real calculation fixtures before implementation:

```ts
expect(calculate(['father', 'olderBrother'], 'male', 'forward').names).toContain('伯父');
expect(calculate(['father', 'olderBrother'], 'male', 'reverse').names).toContain('侄子');
expect(calculate(['father', 'olderBrother'], 'female', 'reverse').names).toContain('侄女');
expect(calculate([], 'female', 'forward').names).toEqual(['自己']);
```

- [x] Run `npm test -- src/calculator/engine.test.ts` and observe missing implementation failure. Cover grandparents, descendants, uncles/aunts, cousins, in-laws, unresolved age and invalid paths with hand-derived literals.
- [x] Implement registry and adapter. Return `{ status: 'resolved', names: string[] }` or `{ status: 'unresolved', names: [], message: string }`; never throw into the UI. Preserve reasonable age candidates. Run tests green.
- [x] Write state/disabled tests before reducer:

```ts
expect(isRelationDisabled('husband', 'female')).toBe(true);
expect(isRelationDisabled('wife', 'male')).toBe(true);
expect(isRelationDisabled('husband', 'male')).toBe(false);
const s = { gender: 'male', chain: ['father'], direction: 'forward', calculated: true } as const;
expect(calculatorReducer(s, { type: 'toggleDirection' }).chain).toEqual(['father']);
expect(calculatorReducer(s, { type: 'append', relation: 'mother' }).calculated).toBe(false);
```

- [x] Run state tests red. Implement append/backspace/reset/sex/direction/calculate actions. Reset preserves gender and clears chain/calculated; change gender preserves chain. Disabled appends do nothing. Run domain tests green.

### Task 2: Screenshot UI

Consumes domain API. Produces default `App` and Vite entry.

- [x] Write real Testing Library flows before UI implementation: male disables 老婆, female disables 老公; 爸爸→哥哥→＝ shows 伯父; female reverse shows 侄女 and keeps chain; backspace clears result; reset preserves female and restores forward; sex change after reverse updates result.
- [x] Run UI tests red. Implement semantic input/result/keyboard regions, native disabled buttons, `aria-pressed` gender choices, polite announcements and visible focus.
- [x] Style `#ebebed` background, white rounded keys, screenshot-matched `#e7a336` accent, muted disabled keys; four-column grid and double-width switch/equals. Use flexible display space, `100svh`, safe-area padding, max desktop width, short-screen scroll, minimum 48px targets. No decorative assets.
- [x] Run `npm test`, `npm run typecheck`, `npm run build` green.

### Task 3: Browser verification and handoff

Consumes running Vite app. Produces browser-verified local app, screenshots and documentation.

- [x] Add Playwright/Vite webServer configuration. Click full flow and every control in real browser; verify no page/console errors. Test unresolved paths, cousin age ambiguity, reverse twice and keyboard navigation.
- [x] Check widths 320/390/1440 and short height 480, `document.documentElement.scrollWidth <= innerWidth`, all keys reachable. Capture initial male/female and calculated mobile plus desktop screenshots, inspect images and iterate styling.
- [x] Document install/dev/test/typecheck/build commands, pure-static architecture, exact gender rule and incomplete/ambiguous result handling. Retain MIT attribution.
- [x] Run fresh `npm test`, `npm run typecheck`, `npm run build`, `npm run test:browser`, `git diff --check`, `git status --short`; report real results and preview URL. Do not push/deploy.

## Self-Review

Requirements map to domain, UI or browser tests. Gender linkage intentionally follows user text rather than the screenshots. Library evaluation and explicit unresolved responses avoid pretending arbitrary genealogy reconstruction. No runtime network services required.

## Verification evidence — 2026-10-14

- Vitest: 36 tests passed. TypeScript check and production build passed.
- Playwright: 8 tests passed using locally installed Chrome after the bundled browser download stalled. Configuration defaults to bundled Chromium and supports a local fallback or explicit environment override.
- Read-only review found a favicon 404 and an extra relationship-chain prefix. Both were corrected and the full suite rerun; in-law reverse coverage was added.
- Mobile calculated and desktop screenshots visually inspected. All tested widths had no horizontal overflow; all controls were at least 48px in both dimensions.
- Work remains locally on `feat/calculator`; no push, merge or deployment performed. Preview: http://127.0.0.1:5173/.

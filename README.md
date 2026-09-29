# guard-condition

**Declarative conditional rendering for React.** Replace nested ternaries and `&&` chains with a readable `<Match>` / `<Match.When>` / `<Match.Default>` component: a `switch` / `if-else if-else` for JSX.

[![npm version](https://img.shields.io/npm/v/guard-condition.svg)](https://www.npmjs.com/package/guard-condition)
[![license](https://img.shields.io/npm/l/guard-condition.svg)](./LICENSE)
[![types](https://img.shields.io/badge/types-TypeScript-blue.svg)](https://www.typescriptlang.org/)

```bash
npm install guard-condition
# or
pnpm add guard-condition
# or
yarn add guard-condition
```

- Tiny: a single file, zero dependencies
- Written in TypeScript, ships with type definitions
- Works with React 16.8+ (hooks era) through React 19
- First match wins, just like `if / else if / else`
- Works with any UI library (Ant Design, MUI, Chakra, Tailwind, plain HTML)

---

## Why guard-condition?

Conditional rendering in React gets messy fast. A loading / empty / no-results / list screen usually ends up as a nested ternary:

```tsx
{isLoading ? (
  <Spin />
) : goals.length === 0 && !filters?.search?.trim() ? (
  <EmptyState title="No goals added" />
) : goals.length === 0 ? (
  <EmptyState title="No goals found" />
) : (
  goals.map((goal) => <GoalItem key={goal.id} goal={goal} />)
)}
```

Nested ternaries are hard to read, hard to diff, and easy to break. With `guard-condition`, the same logic reads top to bottom:

```tsx
import Match from "guard-condition";

<Match>
  <Match.When condition={isLoading}>
    <Spin />
  </Match.When>

  <Match.When condition={goals.length === 0 && !filters?.search?.trim()}>
    <EmptyState title="No goals added" />
  </Match.When>

  <Match.When condition={goals.length === 0}>
    <EmptyState title="No goals found" />
  </Match.When>

  <Match.Default>
    {goals.map((goal) => (
      <GoalItem key={goal.id} goal={goal} />
    ))}
  </Match.Default>
</Match>
```

## Quick start

```tsx
import Match from "guard-condition";

function Status({ status }: { status: "idle" | "loading" | "error" | "success" }) {
  return (
    <Match>
      <Match.When condition={status === "loading"}>
        <p>Loading…</p>
      </Match.When>
      <Match.When condition={status === "error"}>
        <p>Something went wrong.</p>
      </Match.When>
      <Match.When condition={status === "success"}>
        <p>Done!</p>
      </Match.When>
      <Match.Default>
        <p>Nothing to show yet.</p>
      </Match.Default>
    </Match>
  );
}
```

## API

### `<Match>`

Container. Looks at its direct children in order and renders the content of the **first** `<Match.When>` whose `condition` is truthy. If none match, it renders `<Match.Default>` (if present), otherwise `null`.

### `<Match.When condition={boolean}>`

| Prop        | Type        | Description                                  |
| ----------- | ----------- | -------------------------------------------- |
| `condition` | `boolean`   | Renders `children` if this is the first match |
| `children`  | `ReactNode` | Content to render                            |

### `<Match.Default>`

Fallback content, like `else` or `default:`. **Place it last**: `Match` returns as soon as it reaches a `Default`, so any `When` placed after it is never evaluated.

## Use cases

### 1. Loading / error / empty / data states

The most common case for data-fetching UIs (React Query, SWR, Apollo, RTK Query):

```tsx
<Match>
  <Match.When condition={isLoading}><Skeleton /></Match.When>
  <Match.When condition={isError}><ErrorMessage error={error} /></Match.When>
  <Match.When condition={data?.length === 0}><EmptyState /></Match.When>
  <Match.Default><DataTable rows={data} /></Match.Default>
</Match>
```

### 2. Role / permission based UI

```tsx
<Match>
  <Match.When condition={user.role === "admin"}><AdminPanel /></Match.When>
  <Match.When condition={user.role === "editor"}><EditorTools /></Match.When>
  <Match.Default><ReadOnlyView /></Match.Default>
</Match>
```

### 3. Auth gates

```tsx
<Match>
  <Match.When condition={!isAuthReady}><Spinner /></Match.When>
  <Match.When condition={!isLoggedIn}><LoginForm /></Match.When>
  <Match.Default><Dashboard /></Match.Default>
</Match>
```

### 4. Multi-step forms and wizards

```tsx
<Match>
  <Match.When condition={step === 1}><AccountStep /></Match.When>
  <Match.When condition={step === 2}><ProfileStep /></Match.When>
  <Match.When condition={step === 3}><ReviewStep /></Match.When>
</Match>
```

### 5. Feature flags and A/B tests

```tsx
<Match>
  <Match.When condition={flags.newCheckout}><NewCheckout /></Match.When>
  <Match.Default><LegacyCheckout /></Match.Default>
</Match>
```

### 6. Responsive rendering

```tsx
<Match>
  <Match.When condition={isMobile}><MobileNav /></Match.When>
  <Match.When condition={isTablet}><TabletNav /></Match.When>
  <Match.Default><DesktopNav /></Match.Default>
</Match>
```

## Comparison

### vs. ternaries and `&&`

| | Nested ternary | `&&` chains | **guard-condition** |
| --- | --- | --- | --- |
| Readable with 3+ branches | ❌ | ❌ | ✅ |
| Explicit "else" | ✅ | ❌ | ✅ |
| Mutually exclusive branches | ✅ | ❌ (each `&&` is independent) | ✅ |
| Clean diffs when adding a branch | ❌ | ⚠️ | ✅ |
| Risk of rendering `0` / `""` by accident | – | ⚠️ (`count && <X/>`) | ✅ (`condition` is a boolean) |

## Things to know

- **Direct children only.** `Match` inspects its direct children, so `Match.When` / `Match.Default` must be placed directly inside `<Match>`. Wrapping them in your own component or a fragment means they will not be detected.
- **Order matters.** The first truthy `When` wins. Put more specific conditions first and `Default` last.
- **Branches are not lazy.** JSX inside every branch is created (not rendered or mounted) each time `Match` renders, so expressions like `{items.map(...)}` in a non-matching branch still run. Only the matching branch's components are mounted. Guard any expression that could throw (for example, use `data?.items`).
- **No match, no output.** Without a matching `When` or a `Default`, `Match` renders `null`.

## TypeScript

Types are included. `condition` is typed as `boolean`, so coerce values explicitly:

```tsx
<Match.When condition={Boolean(user)}>…</Match.When>
<Match.When condition={items.length > 0}>…</Match.When>
```

## FAQ

**How do I do `if / else` in React JSX without ternaries?**
Use `<Match.When>` for the `if` and `<Match.Default>` for the `else`.

**Does it support `switch` statements?**
Yes: use one `Match.When` per case, e.g. `condition={status === "error"}`, plus `Match.Default` for `default:`.

**Does it work with server components / Next.js?**
It uses only `React.Children` and plain elements (no hooks, state, or effects), so it can be used in both server and client components.

**Does it work with React 16, 17, 18, and 19?**
Yes, the peer dependency is `react >= 16.8.0`.

## License

MIT © Mutasim Al-Mualimi

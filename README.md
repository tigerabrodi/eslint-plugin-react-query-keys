# eslint-plugin-react-query-keys

ESLint plugin to enforce best practices when working with React Query.

## Installation

```bash
npm install eslint-plugin-react-query-keys --save-dev
# or
yarn add eslint-plugin-react-query-keys --dev
# or
pnpm add eslint-plugin-react-query-keys --save-dev
```

## Usage

Add to your ESLint configuration:

```js
// .eslintrc.js
module.exports = {
  plugins: ["react-query-keys"],
  rules: {
    "react-query-keys/no-plain-query-keys": "warn",
  },
};
```

## Available Rules

### no-plain-query-keys

Enforces the use of query key factories instead of raw arrays or strings for React Query operations.

When working with React Query, it's best practice to use query key factories to manage your query keys rather than hardcoding string or array literals. This approach improves maintainability, prevents duplication, enhances type safety, and provides better IntelliSense support.

This rule checks for:

1. Raw arrays or strings passed to React Query methods like `invalidateQueries`, `setQueryData`, etc.
2. Raw arrays assigned to `queryKey` or `mutationKey` properties in hooks like `useQuery` and `useMutation`

#### Examples

```jsx
// ❌ Bad (direct use of array literals)
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});

queryClient.invalidateQueries(["users"]);

// ❌ Bad (empty array or single empty string arrays)
useQuery({
  queryKey: [],
  queryFn: fetchData,
});

useQuery({
  queryKey: [""],
  queryFn: fetchData,
});

// ✅ Good (using query key factories)
useQuery({
  queryKey: userKeys.list(),
  queryFn: fetchUsers,
});

useQuery({
  queryKey: userKeys.detail(1),
  queryFn: fetchUser,
});

queryClient.invalidateQueries(userKeys.list());
```

See the [rule documentation](docs/rules/no-plain-query-keys.md) for more detailed examples and explanation.

## License

MIT

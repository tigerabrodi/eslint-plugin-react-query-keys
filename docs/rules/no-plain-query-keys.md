# Enforce using query key factories (`no-plain-query-keys`)

This rule enforces the use of query key factories instead of raw arrays or strings for React Query/TanStack Query operations.

## Rule Details

When working with TanStack Query, it's best practice to use query key factories (often combined with `queryOptions`) to manage your query keys rather than hardcoding string or array literals. This approach:

- Improves maintainability by centralizing query key definitions
- Prevents duplication and reduces errors from typos
- Makes refactoring easier and safer
- Enhances type safety with TypeScript
- Provides better IntelliSense support

This rule checks for:

1. Raw arrays or strings passed directly as query keys to TanStack Query methods like `getQueryData`, `setQueryData` (where applicable).
2. Raw arrays or strings used as the value for the `queryKey` property within the options object passed to methods like `invalidateQueries`, `refetchQueries`, etc.
3. Raw arrays assigned to `queryKey` or `mutationKey` properties in hooks like `useQuery` and `useMutation` (unless inside a `queryOptions` helper call).

### ❌ Examples of incorrect code

```js
// Raw array as direct query key argument
queryClient.setQueryData(["users"], data);
queryClient.getQueryData(["users", 1, { sort: "asc" }]);

// Raw string as direct query key argument
queryClient.invalidateQueries("users"); // Note: v5 often prefers the object syntax

// Raw array as queryKey value in object syntax
queryClient.invalidateQueries({ queryKey: ["users"] });
queryClient.refetchQueries({ queryKey: ["todos", 1] });

// Raw array as queryKey property in useQuery
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});

// Empty array as queryKey - invalid
useQuery({
  queryKey: [],
  queryFn: fetchData,
});

// Empty string in array as queryKey - invalid
useQuery({
  queryKey: [""],
  queryFn: fetchData,
});

// Raw array in useMutation
useMutation({
  mutationKey: ["updateUser"],
  mutationFn: updateUser,
});

// Raw array as mutationKey value in object syntax (if applicable)
// queryClient.someMutationMethod({ mutationKey: ['updateUser'] });
```

### ✅ Examples of correct code

```js
// Using query key factory (direct argument where applicable)
queryClient.setQueryData(userKeys.detail(1), data);
queryClient.getQueryData(userKeys.all);

// Using query key factory (v5 object syntax)
queryClient.invalidateQueries({ queryKey: userKeys.all });
queryClient.refetchQueries({ queryKey: todoKeys.list(userId) });
queryClient.cancelQueries({ queryKey: userKeys.detail(5) });

// Using factory function call that returns an array (object syntax)
queryClient.invalidateQueries({ queryKey: createQueryKey("users", userId) });

// Using factory function call directly (where applicable)
queryClient.getQueryData(createQueryKey("users", userId));

// Using query key factory in useQuery
useQuery({
  queryKey: userKeys.detail(1),
  queryFn: fetchUser,
});

// Using queryOptions result in useQuery
const userDetailOptions = queryOptions({
  queryKey: userKeys.detail(1),
  queryFn: fetchUser,
});
useQuery(userDetailOptions);

// Using queryOptions result in queryClient methods
const userListOptions = queryOptions({
  queryKey: userKeys.list(),
  queryFn: fetchUsers,
});
queryClient.prefetchQuery(userListOptions);

// Accessing .queryKey from queryOptions result
const options = queryOptions({ queryKey: ["a"], queryFn }); // Rule ignores ['a'] inside queryOptions
queryClient.getQueryData(options.queryKey);

// Using query key factory in useInfiniteQuery
useInfiniteQuery({
  queryKey: todoKeys.list(userId),
  queryFn: fetchTodos,
});

// Using query key factory in useMutation
useMutation({
  mutationKey: userKeys.mutations.update(),
  mutationFn: updateUser,
});

// Using shorthand property with a valid variable
const key = userKeys.all;
queryClient.invalidateQueries({ queryKey: key });

const computedKey = computeSomeKey();
queryClient.refetchQueries({ queryKey: computedKey });
```

## When Not To Use It

If you're not concerned about query key consistency or if your project is small enough that managing query keys manually isn't a burden, you might not need this rule.

## Further Reading

- [React Query Keys - TanStack Query docs](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Effective React Query Keys - TkDodo's blog](https://tkdodo.eu/blog/effective-react-query-keys)

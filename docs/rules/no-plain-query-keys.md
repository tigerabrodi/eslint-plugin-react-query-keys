# Enforce using query key factories (no-plain-query-keys)

This rule enforces the use of query key factories instead of raw arrays or strings for React Query operations.

## Rule Details

When working with React Query, it's best practice to use query key factories to manage your query keys rather than hardcoding string or array literals. This approach:

- Improves maintainability by centralizing query key definitions
- Prevents duplication and reduces errors from typos
- Makes refactoring easier and safer
- Enhances type safety with TypeScript
- Provides better IntelliSense support

This rule checks for:

1. Raw arrays or strings passed to React Query methods like `invalidateQueries`, `setQueryData`, etc.
2. Raw arrays assigned to `queryKey` or `mutationKey` properties in hooks like `useQuery` and `useMutation`

### ❌ Examples of incorrect code

```js
// Raw array as query key
queryClient.setQueryData(["users"], data);

// Raw array with multiple elements
queryClient.getQueryData(["users", 1, { sort: "asc" }]);

// Raw string as query key
queryClient.invalidateQueries("users");

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
```

### ✅ Examples of correct code

```js
// Using query key factory
queryClient.setQueryData(userKeys.detail(1), data);

// Using query key factory with multiple methods
queryClient.getQueryData(userKeys.list());
queryClient.invalidateQueries(userKeys.detail(5));
queryClient.refetchQueries(todoKeys.list(userId));

// Using factory function call that returns an array
queryClient.invalidateQueries(createQueryKey("users", userId));

// Using query key factory in useQuery
useQuery({
  queryKey: userKeys.detail(1),
  queryFn: fetchUser,
});

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
```

## When Not To Use It

If you're not concerned about query key consistency or if your project is small enough that managing query keys manually isn't a burden, you might not need this rule.

## Further Reading

- [React Query Keys - TanStack Query docs](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Effective React Query Keys - TkDodo's blog](https://tkdodo.eu/blog/effective-react-query-keys)

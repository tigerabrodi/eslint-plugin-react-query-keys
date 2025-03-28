import { RuleTester } from "@typescript-eslint/rule-tester";
import { noPlainQueryKeys } from "../rules/no-plain-query-keys";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
});

ruleTester.run("no-plain-query-keys", noPlainQueryKeys, {
  valid: [
    {
      code: `
        // Using query key factory is good
        queryClient.setQueryData(userKeys.detail(1), data);
      `,
    },
    {
      code: `
        // Using query key factory with multiple methods is good
        queryClient.getQueryData(userKeys.all);
        queryClient.invalidateQueries(userKeys.detail(5));
        queryClient.refetchQueries(todoKeys.list(userId));
      `,
    },
    {
      code: `
        // Not a queryClient method call
        someOtherObject.setQueryData(['users'], data);
      `,
    },
    {
      code: `
        // Different method that's not in our list
        queryClient.someOtherMethod(['users']);
      `,
    },
    {
      code: `
        // Factory function call that returns an array (acceptable)
        queryClient.invalidateQueries(createQueryKey('users', userId));
      `,
    },
    {
      code: `
        // Using query key factory in useQuery is good
        useQuery({
          queryKey: userKeys.detail(1),
          queryFn: fetchUser
        });
      `,
    },
    {
      code: `
        // Using query key factory in useInfiniteQuery is good
        useInfiniteQuery({
          queryKey: todoKeys.list(userId),
          queryFn: fetchTodos
        });
      `,
    },
    {
      code: `
        // Using query key factory in useMutation is good
        useMutation({
          mutationKey: userKeys.mutations.update(),
          mutationFn: updateUser
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
    // Using spread operator - not a direct array literal
    queryClient.setQueryData([...userKeys.detail(1), 'additional'], data);
  `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Raw array as query key
        queryClient.setQueryData(['users'], data);
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Raw array with multiple elements
        queryClient.getQueryData(['users', 1, { sort: 'asc' }]);
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Raw string as query key
        queryClient.invalidateQueries('users');
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Multiple methods with raw query keys
        queryClient.refetchQueries(['todos']);
        queryClient.removeQueries(['users']);
        queryClient.resetQueries(['settings']);
      `,
      errors: [
        { messageId: "noRawQueryKeys" },
        { messageId: "noRawQueryKeys" },
        { messageId: "noRawQueryKeys" },
      ],
    },
    {
      code: `
        // Complex raw arrays
        queryClient.prefetchQuery(['users', { status: 'active' }, 5], fetchUsers);
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Nested function calls with raw arrays
        queryClient.fetchQuery(['users'], () => {
          queryClient.invalidateQueries(['settings']);
        });
      `,
      errors: [
        { messageId: "noRawQueryKeys" },
        { messageId: "noRawQueryKeys" },
      ],
    },
    {
      code: `
        // Raw array as queryKey property in useQuery
        useQuery({
          queryKey: ['users'],
          queryFn: fetchUsers
        });
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Empty string in array as queryKey (should be invalid)
        useQuery({
          queryKey: [""],
          queryFn: fetchData
        });
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Empty array as queryKey (should be invalid)
        useQuery({
          queryKey: [],
          queryFn: fetchData
        });
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Raw array in useInfiniteQuery
        useInfiniteQuery({
          queryKey: ['todos', userId],
          queryFn: fetchTodos
        });
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Raw array in useMutation
        useMutation({
          mutationKey: ['updateUser'],
          mutationFn: updateUser
        });
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
  ],
});

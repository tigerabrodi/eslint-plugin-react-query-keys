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
    {
      code: `
        // Using a function call returning an array in useQuery queryKey
        useQuery({
          queryKey: jobsQueries.all(),
          queryFn: fetchJobs
        });
      `,
    },
    {
      code: `
        // Using a function call returning array directly in invalidateQueries (v5 object syntax)
        queryClient.invalidateQueries({ queryKey: jobsQueries.all() });
      `,
    },
    {
      code: `
        // Using a member expression directly in invalidateQueries (v5 object syntax)
        queryClient.invalidateQueries({ queryKey: jobsQueries.all });
      `,
    },
    {
      code: `
        // Using queryOptions result directly in useQuery
        const options = queryOptions({ queryKey: ['a'], queryFn });
        useQuery(options);
      `,
    },
    {
      code: `
        // Using queryOptions result directly in queryClient method
        const options = queryOptions({ queryKey: ['a'], queryFn });
        queryClient.prefetchQuery(options);
      `,
    },
    {
      code: `
        // Accessing .queryKey from queryOptions result
        const options = queryOptions({ queryKey: ['a'], queryFn });
        queryClient.getQueryData(options.queryKey);
      `,
    },
    {
      code: `
        // Using shorthand property where variable holds a factory member
        const queryKey = jobsQueries.all;
        queryClient.cancelQueries({ queryKey });
      `,
    },
    {
      code: `
        // Using shorthand property where variable holds a factory call result
        const queryKey = jobsQueries.all();
        queryClient.cancelQueries({ queryKey });
      `,
    },
    {
      // Added to ensure simple CallExpressions (not MemberExpressions) are still allowed
      // e.g., a helper function `createKey()` that isn't part of a factory object
      code: `
        queryClient.invalidateQueries(createKey('users'));
      `,
    },
    {
      // Ensure CallExpression returning options object is allowed
      code: `
        useQuery(createOptionsObject('users'));
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
    {
      code: `
        // Empty raw array in invalidateQueries (v5 object syntax)
        queryClient.invalidateQueries({ queryKey: [] });
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Raw array in prefetchQuery (v5 object syntax)
        queryClient.prefetchQuery({ queryKey: ['rawPrefetch'] });
      `,
      errors: [{ messageId: "noRawQueryKeys" }],
    },
    {
      code: `
        // Raw array in setQueryData (v5 object syntax - assuming it might exist)
        queryClient.setQueryData({ queryKey: ['rawSet'], data: {} });
      `,
      // Note: setQueryData doesn't use object syntax for the key itself.
      // Key is first arg, { data: ... } is second. Keep old tests.
      // This test case is actually testing the Property rule on `queryKey: ['rawSet']`
      errors: [{ messageId: "noRawQueryKeys" }],
    },
  ],
});

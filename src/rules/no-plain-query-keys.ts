import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";

const QUERY_CLIENT_OBJ_NAME = "queryClient";

const QUERY_KEY_PROPERTY_NAME = "queryKey";

const MUTATION_KEY_PROPERTY_NAME = "mutationKey";

const QUERY_OPTIONS_CALLEE_NAME = "queryOptions";

// Helper function to check if a node is a disallowed raw key
function isRawKeyDisallowed(
  node: TSESTree.Node | null | undefined
): node is TSESTree.ArrayExpression | TSESTree.StringLiteral {
  if (!node) return false;
  // Disallow ArrayExpression, unless it's empty? TanStack Query allows empty arrays, but maybe we shouldn't?
  // Let's disallow empty arrays for now as per original tests.
  if (node.type === AST_NODE_TYPES.ArrayExpression) {
    return true;
  }
  // Disallow string literals (can be revisited based on TanStack Query v5 allowing string keys)
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === "string") {
    return true;
  }
  return false;
}

// Helper function to check if a node is a valid factory/variable/call
function isValidKeyFactoryUsage(
  node: TSESTree.Node | null | undefined
): boolean {
  if (!node) return false;
  // Allow MemberExpression (e.g., userKeys.all, options.queryKey)
  if (node.type === AST_NODE_TYPES.MemberExpression) {
    return true;
  }
  // Allow CallExpression (e.g., userKeys.detail(1), createQueryKey(), jobsQueries.all())
  if (node.type === AST_NODE_TYPES.CallExpression) {
    return true;
  }
  // Allow Identifier (e.g., options passed to useQuery, variable holding a key)
  if (node.type === AST_NODE_TYPES.Identifier) {
    return true;
  }
  return false;
}

export const noPlainQueryKeys = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/yourusername/eslint-plugin-react-query-keys/blob/main/docs/rules/${name}.md`
)({
  name: "no-plain-query-keys",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce using query key factories instead of raw arrays or strings",
    },
    messages: {
      noRawQueryKeys:
        "Avoid using raw arrays or strings for query keys. Use query key factories instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // Set of React Query methods that take query keys OR options objects
    const queryKeyMethods = new Set([
      "setQueryData",
      "getQueryData",
      "invalidateQueries",
      "refetchQueries",
      "removeQueries",
      "resetQueries",
      "cancelQueries",
      "isFetching",
      "prefetchQuery",
      "fetchQuery",
      "fetchInfiniteQuery",
      // Hooks that use queryKey
      "useQuery",
      "useInfiniteQuery",
      "useMutation", // Technically mutationKey, but handled similarly
    ]);

    // Track if we are inside a queryOptions call
    let inQueryOptionsCall = false;

    return {
      // Track entering/exiting queryOptions calls
      CallExpression(node) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === QUERY_OPTIONS_CALLEE_NAME
        ) {
          inQueryOptionsCall = true;
        }

        // Check for queryClient.method() or useQuery() calls
        let methodOrHookName: string | null = null;
        let isQueryClientCall = false;

        if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
          // e.g., queryClient.invalidateQueries()
          if (
            node.callee.object.type === AST_NODE_TYPES.Identifier &&
            node.callee.object.name === QUERY_CLIENT_OBJ_NAME &&
            node.callee.property.type === AST_NODE_TYPES.Identifier &&
            queryKeyMethods.has(node.callee.property.name)
          ) {
            methodOrHookName = node.callee.property.name;
            isQueryClientCall = true;
          }
        } else if (node.callee.type === AST_NODE_TYPES.Identifier) {
          // e.g., useQuery()
          if (queryKeyMethods.has(node.callee.name)) {
            methodOrHookName = node.callee.name;
          }
        }

        if (!methodOrHookName || node.arguments.length === 0) {
          return; // Not a relevant call
        }

        const firstArg = node.arguments[0];

        // --- Handle V5 Object Syntax --- e.g., invalidateQueries({ queryKey: ... })
        // Let the Property visitor handle checks for `queryKey: [...]` within objects.
        // This visitor only checks for *direct* raw arguments to methods/hooks.

        // --- Handle Direct Key Argument or Hook Options Object ---
        // e.g., getQueryData(key), useQuery({ queryKey: key })

        // If the argument is an Identifier (like `options` from `queryOptions`),
        // assume it's valid unless it's directly a raw key.
        if (firstArg.type === AST_NODE_TYPES.Identifier) {
          // We could try resolving the identifier here, but for simplicity,
          // we assume identifiers are valid placeholders for factories/options.
          // If the identifier *itself* was assigned a raw array/string,
          // the assignment location would be flagged by the Property rule (if applicable).
          return;
        }

        // If argument is a direct CallExpression (like createKey() or factory.detail()), it's valid
        if (firstArg.type === AST_NODE_TYPES.CallExpression) {
          return;
        }

        // If argument is a MemberExpression (like factory.all or options.queryKey), it's valid
        if (firstArg.type === AST_NODE_TYPES.MemberExpression) {
          return;
        }

        // Now check if the direct argument (for methods like getQueryData) is raw
        if (isRawKeyDisallowed(firstArg)) {
          // Don't report if it's inside queryOptions({...})
          const parent = context.sourceCode.getNodeByRangeIndex(
            node.range[0] - 1
          );
          if (parent?.type === AST_NODE_TYPES.ObjectExpression) {
            const grandParent = context.sourceCode.getNodeByRangeIndex(
              parent.range[0] - 1
            );
            if (
              grandParent?.type === AST_NODE_TYPES.CallExpression &&
              grandParent.callee.type === AST_NODE_TYPES.Identifier &&
              grandParent.callee.name === QUERY_OPTIONS_CALLEE_NAME
            ) {
              return; // Inside queryOptions, allow raw key
            }
          }
          // Or if it's an argument to queryOptions itself
          if (
            node.callee.type === AST_NODE_TYPES.Identifier &&
            node.callee.name === QUERY_OPTIONS_CALLEE_NAME
          ) {
            return;
          }

          context.report({
            node: firstArg,
            messageId: "noRawQueryKeys",
          });
        }
      },
      "CallExpression:exit"(node) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === QUERY_OPTIONS_CALLEE_NAME
        ) {
          inQueryOptionsCall = false;
        }
      },
      Property(node) {
        // Check for queryKey: [...] or mutationKey: [...] property assignments
        if (
          node.key.type === AST_NODE_TYPES.Identifier &&
          (node.key.name === QUERY_KEY_PROPERTY_NAME ||
            node.key.name === MUTATION_KEY_PROPERTY_NAME)
        ) {
          // If we are inside a queryOptions({...}) call, allow raw keys
          if (inQueryOptionsCall) {
            return;
          }

          // If the value is NOT a valid factory/variable/call, report error
          // We specifically check for disallowed raw keys here, rather than !isValidKeyFactoryUsage
          // to avoid flagging potentially valid complex structures we don't explicitly allow yet.
          if (isRawKeyDisallowed(node.value)) {
            context.report({
              node: node.value,
              messageId: "noRawQueryKeys",
            });
          }
        }
      },
    };
  },
});

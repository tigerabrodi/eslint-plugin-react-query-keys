import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

const QUERY_CLIENT_OBJ_NAME = "queryClient";

const QUERY_KEY_PROPERTY_NAME = "queryKey";

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
    // Set of React Query methods that take query keys directly as first argument
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
    ]);

    return {
      CallExpression(node) {
        // Check if it's a call to a member expression (e.g. queryClient.something())
        if (node.callee.type !== "MemberExpression") {
          return;
        }

        const memberExp = node.callee;

        // Check if it's a queryClient method call
        // e.g. queryClient.setQueryData(['users'], ...)
        if (
          memberExp.object.type === "Identifier" &&
          memberExp.object.name === QUERY_CLIENT_OBJ_NAME &&
          memberExp.property.type === "Identifier" &&
          queryKeyMethods.has(memberExp.property.name) &&
          node.arguments.length > 0
        ) {
          const firstArg = node.arguments[0];

          // Valid: MemberExpression (userKeys.all)
          if (firstArg.type === "MemberExpression") {
            return;
          }

          // Valid: CallExpression with MemberExpression callee (userKeys.detail(1))
          if (
            firstArg.type === "CallExpression" &&
            firstArg.callee.type === "MemberExpression"
          ) {
            return;
          }

          // Valid: Other function calls (createQueryKey('users'))
          if (firstArg.type === "CallExpression") {
            return;
          }

          // Check if the first argument is a raw array or string
          if (
            AST_NODE_TYPES.ArrayExpression ||
            (firstArg.type === "Literal" && typeof firstArg.value === "string")
          ) {
            context.report({
              node: firstArg,
              messageId: "noRawQueryKeys",
            });
          }
        }
      },
      Property(node) {
        if (
          node.key.type === "Identifier" &&
          node.key.name === QUERY_KEY_PROPERTY_NAME
        ) {
          if (node.value.type === "ArrayExpression") {
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

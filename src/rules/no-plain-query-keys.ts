import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

const QUERY_CLIENT_OBJ_NAME = "queryClient";

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
        if (
          memberExp.object.type === "Identifier" &&
          memberExp.object.name === QUERY_CLIENT_OBJ_NAME &&
          memberExp.property.type === "Identifier" &&
          queryKeyMethods.has(memberExp.property.name) &&
          node.arguments.length > 0
        ) {
          const firstArg = node.arguments[0];

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
    };
  },
});

import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";

RuleTester.afterAll = vitest.afterAll;

// Since we're not using vitest with globals: true
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

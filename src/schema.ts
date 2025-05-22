import { makeSchema } from "nexus";
import path from "path";
import process from "process";
import * as types from "./graphql";

export const schema = makeSchema({
  types,
  outputs: {
    schema: path.join(process.cwd(), "schema.graphql"),
    typegen: path.join(process.cwd(), "nexus-typegen.ts")
  },
  contextType: {
    module: path.join(process.cwd(), "./src/context.ts"),
    export: "Context"
  }
})
// ./sanity.config.ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schema } from "./src/sanity/schemaTypes";

export default defineConfig({
  projectId: '366sb9yi',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schema.types,
  },
});
const { z } = require("zod");

const CamlSchema = z.object({
  caml_version: z.string(),
  meta: z.object({ id: z.string() }).passthrough(),
  processes: z.object({
    catalog: z.array(z.object({
      id: z.string(),
      type: z.string().optional(),
      timebox: z.any().optional(),
      participants: z.array(z.string()).optional(),
      location: z.string().optional(),
      notes: z.string().optional()
    }))
  }),
  transitions: z.any().optional(),
  world: z.any().optional(),
  state: z.any().optional(),
  roles: z.any().optional(),
  snapshots: z.any().optional()
}).passthrough();

module.exports = {
  validateCaml: (obj) => CamlSchema.parse(obj)
};

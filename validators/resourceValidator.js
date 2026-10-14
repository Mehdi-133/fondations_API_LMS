const { z } = require("zod");

const createResourceSchema = z
  .object({
    type: z.enum(["video", "document", "link"]),
    url: z.url({ protocol: /^https?$/ }),
    order: z.number().int().positive(),
  })
  .strict();

module.exports = { createResourceSchema };

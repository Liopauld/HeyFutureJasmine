import { z } from "zod";

export const letterSchema = z.object({
  recipientEmail: z.string().email(),
  recipientName: z.string().optional(),
  isSelfLetter: z.boolean().default(true),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(50000),
  attachments: z.array(z.string()).optional(),
  deliveryDate: z.string(),
  visibility: z.enum(["private", "public_anonymous", "public_named"]).default("private"),
  capsuleTheme: z.enum(["default", "gold", "scroll", "davy_jones", "alabasta", "skypiea"]).default("default")
});

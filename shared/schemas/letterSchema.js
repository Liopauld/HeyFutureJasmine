import { z } from "zod";

export const songSchema = z.object({
  provider: z.enum(["spotify", "youtube", "apple", "other"]).optional(),
  url: z.string().url(),
  title: z.string().max(200).optional(),
  artist: z.string().max(200).optional()
});

export const letterSchema = z.object({
  // Recipient is resolved server-side from letterType (self → you, partner/us → your partner).
  letterType: z.enum(["self", "partner", "us"]).default("self"),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(50000),
  deliveryDate: z.string(),
  visibility: z.enum(["private", "public_anonymous", "public_named"]).default("private"),
  capsuleTheme: z
    .enum(["default", "gold", "scroll", "davy_jones", "alabasta", "skypiea"])
    .default("default"),
  song: songSchema.optional(),
  attachments: z.array(z.string()).optional(),
  replyTo: z.string().optional()
});

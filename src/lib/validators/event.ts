import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(4).max(120),
  description: z.string().max(3000).optional().or(z.literal("")).default(""),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  image_url: z.string().url(),
  thumbnail_url: z.string().url().optional().or(z.literal("")).default(""),
  link: z.string().url().optional().or(z.literal("")).default(""),
  status: z.enum(["active", "upcoming", "expired"]).optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

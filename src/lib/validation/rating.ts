import { z } from "zod";

export const ratingSchema = z.object({
  exterior: z.number().int().min(1).max(10),
  interior: z.number().int().min(1).max(10),
  surroundings: z.number().int().min(1).max(10),
  acoustics: z.number().int().min(1).max(10),
  hasOrgan: z.boolean(),
  organRating: z.number().int().min(1).max(10).optional().nullable(),
  vibe: z.number().int().min(1).max(10),
  visitDate: z.string().date().optional().nullable(),
  timeSpentMinutes: z.number().int().min(0).optional().nullable(),
  companionsReason: z.string().optional()
}).refine((data) => !data.hasOrgan || (data.organRating !== undefined && data.organRating !== null), {
  message: "Organ rating required when hasOrgan is true",
  path: ["organRating"]
});

export type RatingInput = z.infer<typeof ratingSchema>;
import { z } from "zod";

export const churchCreateSchema = z.object({
  name: z.string().min(1).max(200),
  denomination: z.enum(["catholic", "protestant", "orthodox", "other", "ecumenical"]).optional(),
  address: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  yearBuilt: z.number().int().min(0).max(new Date().getFullYear()).optional(),
  architecturalStyle: z.enum([
    "gothic", "romanesque", "baroque", "neoclassical", "modern",
    "brutalist", "byzantine", "renaissance", "art_nouveau", "other"
  ]).optional(),
  website: z.string().url().optional().or(z.literal("")),
  serviceTimes: z.string().optional(),
  description: z.string().optional(),
  patronSaint: z.string().optional(),
  heritageStatus: z.enum(["unesco", "national", "local", "none"]).optional(),
  organBuilder: z.string().optional(),
  organSpecs: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  wheelchairAccessible: z.boolean().optional(),
  parkingInfo: z.string().optional(),
  virtualTourUrl: z.string().url().optional().or(z.literal("")),
  groupId: z.string().uuid().optional().nullable()
});

export const churchUpdateSchema = churchCreateSchema.partial();

export const churchListQuerySchema = z.object({
  groupId: z.string().uuid().optional().nullable(),
  denomination: z.string().optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  hasOrgan: z.coerce.boolean().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  north: z.coerce.number().optional(),
  south: z.coerce.number().optional(),
  east: z.coerce.number().optional(),
  west: z.coerce.number().optional()
});

export type ChurchCreateInput = z.infer<typeof churchCreateSchema>;
export type ChurchUpdateInput = z.infer<typeof churchUpdateSchema>;
export type ChurchListQuery = z.infer<typeof churchListQuerySchema>;
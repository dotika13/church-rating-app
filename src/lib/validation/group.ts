import { z } from "zod";

export const groupCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional()
});

export const groupJoinSchema = z.object({
  inviteCode: z.string().min(1).max(20)
});

export type GroupCreateInput = z.infer<typeof groupCreateSchema>;
export type GroupJoinInput = z.infer<typeof groupJoinSchema>;
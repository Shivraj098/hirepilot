import { z } from "zod";

export const resumeSchema = z.object({
  summary: z.string().optional(),

  skills: z.array(
    z.string()
  ),

  experience: z.array(
    z.any()
  ),

  education: z.array(
    z.any()
  ),
});

export type ResumeSchema =
  z.infer<
    typeof resumeSchema
  >;
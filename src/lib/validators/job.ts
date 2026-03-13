import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(1),

  company:
    z.string().min(1),

  description:
    z.string().min(5),

  jobLink:
    z.string().url().optional(),

  location:
    z.string().optional(),
});
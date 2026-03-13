import { z } from "zod";

export const jobStatusSchema =
  z.enum([
    "SAVED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
  ]);
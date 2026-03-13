import { z } from "zod";

export const scoreSchema =
  z.object({
    profileScore:
      z.number(),

    contentScore:
      z.number(),

    skillScore:
      z.number(),

    experienceScore:
      z.number(),

    atsScore:
      z.number(),

    tips:
      z.array(
        z.string()
      ),
  });
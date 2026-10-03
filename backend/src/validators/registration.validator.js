import { z } from "zod";

const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(100, "Name must not exceed 100 characters."),

  rollNumber: z
    .string()
    .trim()
    .min(1, "Roll number is required.")
    .max(50, "Roll number must not exceed 50 characters."),

  year: z
    .string()
    .trim()
    .min(1, "Year of study is required.")
    .max(30, "Year of study must not exceed 30 characters."),

  department: z
    .string()
    .trim()
    .min(2, "Department is required.")
    .max(100, "Department must not exceed 100 characters."),
});

export const validateRegistration = (data) => {
  return registrationSchema.safeParse(data);
};

export default registrationSchema;
import { z } from "zod";

const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(100, "Name must not exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(150, "Email must not exceed 150 characters.")
    .transform((value) => value.toLowerCase()),

  mobileNumber: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit mobile number."
    ),

  rollNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^BT[A-Z0-9]{8}$/,
      "Roll number must be in the format BTXXXXXXXX."
    ),

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
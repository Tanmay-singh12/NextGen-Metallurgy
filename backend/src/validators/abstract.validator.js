import { z } from "zod";

export const validateAbstractSubmission = (data) => {
    const schema = z.object({
        registrationId: z
            .string()
            .trim()
            .min(1, "Registration ID is required."),

        contributorNames: z
            .string()
            .trim()
            .min(1, "Contributor names are required."),

        abstractTitle: z
            .string()
            .trim()
            .min(1, "Abstract title is required.")
            .max(300, "Abstract title is too long."),

        mentorName: z
            .string()
            .trim()
            .min(1, "Mentor name is required."),

        organizationName: z
            .string()
            .trim()
            .min(1, "Organization name is required."),

        theme: z.enum([
            "Manufacturing and Process Metallurgy",
            "Characterization",
            "Advanced Materials",
            "Materials Informatics",
            "Non Core",
            "Other",
        ]),

        keywords: z
            .array(
                z
                    .string()
                    .trim()
                    .min(1, "Keyword cannot be empty.")
            )
            .length(5, "Exactly five keywords are required."),

        transactionId: z
            .string()
            .trim()
            .optional()
            .nullable(),
    });

    return schema.safeParse(data);
};
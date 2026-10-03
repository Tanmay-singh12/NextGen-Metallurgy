import mongoose from "mongoose";

const abstractSubmissionSchema = new mongoose.Schema(
    {
        registrationId: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            index: true,
        },

        contributorNames: {
            type: String,
            required: true,
            trim: true,
        },

        photos: [
            {
                data: {
                    type: Buffer,
                    required: true,
                },
                originalName: {
                    type: String,
                    required: true,
                    trim: true,
                },
                mimeType: {
                    type: String,
                    required: true,
                    trim: true,
                },
                size: {
                    type: Number,
                    required: true,
                },
            },
        ],


        abstractTitle: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },

        mentorName: {
            type: String,
            required: true,
            trim: true,
        },

        organizationName: {
            type: String,
            required: true,
            trim: true,
        },

        theme: {
            type: String,
            required: true,
            enum: [
                "Manufacturing and Process Metallurgy",
                "Characterization",
                "Advanced Materials",
                "Materials Informatics",
                "Non Core",
                "Other",
            ],
            trim: true,
        },

        keywords: {
            type: [
                {
                    type: String,
                    trim: true,
                },
            ],
            required: true,
            validate: {
                validator: (value) =>
                    Array.isArray(value) &&
                    value.length === 5 &&
                    value.every((keyword) => keyword.length > 0),
                message: "Exactly five keywords are required.",
            },
        },

        abstractFile: {
            data: {
                type: Buffer,
                required: true,
            },
            originalName: {
                type: String,
                required: true,
                trim: true,
            },
            mimeType: {
                type: String,
                required: true,
                trim: true,
            },
            size: {
                type: Number,
                required: true,
            },
        },

        paymentScreenshot: {
            data: {
                type: Buffer,
                required: true,
            },
            originalName: {
                type: String,
                required: true,
                trim: true,
            },
            mimeType: {
                type: String,
                required: true,
                trim: true,
            },
            size: {
                type: Number,
                required: true,
            },
        },

        transactionId: {
            type: String,
            trim: true,
            default: null,
        },



        status: {
            type: String,
            enum: [
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
            ],
            default: "UNDER_REVIEW",
            index: true,
        },

        rejectionReason: {
            type: String,
            trim: true,
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// abstractSubmissionSchema.index({
//     registrationId: 1,
// });

abstractSubmissionSchema.index({
    status: 1,
    createdAt: -1,
});

const AbstractSubmission = mongoose.model(
    "AbstractSubmission",
    abstractSubmissionSchema
);

export default AbstractSubmission;
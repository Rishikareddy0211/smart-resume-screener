const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema(
  {
    resumeName: {
      type: String,
      required: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    matchedSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    aiJustification: {
      type: String,
      default: "",
    },

    // Resume information extracted by Gemini
    resumeInfo: {
      skills: {
        type: [String],
        default: [],
      },

      education: {
        type: [String],
        default: [],
      },

      experience: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", AnalysisSchema);
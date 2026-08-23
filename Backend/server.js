const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);

// ======================================================
// MULTER
// ======================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },
});

// ======================================================
// MONGODB CONNECTION
// ======================================================

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("ERROR: MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// ======================================================
// USER SCHEMA
// ======================================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

// ======================================================
// ANALYSIS SCHEMA
// ======================================================

const analysisSchema = new mongoose.Schema(
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

    recommendation: {
      type: String,
      enum: ["SHORTLIST", "REVIEW", "REJECT"],
      default: "REVIEW",
    },

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

const Analysis = mongoose.model("Analysis", analysisSchema);

// ======================================================
// GEMINI
// ======================================================

if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is missing in .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Your currently supported/new models
const GEMINI_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
];

console.log("Gemini models:", GEMINI_MODELS);

// ======================================================
// HELPER: WAIT
// ======================================================

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ======================================================
// SIGNUP
// ======================================================

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -------------------------------
    // Validation
    // -------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -------------------------------
    // Check existing user
    // -------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists.",
      });
    }

    // -------------------------------
    // Create user
    // -------------------------------

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
    });

    console.log("New user registered:", normalizedEmail);

    return res.status(201).json({
      message: "Signup successful",
    });
  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================================================
// LOGIN
// ======================================================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request received for:", email);

    // -------------------------------
    // Validation
    // -------------------------------

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -------------------------------
    // Find user
    // -------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }

    // -------------------------------
    // Check password
    // -------------------------------

    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid password.",
      });
    }

    console.log("Login successful:", normalizedEmail);

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================================================
// HELPER: EXTRACT TEXT FROM FILE
// ======================================================

async function extractTextFromFile(file) {
  if (!file || !file.buffer) {
    throw new Error("Invalid file");
  }

  const fileType = file.mimetype;

  // -------------------------------
  // PDF
  // -------------------------------

  if (fileType === "application/pdf") {
    const data = await pdfParse(file.buffer);

    return data.text || "";
  }

  // -------------------------------
  // DOCX
  // -------------------------------

  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value || "";
  }

  throw new Error(
    `Unsupported file type: ${fileType}. Only PDF and DOCX are allowed.`
  );
}

// ======================================================
// HELPER: CLEAN GEMINI RESPONSE
// ======================================================

function cleanGeminiResponse(text) {
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  let cleaned = text.trim();

  // Remove markdown JSON fences
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  cleaned = cleaned.trim();

  // If Gemini added extra text, extract JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(
      firstBrace,
      lastBrace + 1
    );
  }

  return cleaned;
}

// ======================================================
// HELPER: NORMALIZE AI RESULT
// ======================================================

function normalizeAnalysis(result) {
  let score = Number(result.score);

  if (Number.isNaN(score)) {
    score = 0;
  }

  // Keep score between 0 and 10
  score = Math.max(0, Math.min(10, score));

  const matchedSkills = Array.isArray(result.matchedSkills)
    ? result.matchedSkills.map(String)
    : [];

  const missingSkills = Array.isArray(result.missingSkills)
    ? result.missingSkills.map(String)
    : [];

  const strengths = Array.isArray(result.strengths)
    ? result.strengths.map(String)
    : [];

  const weaknesses = Array.isArray(result.weaknesses)
    ? result.weaknesses.map(String)
    : [];

  const suggestions = Array.isArray(result.suggestions)
    ? result.suggestions.map(String)
    : [];

  const resumeInfo = result.resumeInfo || {};

  const skills = Array.isArray(resumeInfo.skills)
    ? resumeInfo.skills.map(String)
    : [];

  const education = Array.isArray(resumeInfo.education)
    ? resumeInfo.education.map(String)
    : [];

  const experience = Array.isArray(resumeInfo.experience)
    ? resumeInfo.experience.map(String)
    : [];

  // -------------------------------
  // Recommendation
  // -------------------------------

  let recommendation = result.recommendation;

  if (
    recommendation !== "SHORTLIST" &&
    recommendation !== "REVIEW" &&
    recommendation !== "REJECT"
  ) {
    if (score >= 8) {
      recommendation = "SHORTLIST";
    } else if (score >= 5) {
      recommendation = "REVIEW";
    } else {
      recommendation = "REJECT";
    }
  }

  return {
    score,

    matchedSkills,

    missingSkills,

    strengths,

    weaknesses,

    suggestions,

    aiJustification: String(
      result.aiJustification || ""
    ),

    recommendation,

    resumeInfo: {
      skills,
      education,
      experience,
    },
  };
}

// ======================================================
// GEMINI PROMPT
// ======================================================

function createPrompt(resumeText, jobDescription) {
  return `
You are an AI-powered resume screening assistant.

Your task is to compare a candidate's resume against a job description.

IMPORTANT:
- Use ONLY information present in the resume.
- Do NOT invent experience, skills, education, internships, certifications, achievements, or projects.
- Do NOT assume a skill just because it is related to another skill.
- If something is not clearly present in the resume, consider it missing.
- Be accurate and recruiter-like.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not return explanations outside JSON.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Return exactly this JSON structure:

{
  "score": 7,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "aiJustification": "",
  "recommendation": "REVIEW",
  "resumeInfo": {
    "skills": [],
    "education": [],
    "experience": []
  }
}

Rules:

1. score must be a number from 0 to 10.

2. matchedSkills:
List important skills from the job description that are clearly present in the resume.

3. missingSkills:
List important job requirements that are missing or not clearly demonstrated in the resume.

4. strengths:
Give 3 to 5 specific strengths based only on the resume and job description.

5. weaknesses:
Give 2 to 4 specific weaknesses.

6. suggestions:
Give 2 to 4 practical suggestions to improve the candidate's profile for this job.

7. aiJustification:
Give a short recruiter-style explanation of the score.

8. recommendation must be exactly one of:

SHORTLIST
REVIEW
REJECT

Use:

8-10 = SHORTLIST
5-7 = REVIEW
0-4 = REJECT

9. resumeInfo.skills:
List the important skills explicitly present in the resume.

10. resumeInfo.education:
List education information explicitly present in the resume.

11. resumeInfo.experience:
List work/project/internship experience explicitly present in the resume.

Do not invent experience, skills, education, internships, certifications, or projects.

Only use information present in the resume.
`;
}

// ======================================================
// GEMINI CALL
// ======================================================

async function callGemini(prompt) {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    console.log("");
    console.log("---------------------------------");
    console.log(`Trying Gemini model: ${model}`);
    console.log("---------------------------------");

    // Try each model up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Gemini attempt ${attempt}/3 using ${model}`
        );

        const response =
          await ai.models.generateContent({
            model: model,

            contents: prompt,

            config: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          });

        const text = response.text;

        if (!text) {
          throw new Error(
            "Gemini returned empty response"
          );
        }

        console.log(
          `Gemini success using ${model}`
        );

        return text;
      } catch (error) {
        lastError = error;

        const errorMessage =
          error?.message ||
          error?.toString() ||
          "Unknown Gemini error";

        const status =
          error?.status ||
          error?.code ||
          "";

        console.error(
          `Gemini error using ${model}, attempt ${attempt}:`,
          errorMessage
        );

        // Temporary errors
        const temporary =
          String(status) === "503" ||
          String(status) === "429" ||
          errorMessage.includes("503") ||
          errorMessage.includes("429") ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("high demand") ||
          errorMessage.includes("temporarily");

        if (temporary && attempt < 3) {
          const delay = attempt * 3000;

          console.log(
            `Temporary Gemini error. Waiting ${
              delay / 1000
            } seconds...`
          );

          await wait(delay);

          continue;
        }

        // Permanent error
        if (!temporary) {
          console.log(
            `Non-temporary error from ${model}. Trying next model...`
          );
        }

        break;
      }
    }

    console.log(
      `Model ${model} failed. Trying next model...`
    );
  }

  throw (
    lastError ||
    new Error("All Gemini models failed")
  );
}

// ======================================================
// ANALYZE ONE RESUME
// ======================================================

async function analyzeResume(
  file,
  jobDescription
) {
  console.log("");
  console.log("=================================");
  console.log(
    `Processing: ${file.originalname}`
  );
  console.log("=================================");

  // Extract resume text
  const resumeText =
    await extractTextFromFile(file);

  console.log(
    `Extracted text length: ${resumeText.length}`
  );

  if (!resumeText.trim()) {
    throw new Error(
      "Could not extract text from this resume."
    );
  }

  // Limit prompt size
  const limitedResumeText =
    resumeText.substring(0, 30000);

  // Create prompt
  const prompt = createPrompt(
    limitedResumeText,
    jobDescription
  );

  console.log("");
  console.log(
    `Calling Gemini for: ${file.originalname}`
  );
  console.log("");

  // Call Gemini
  const geminiResponse =
    await callGemini(prompt);

  console.log(
    "Gemini raw response received."
  );

  // Clean response
  const cleanedResponse =
    cleanGeminiResponse(
      geminiResponse
    );

  let parsedResult;

  try {
    parsedResult =
      JSON.parse(cleanedResponse);
  } catch (error) {
    console.error(
      "JSON parsing failed."
    );

    console.error(
      "Gemini response:",
      geminiResponse
    );

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }

  // Normalize result
  const normalizedResult =
    normalizeAnalysis(parsedResult);

  return normalizedResult;
}

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message:
      "Resume Analyzer Backend is running",
    status: "OK",
  });
});

// ======================================================
// ANALYZE MULTIPLE RESUMES
// ======================================================

app.post(
  "/analyze-multiple",
  upload.array("resumes", 10),

  async (req, res) => {
    console.log("");
    console.log("=================================");
    console.log(
      "MULTIPLE RESUME ANALYSIS STARTED"
    );
    console.log("=================================");

    try {
      const files = req.files;

      const jobDescription =
        req.body.jobDesc;

      // -------------------------------
      // Validate files
      // -------------------------------

      if (!files || files.length === 0) {
        return res.status(400).json({
          error:
            "Please upload at least one resume.",
        });
      }

      // -------------------------------
      // Validate job description
      // -------------------------------

      if (
        !jobDescription ||
        !jobDescription.trim()
      ) {
        return res.status(400).json({
          error:
            "Job description is required.",
        });
      }

      console.log(
        `Number of resumes: ${files.length}`
      );

      const results = [];

      // ==================================================
      // PROCESS EACH RESUME
      // ==================================================

      for (const file of files) {
        console.log("");
        console.log("---------------------------------");
        console.log(
          `Processing: ${file.originalname}`
        );
        console.log("---------------------------------");

        try {
          const analysis =
            await analyzeResume(
              file,
              jobDescription
            );

          // -------------------------------
          // Save to MongoDB
          // -------------------------------

          const savedAnalysis =
            await Analysis.create({
              resumeName:
                file.originalname,

              jobDescription:
                jobDescription,

              score:
                analysis.score,

              matchedSkills:
                analysis.matchedSkills,

              missingSkills:
                analysis.missingSkills,

              strengths:
                analysis.strengths,

              weaknesses:
                analysis.weaknesses,

              suggestions:
                analysis.suggestions,

              aiJustification:
                analysis.aiJustification,

              recommendation:
                analysis.recommendation,

              resumeInfo:
                analysis.resumeInfo,
            });

          // -------------------------------
          // Add result for frontend
          // -------------------------------

          results.push({
            _id:
              savedAnalysis._id,

            resumeName:
              savedAnalysis.resumeName,

            jobDescription:
              savedAnalysis.jobDescription,

            score:
              savedAnalysis.score,

            matchedSkills:
              savedAnalysis.matchedSkills,

            missingSkills:
              savedAnalysis.missingSkills,

            strengths:
              savedAnalysis.strengths,

            weaknesses:
              savedAnalysis.weaknesses,

            suggestions:
              savedAnalysis.suggestions,

            aiJustification:
              savedAnalysis.aiJustification,

            recommendation:
              savedAnalysis.recommendation,

            resumeInfo:
              savedAnalysis.resumeInfo,

            createdAt:
              savedAnalysis.createdAt,
          });

          console.log(
            `Successfully analyzed: ${file.originalname}`
          );

          console.log(
            `Score: ${analysis.score}/10`
          );

          console.log(
            `Recommendation: ${analysis.recommendation}`
          );
        } catch (error) {
          console.error("");

          console.error(
            `ERROR PROCESSING: ${file.originalname}`
          );

          console.error(
            "ERROR MESSAGE:",
            error.message
          );

          // Do not crash entire request
          results.push({
            resumeName:
              file.originalname,

            jobDescription:
              jobDescription,

            score: 0,

            matchedSkills: [],

            missingSkills: [],

            strengths: [],

            weaknesses: [],

            suggestions: [],

            aiJustification:
              `Analysis failed: ${error.message}`,

            recommendation:
              "REJECT",

            resumeInfo: {
              skills: [],
              education: [],
              experience: [],
            },

            error: true,
          });
        }
      }

      // ==================================================
      // SORT BY SCORE
      // ==================================================

      results.sort(
        (a, b) =>
          Number(b.score) -
          Number(a.score)
      );

      // ==================================================
      // ADD RANK
      // ==================================================

      const rankedResults =
        results.map(
          (result, index) => ({
            ...result,
            rank: index + 1,
          })
        );

      console.log("");
      console.log("=================================");
      console.log(
        "ANALYSIS COMPLETED"
      );
      console.log("=================================");

      // ==================================================
      // SEND RESPONSE
      // ==================================================

      return res.json({
        success: true,

        jobDescription:
          jobDescription,

        count:
          rankedResults.length,

        results:
          rankedResults,
      });
    } catch (error) {
      console.error("");

      console.error(
        "================================="
      );

      console.error(
        "MULTIPLE ANALYSIS ERROR"
      );

      console.error(
        "================================="
      );

      console.error(error);

      return res.status(500).json({
        success: false,

        error:
          error.message ||
          "Failed to analyze resumes.",
      });
    }
  }
);

// ======================================================
// GET ANALYSIS HISTORY
// ======================================================

app.get(
  "/analyses",
  async (req, res) => {
    try {
      const analyses =
        await Analysis.find({})
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json(analyses);
    } catch (error) {
      console.error(
        "History fetch error:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to fetch analysis history",
      });
    }
  }
);

// ======================================================
// GET SINGLE ANALYSIS
// ======================================================

app.get(
  "/analyses/:id",
  async (req, res) => {
    try {
      const analysis =
        await Analysis.findById(
          req.params.id
        );

      if (!analysis) {
        return res.status(404).json({
          error:
            "Analysis not found.",
        });
      }

      return res.json(analysis);
    } catch (error) {
      console.error(
        "Single analysis error:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to fetch analysis.",
      });
    }
  }
);

// ======================================================
// DELETE SINGLE ANALYSIS
// ======================================================

app.delete(
  "/analyses/:id",
  async (req, res) => {
    try {
      const deleted =
        await Analysis.findByIdAndDelete(
          req.params.id
        );

      if (!deleted) {
        return res.status(404).json({
          error:
            "Analysis not found.",
        });
      }

      return res.json({
        success: true,

        message:
          "Analysis deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete analysis error:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to delete analysis.",
      });
    }
  }
);

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(
    "================================="
  );

  console.log(
    `Server running on port ${PORT}`
  );

  console.log(
    `http://localhost:${PORT}`
  );

  console.log(
    "================================="
  );
});
# Smart Resume Screener

An AI-powered resume screening application that analyzes resumes against a given Job Description (JD), calculates an AI-based match score, identifies matched and missing skills, and provides recruiter-style recommendations.

---

## 🚀 Features

- User Signup and Login
- Upload PDF and DOCX resumes
- Upload multiple resumes for comparison
- Paste Job Description
- Automatic resume text extraction
- AI-powered resume and Job Description analysis using Google Gemini
- Match score from 0–10
- Matched skills identification
- Missing skills identification
- Resume strengths
- Resume weaknesses
- Improvement suggestions
- AI recruiter-style justification
- Candidate recommendation:
  - SHORTLIST
  - REVIEW
  - REJECT
- Multiple candidate ranking
- Analysis history
- View previous analysis results
- MongoDB database storage
- Responsive React frontend

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │        User          │
                    │   Login / Signup     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │                      │
                    │  Upload Resume       │
                    │  Enter Job Desc.     │
                    │  View Results        │
                    │  View History        │
                    └──────────┬───────────┘
                               │
                         HTTP REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    │                      │
                    │ Resume Processing    │
                    │ Authentication      │
                    │ API Routes           │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
       ┌─────────────────┐             ┌─────────────────┐
       │  Resume Parser  │             │  Google Gemini  │
       │                 │             │       LLM       │
       │  PDF / DOCX     │             │                 │
       │  Text Extraction│             │  Resume + JD    │
       └────────┬────────┘             │    Analysis     │
                │                      └────────┬────────┘
                │                               │
                └──────────────┬────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Structured Analysis  │
                    │                      │
                    │ Score                │
                    │ Matched Skills       │
                    │ Missing Skills       │
                    │ Strengths            │
                    │ Weaknesses           │
                    │ Suggestions          │
                    │ Recommendation       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │                      │
                    │  Store Analysis      │
                    │  History             │
                    └──────────────────────┘

                    🔄 Application Workflow
User creates an account or logs in.
User uploads one or more resumes.
User provides the Job Description.
Backend receives the uploaded files.
Resume text is extracted from PDF or DOCX files.
Resume text and Job Description are sent to Google Gemini.
Gemini analyzes the candidate's suitability for the job.
Gemini returns a structured JSON response.
Backend processes the AI response.
Analysis results are stored in MongoDB.
Frontend displays the analysis results.
Multiple candidates can be compared and ranked.
Previous analyses can be accessed through Analysis History.


🤖 LLM Integration

Google Gemini is used as the Large Language Model for semantic resume screening.

The model receives:

Resume text
Job Description

The model evaluates the candidate based only on information available in the resume and Job Description.

LLM Output

The model returns structured JSON containing:

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


Scoring Rules
Score	Recommendation
8–10	SHORTLIST
5–7	REVIEW
0–4	REJECT


📝 LLM Prompt

The core analysis prompt instructs Gemini to compare the resume with the Job Description and return a structured JSON response.

The prompt follows these rules:
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

Do not invent experience, skills, education, internships, certifications, or projects.

Only use information present in the resume.

Structured Output

The structured JSON response makes it easier for the backend to process the AI result and allows the frontend to display each analysis category separately.

🛠️ Tech Stack
Frontend
React
React Router
Tailwind CSS
Framer Motion
JavaScript
Backend
Node.js
Express.js
Multer
PDF parsing
Mammoth for DOCX extraction
AI
Google Gemini API
Structured JSON generation
Database
MongoDB
Mongoose
Development Tools
Git
GitHub
VS Code
npm


Project Structure

ResumeAnalyzerFullStack/
│
├── Backend/
│   ├── models/
│   │   └── Analysis.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── resumeai-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ResumeUpload.jsx
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Upload.jsx
│   │   ├── Results.jsx
│   │   ├── History.jsx
│   │   └── Ranking.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md


Installation and Setup
1. Clone the Repository
git clone https://github.com/Rishikareddy0211/smart-resume-screener.git
cd smart-resume-screener
2. Backend Setup

Navigate to the Backend directory:

cd Backend
Install dependencies:
npm install
Create a .env file inside the Backend directory:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
Start the backend:
node server.js

The backend runs on:

http://localhost:5000
3. Frontend Setup

Open another terminal.

Navigate to the frontend:

cd resumeai-frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Open the local URL displayed by Vite.

🔑 Environment Variables

The application uses environment variables for sensitive configuration.

PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

Never commit real API keys, passwords, or database credentials to GitHub.

📊 Example Analysis

A typical analysis can contain:

AI Match Score: 7/10

Matched Skills:
- Java
- React
- MongoDB

Missing Skills:
- Docker
- AWS

Strengths:
- Strong Java development experience
- Relevant full-stack project experience
- Good database knowledge

Weaknesses:
- Limited cloud experience

Recommendation:
REVIEW

The actual results depend on the resume and Job Description provided by the user.

📈 Candidate Ranking

When multiple resumes are uploaded, the application analyzes each candidate individually.

The ranking functionality allows candidates to be compared based on their AI-generated match scores and recommendations.

This helps recruiters quickly identify stronger candidates from a group of resumes.

📚 Analysis History

After an analysis is completed, the result is stored in MongoDB.

The History page allows users to:

View previously analyzed resumes
View analysis scores
View matched skills
View missing skills
Open the complete analysis result again

This allows users to revisit previous screening results without analyzing the same resume again.

🔐 Security

Sensitive credentials are stored using environment variables.

The following files and directories are excluded from GitHub:

.env
node_modules/
dist/
build/

API keys and database credentials should never be committed to the repository.

🎯 Project Goal

The goal of Smart Resume Screener is to reduce the manual effort involved in resume screening by using an LLM to compare candidate resumes with job requirements and provide structured screening results.

The system helps recruiters quickly identify suitable candidates while also providing candidates with useful feedback about missing skills and areas for improvement.

🔮 Future Improvements
JWT-based authentication
Role-based recruiter and candidate accounts
Resume keyword highlighting
Export analysis reports as PDF
Recruiter dashboard
Job Description management
Advanced screening analytics
Cloud deployment
👩‍💻 Author

Rishikareddy0211

GitHub:

https://github.com/Rishikareddy0211
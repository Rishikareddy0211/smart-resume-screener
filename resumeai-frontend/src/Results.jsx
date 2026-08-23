import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  // If no data
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-4">
            No analysis data found.
          </p>

          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Analyze Resume
          </button>
        </div>
      </div>
    );
  }

  const {
    score,
    matchedSkills,
    missingSkills,
    strengths,
    weaknesses,
    suggestions,
    aiJustification,
    recommendation,
    resumeInfo,
    resumeName,
  } = data;

  // Score is out of 10
  const scoreOutOf10 = Number(score) || 0;

  const percentage = Math.round(
    (scoreOutOf10 / 10) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-700 text-white p-10 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-400 opacity-20 blur-3xl rounded-full -top-40 -left-40"></div>

      <div className="absolute w-[400px] h-[400px] bg-indigo-400 opacity-20 blur-3xl rounded-full bottom-0 right-0"></div>

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">

        {/* ================= HEADER ================= */}

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold">
            Resume Analysis Report
          </h1>

          <p className="text-gray-300 mt-2">
            AI-powered insights for your resume
          </p>

          {resumeName && (
            <p className="text-blue-300 mt-2">
              📄 {resumeName}
            </p>
          )}
        </motion.div>

        {/* ================= SCORE ================= */}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 text-center shadow-xl"
        >
          <h2 className="text-2xl font-semibold mb-6">
            AI Match Score
          </h2>

          <div className="relative w-44 h-44 mx-auto">

            <div className="absolute inset-0 rounded-full border-8 border-white/20"></div>

            <div
              className="absolute inset-0 rounded-full border-8 border-blue-400"
              style={{
                clipPath: `inset(${100 - percentage}% 0 0 0)`,
              }}
            ></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <span className="text-4xl font-bold">
                {scoreOutOf10}/10
              </span>

              <span className="text-gray-300 mt-1">
                {percentage}%
              </span>

            </div>
          </div>

          {/* Recommendation */}

          <div className="mt-6">

            <span className="text-gray-300">
              Recommendation:
            </span>

            <span
              className={`ml-2 px-4 py-2 rounded-full font-semibold ${
                recommendation === "SHORTLIST"
                  ? "bg-green-500/20 text-green-300"
                  : recommendation === "REJECT"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}
            >
              {recommendation || "REVIEW"}
            </span>

          </div>
        </motion.div>

        {/* ================= SKILLS ================= */}

        <div className="grid md:grid-cols-2 gap-8">

          {/* Matched */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
          >

            <h3 className="text-xl font-semibold mb-4 text-green-400">
              ✅ Matched Skills
            </h3>

            <div className="flex flex-wrap gap-3">

              {(matchedSkills || []).map((skill, i) => (
                <span
                  key={i}
                  className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}

            </div>

          </motion.div>

          {/* Missing */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
          >

            <h3 className="text-xl font-semibold mb-4 text-red-400">
              ❌ Missing Skills
            </h3>

            <div className="flex flex-wrap gap-3">

              {(missingSkills || []).map((skill, i) => (
                <span
                  key={i}
                  className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}

            </div>

          </motion.div>

        </div>

        {/* ================= STRENGTHS & WEAKNESSES ================= */}

        <div className="grid md:grid-cols-2 gap-8">

          {/* Strengths */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
          >

            <h3 className="text-xl font-semibold mb-4 text-green-300">
              💪 Strengths
            </h3>

            <ul className="space-y-3 text-gray-200">

              {(strengths || []).map((item, i) => (
                <li key={i}>
                  ✓ {item}
                </li>
              ))}

            </ul>

          </motion.div>

          {/* Weaknesses */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
          >

            <h3 className="text-xl font-semibold mb-4 text-yellow-300">
              ⚠️ Weaknesses
            </h3>

            <ul className="space-y-3 text-gray-200">

              {(weaknesses || []).map((item, i) => (
                <li key={i}>
                  • {item}
                </li>
              ))}

            </ul>

          </motion.div>

        </div>

        {/* ================= RESUME INFORMATION ================= */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
        >

          <h3 className="text-xl font-semibold mb-6 text-blue-300">
            📄 Resume Information
          </h3>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Skills */}

            <div>

              <h4 className="font-semibold text-white mb-3">
                Skills
              </h4>

              <ul className="space-y-2 text-gray-300">

                {(resumeInfo?.skills || []).map(
                  (item, i) => (
                    <li key={i}>
                      • {item}
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* Education */}

            <div>

              <h4 className="font-semibold text-white mb-3">
                Education
              </h4>

              <ul className="space-y-2 text-gray-300">

                {(resumeInfo?.education || []).map(
                  (item, i) => (
                    <li key={i}>
                      • {item}
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* Experience */}

            <div>

              <h4 className="font-semibold text-white mb-3">
                Experience
              </h4>

              <ul className="space-y-2 text-gray-300">

                {(resumeInfo?.experience || []).map(
                  (item, i) => (
                    <li key={i}>
                      • {item}
                    </li>
                  )
                )}

              </ul>

            </div>

          </div>

        </motion.div>

        {/* ================= AI JUSTIFICATION ================= */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
        >

          <h3 className="text-xl font-semibold mb-4 text-purple-300">
            🤖 AI Justification
          </h3>

          <p className="text-gray-300 leading-relaxed">
            {aiJustification ||
              "No detailed justification was provided by the AI."}
          </p>

        </motion.div>

        {/* ================= SUGGESTIONS ================= */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
        >

          <h3 className="text-xl font-semibold mb-4 text-blue-300">
            💡 Suggestions to Improve
          </h3>

          <ul className="space-y-3 text-gray-300">

            {(suggestions || []).map((s, i) => (
              <li key={i}>
                • {s}
              </li>
            ))}

          </ul>

        </motion.div>

        {/* ================= BUTTONS ================= */}

        <div className="flex justify-center gap-4 flex-wrap">

          <button
            onClick={() => navigate("/history")}
            className="bg-indigo-500 px-6 py-3 rounded-lg hover:bg-indigo-600 transition shadow-lg"
          >
            View History
          </button>

          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-lg"
          >
            Analyze Another Resume
          </button>

        </div>

      </div>
    </div>
  );
}
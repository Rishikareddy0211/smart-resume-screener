import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Ranking() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            No ranking data found
          </h2>

          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            Analyze Resumes
          </button>
        </div>
      </div>
    );
  }

  const results = data.results || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-800 text-white p-10">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold">
            Resume Ranking
          </h1>

          <p className="text-gray-300 mt-2">
            AI-powered candidate comparison
          </p>
        </motion.div>


        {/* Job Description */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">

          <h2 className="text-xl font-semibold mb-3">
            Job Description
          </h2>

          <p className="text-gray-300 leading-relaxed">
            {data.jobDescription}
          </p>

        </div>


        {/* Summary */}
        <div className="text-center mb-8">

          <p className="text-lg text-gray-300">
            {data.totalResumes} resume
            {data.totalResumes !== 1 ? "s" : ""} analyzed
          </p>

        </div>


        {/* Ranking */}
        <div className="space-y-6">

          {results.map((candidate, index) => (

            <motion.div
              key={candidate.id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                {/* Candidate information */}
                <div>

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xl">
                      #{candidate.rank}
                    </div>

                    <div>

                      <h2 className="text-xl font-bold">
                        {candidate.resumeName}
                      </h2>

                      <p className="text-gray-400 text-sm">
                        Candidate Rank #{candidate.rank}
                      </p>

                    </div>

                  </div>

                </div>


                {/* Score */}
                <div className="text-center">

                  <p className="text-gray-400 text-sm">
                    AI Match Score
                  </p>

                  <p className="text-4xl font-bold text-blue-300">
                    {candidate.score}/10
                  </p>

                </div>


                {/* Recommendation */}
                <div>

                  <span
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      candidate.recommendation === "SHORTLIST"
                        ? "bg-green-500/20 text-green-300"
                        : candidate.recommendation === "REJECT"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {candidate.recommendation || "REVIEW"}
                  </span>

                </div>

              </div>


              {/* Skills */}
              <div className="mt-6 grid md:grid-cols-2 gap-6">

                {/* Matched */}
                <div>

                  <h3 className="text-green-300 font-semibold mb-2">
                    ✓ Matched Skills
                  </h3>

                  <div className="flex flex-wrap gap-2">

                    {(candidate.matchedSkills || []).map(
                      (skill, i) => (
                        <span
                          key={i}
                          className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>


                {/* Missing */}
                <div>

                  <h3 className="text-red-300 font-semibold mb-2">
                    ✕ Missing Skills
                  </h3>

                  <div className="flex flex-wrap gap-2">

                    {(candidate.missingSkills || []).map(
                      (skill, i) => (
                        <span
                          key={i}
                          className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>

              </div>


              {/* Strengths */}
              <div className="mt-6">

                <h3 className="text-yellow-300 font-semibold mb-2">
                  💪 Strengths
                </h3>

                <ul className="space-y-1 text-gray-300">

                  {(candidate.strengths || []).map(
                    (strength, i) => (
                      <li key={i}>
                        ✓ {strength}
                      </li>
                    )
                  )}

                </ul>

              </div>


              {/* AI Justification */}
              <div className="mt-6 bg-white/5 rounded-xl p-4">

                <h3 className="text-purple-300 font-semibold mb-2">
                  🤖 AI Justification
                </h3>

                <p className="text-gray-300 leading-relaxed">
                  {candidate.aiJustification ||
                    "No justification available."}
                </p>

              </div>

            </motion.div>

          ))}

        </div>


        {/* Bottom Buttons */}
        <div className="flex justify-center gap-4 mt-10">

          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Analyze More Resumes
          </button>

          <button
            onClick={() => navigate("/history")}
            className="bg-white/10 border border-white/20 px-6 py-3 rounded-lg hover:bg-white/20 transition"
          >
            View History
          </button>

        </div>

      </div>

    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/analyses")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch history");
        }

        return res.json();
      })
      .then((data) => {
        console.log("HISTORY API DATA:", data);
        console.log("IS ARRAY:", Array.isArray(data));

        setAnalyses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("History Error:", err);
        setAnalyses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-800 text-white p-10">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">

          <div>
            <h1 className="text-4xl font-bold">
              Analysis History
            </h1>

            <p className="text-gray-300 mt-2">
              View your previous resume analyses
            </p>
          </div>

          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-500 px-5 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Analyze New Resume
          </button>

        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-300">
            Loading analysis history...
          </div>
        )}

        {/* No analyses */}
        {!loading && analyses.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 text-center">

            <h2 className="text-2xl font-semibold mb-3">
              No Analysis History
            </h2>

            <p className="text-gray-300 mb-6">
              Analyze a resume to see your results here.
            </p>

            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Analyze Resume
            </button>

          </div>
        )}

        {/* Analysis Cards */}
        {!loading && analyses.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">

            {analyses.map((analysis) => {

              const percentage = Math.round(
                (Number(analysis.score) / 10) * 100
              );

              return (
                <div
                  key={analysis._id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
                >

                  {/* Resume name */}
                  <h2 className="text-xl font-semibold mb-2">
                    📄 {analysis.resumeName}
                  </h2>

                  {/* Date */}
                  <p className="text-sm text-gray-400 mb-5">
                    {analysis.createdAt
                      ? new Date(
                          analysis.createdAt
                        ).toLocaleString()
                      : "Date unavailable"}
                  </p>

                  {/* Score */}
                  <div className="flex items-center justify-between mb-5">

                    <div>
                      <p className="text-gray-300">
                        AI Match Score
                      </p>

                      <p className="text-3xl font-bold text-blue-300">
                        {analysis.score}/10
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-gray-300">
                        Match
                      </p>

                      <p className="text-xl font-semibold">
                        {percentage}%
                      </p>
                    </div>

                  </div>

                  {/* Matched skills */}
                  <div className="mb-4">

                    <h3 className="text-green-300 font-semibold mb-2">
                      Matched Skills
                    </h3>

                    <div className="flex flex-wrap gap-2">

                      {(analysis.matchedSkills || []).map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                  {/* Missing skills */}
                  <div className="mb-5">

                    <h3 className="text-red-300 font-semibold mb-2">
                      Missing Skills
                    </h3>

                    <div className="flex flex-wrap gap-2">

                      {(analysis.missingSkills || []).map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                  {/* View result */}
                  <button
                    onClick={() =>
                      navigate("/results", {
                        state: analysis
                      })
                    }
                    className="w-full bg-blue-500 py-3 rounded-lg hover:bg-blue-600 transition"
                  >
                    View Analysis
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}
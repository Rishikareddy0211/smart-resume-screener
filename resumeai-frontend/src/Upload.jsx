import { useState } from "react";
import { motion } from "framer-motion";
import ResumeUpload from "./components/ResumeUpload";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!files || files.length === 0) {
      alert("Please upload at least one resume");
      return;
    }

    if (!jobDesc.trim()) {
      alert("Please enter job description");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // Add all resumes
    files.forEach((file) => {
      formData.append("resumes", file);
    });

    // Add job description
    formData.append("jobDesc", jobDesc);

    try {
      const res = await fetch("http://localhost:5000/analyze-multiple", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      console.log("Multiple Resume Analysis:", data);

      // For now, we'll navigate to a ranking page.
      navigate("/ranking", {
        state: data,
      });

    } catch (err) {
      console.error("REAL ERROR:", err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-800 text-white flex items-center justify-center p-10 relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full -top-40 -left-40"></div>

      <div className="absolute w-[400px] h-[400px] bg-cyan-400 opacity-20 blur-3xl rounded-full bottom-0 right-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-blue-500/10 backdrop-blur-lg border border-blue-300/20 rounded-2xl shadow-2xl p-10 w-full max-w-3xl"
      >

        <h1 className="text-3xl font-bold mb-2 text-center">
          Resume Analyzer
        </h1>

        <p className="text-center text-gray-300 mb-8">
          Upload multiple resumes and compare candidates
        </p>

        <div className="space-y-6">

          {/* Resume Upload */}
          <ResumeUpload onFileSelect={setFiles} />

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="text-center text-sm text-green-400">
              {files.length} resume{files.length > 1 ? "s" : ""} selected
            </div>
          )}

          {/* Job Description */}
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste Job Description Here..."
            className="w-full bg-blue-500/10 border border-blue-300/20 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition h-32"
          />

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50"
          >
            {loading
              ? "Analyzing Resumes..."
              : "Analyze & Rank Resumes"}
          </button>

        </div>

      </motion.div>
    </div>
  );
}
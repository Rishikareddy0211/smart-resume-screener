import { useState } from "react";

export default function ResumeUpload({ onFileSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileNames, setFileNames] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = files.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== files.length) {
      alert("Only PDF and DOCX files are allowed");
    }

    if (validFiles.length === 0) return;

    // Maximum 10 resumes
    if (validFiles.length > 10) {
      alert("You can upload a maximum of 10 resumes");
      return;
    }

    setFileNames(validFiles.map((file) => file.name));

    // Send files to Upload.jsx
    onFileSelect(validFiles);
  };

  const handleRemove = (index) => {
    const updatedFiles = fileNames.filter((_, i) => i !== index);

    setFileNames(updatedFiles);

    // We need the actual files too, so for now
    // parent will be reset when all files are removed.
    if (updatedFiles.length === 0) {
      onFileSelect([]);
    }
  };

  const handleClear = () => {
    setFileNames([]);
    onFileSelect([]);
  };

  return (
    <div className="text-center">

      {/* ========================= */}
      {/* NO FILES */}
      {/* ========================= */}

      {fileNames.length === 0 && (
        <div
          className={`border-2 border-dashed rounded-xl p-10 cursor-pointer transition ${
            dragActive
              ? "border-indigo-400 bg-white/10"
              : "border-white/30"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            multiple
            onChange={handleChange}
            className="hidden"
            id="resumeUpload"
          />

          <label htmlFor="resumeUpload" className="cursor-pointer">
            <p className="text-lg">
              Drag & Drop resumes here
            </p>

            <p className="text-sm text-gray-300 mt-2">
              or click to browse
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Upload up to 10 resumes
            </p>
          </label>
        </div>
      )}

      {/* ========================= */}
      {/* FILES EXIST */}
      {/* ========================= */}

      {fileNames.length > 0 && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">

          <h3 className="text-green-300 font-semibold mb-4">
            📄 Selected Resumes ({fileNames.length})
          </h3>

          <div className="space-y-2 text-left">

            {fileNames.map((name, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-2"
              >
                <p className="text-green-300 text-sm">
                  📄 {name}
                </p>
              </div>
            ))}

          </div>

          <div className="flex justify-center gap-5 mt-5">

            {/* Add more */}
            <label className="cursor-pointer text-indigo-300 hover:underline">
              Add More
              <input
                type="file"
                accept=".pdf,.docx"
                multiple
                onChange={handleChange}
                className="hidden"
              />
            </label>

            {/* Clear */}
            <button
              onClick={handleClear}
              className="text-red-400 hover:underline"
            >
              Remove All
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
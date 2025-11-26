import { useState, useEffect } from "react";

export default function FlipkartUploadFail() {
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = "http://localhost:4000/api/flipkart/uploads";

  // Load uploads
  async function fetchUploads() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(API);
      const json = await res.json();
      setUploads(Array.isArray(json) ? json : []);
    } catch {
      setError("Failed to load flipkart uploads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUploads();
  }, []);

  // Upload File
  const uploadFile = async () => {
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(API, { method: "POST", body: formData });
    const json = await res.json();

    if (json.success) {
      alert("File uploaded successfully");
      setFile(null);
      fetchUploads();
    } else {
      alert(json.error || "Upload failed");
    }
  };

  // Delete File
  const deleteUpload = async (id) => {
    if (!confirm("Delete this file?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchUploads();
  };

  return (
    <div className="p-6">

      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Flipkart Settlement Upload
      </h2>

      {/* Upload Section */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 mb-10">
        <div className="flex flex-wrap gap-4 items-center">

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="border rounded-lg px-4 py-2 w-[350px] text-sm shadow-sm"
          />

          <button
            onClick={uploadFile}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow"
          >
            Upload & Process
          </button>

          <button
            onClick={() => window.location.href = "/flipkart/processed-output"}
            className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-black text-white shadow"
          >
            Processed Output
          </button>

          <button
            onClick={() => window.location.href = "/flipkart/master-file"}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow"
          >
            Master File
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
            ❗ {error}
          </div>
        )}
      </div>

      {/* Uploaded Files Table */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">

        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Uploaded Files
        </h3>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : uploads.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No files uploaded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left border">
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">File Name</th>
                  <th className="p-3 border">Marketplace</th>
                  <th className="p-3 border">Rows</th>
                  <th className="p-3 border">Uploaded</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>

              <tbody>
                {uploads.map((u, i) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition border">
                    <td className="p-3 border">{i + 1}</td>

                    {/* ORIGINAL FILE NAME */}
                    <td className="p-3 border font-medium text-gray-800">
                      {u.originalname}
                    </td>

                    <td className="p-3 border">Flipkart</td>

                    {/* ROW COUNT FROM parsed JSON */}
                    <td className="p-3 border">{u.parsed?.length ?? 0}</td>

                    <td className="p-3 border">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>

                    <td className="p-3 border">
                      <div className="flex gap-4">

                        {/* ANALYZE BUTTON */}
                        <button
                           onClick={() => window.open(`http://localhost:4000/api/flipkart/analyze/${u._id}`)}
                           className="px-4 py-2 bg-blue-600 text-white rounded"
                          >
                         Analyze
                        </button>


                        {/* DELETE */}
                        <button
                          onClick={() => deleteUpload(u._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow"
                        >
                          ✕
                        </button>

                        {/* DOWNLOAD */}
                        <button
                          onClick={() => window.open(`http://localhost:4000/flipkart/${u.filename}`)}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                        >
                          ⬇
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
}

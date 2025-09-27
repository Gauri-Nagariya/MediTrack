// RecordsPage.jsx
import React, { useState } from "react";

const categories = [
  "Lab Report",
  "Prescription",
  "Bill",
  "Vaccination",
  "Reports",
];

const Records = () => {
  const [documents, setDocuments] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFile, setViewFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get("file");

    const newDoc = {
      id: Date.now(),
      file,
      doctor: formData.get("doctor"),
      hospital: formData.get("hospital"),
      category: formData.get("category"),
      description: formData.get("description"),
      date: new Date(),
      previewUrl: URL.createObjectURL(file),
    };

    setDocuments([newDoc, ...documents]);
    e.target.reset();
  };

  const filteredDocs = documents
    .filter((doc) => (filterCategory ? doc.category === filterCategory : true))
    .filter((doc) =>
      searchTerm
        ? doc.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .slice(0, 3);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Records</h2>

      <form onSubmit={handleUpload} className="mb-6 flex flex-col gap-2">
        <input type="file" name="file" required />
        <input type="text" name="doctor" placeholder="Doctor Name" required />
        <input type="text" name="hospital" placeholder="Hospital Name" required />
        <select name="category" required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <textarea name="description" placeholder="Description" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Upload
        </button>
      </form>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="border p-2 rounded shadow-sm flex justify-between items-center">
            <div>
              <p><strong>Doctor:</strong> {doc.doctor}</p>
              <p><strong>Hospital:</strong> {doc.hospital}</p>
              <p><strong>Category:</strong> {doc.category}</p>
              <p><strong>Description:</strong> {doc.description}</p>
              <p><strong>Date:</strong> {doc.date.toLocaleString()}</p>
            </div>
            <button
              onClick={() => setViewFile(doc.previewUrl)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              View
            </button>
          </div>
        ))}
      </div>

      {/* Full-Screen Preview */}
      {viewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4">
          <div className="relative w-full h-full flex justify-center items-center">
            {viewFile.endsWith(".pdf") ? (
              <iframe src={viewFile} className="w-full h-full" title="PDF Preview"></iframe>
            ) : (
              <img src={viewFile} alt="Preview" className="max-w-full max-h-full" />
            )}
            <button
              onClick={() => setViewFile(null)}
              className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;

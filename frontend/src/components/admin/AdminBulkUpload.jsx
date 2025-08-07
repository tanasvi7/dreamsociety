import React, { useState, useRef } from 'react';
import axios from 'axios';
import { CloudUpload, Loader2, CheckCircle, XCircle } from 'lucide-react';

const AdminBulkUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    let rawToken = localStorage.getItem('token');
    let token = rawToken;
    if (rawToken && rawToken.startsWith('Bearer ')) {
      token = rawToken.slice(7);
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:3000/bulkUpload/upload/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || err.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 flex items-center gap-2">
          <CloudUpload className="w-7 h-7 text-blue-500" /> Bulk Upload Users
        </h2>
        
        {/* Template Download Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">📥 Download Sample Template</h3>
          <div className="flex flex-wrap gap-3">
            <a 
              href="/sample-bulk-upload-template.xlsx" 
              download 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Excel Template (.xlsx)
            </a>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            💡 <strong>Recommended:</strong> Use the Excel template for better formatting and easier data entry.
          </p>
        </div>

        <ol className="mb-6 text-gray-700 list-decimal list-inside space-y-1">
          <li>Download the sample Excel template above.</li>
          <li>Fill in user, education, employment, and family details. <span className="text-xs text-gray-500">(Leave cells blank for missing data)</span></li>
          <li>Save the file and upload it below.</li>
        </ol>
        
        {/* Template Structure Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">📋 Template Structure</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Required Fields:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>full_name</li>
                <li>email</li>
                <li>phone (+91 format)</li>
                <li>password</li>
              </ul>
            </div>
            <div>
              <strong>Optional Sections:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Profile details (51 total columns)</li>
                <li>Education (up to 3 entries)</li>
                <li>Employment (up to 3 entries)</li>
                <li>Family members (up to 3 entries)</li>
              </ul>
            </div>
          </div>
        </div>
        <form onSubmit={handleUpload}>
          <div
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 mb-4 transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="absolute inset-0 opacity-0 cursor-pointer"
              ref={inputRef}
              onChange={handleFileChange}
              tabIndex={-1}
            />
            <CloudUpload className="w-12 h-12 text-blue-400 mb-2" />
            <p className="text-gray-700 font-medium">Drag & drop your file here, or <span className="text-blue-600 underline cursor-pointer" onClick={() => inputRef.current.click()}>browse</span></p>
            <p className="text-xs text-gray-500 mt-1">Accepted: .xlsx, .xls, .csv &nbsp; | &nbsp; Max size: 2MB</p>
            {file && <div className="mt-2 text-sm text-green-600">Selected: {file.name}</div>}
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {/* Results */}
        {result && (
          <div className="mt-6">
            {result.error ? (
              <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
                <XCircle className="w-5 h-5" />
                <span>{result.error}</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-semibold">Success: {result.success}</span>
                  <span className="text-red-700 font-semibold ml-4">Failure: {result.failure}</span>
                </div>
                {result.errors && result.errors.length > 0 && (
                  <div className="overflow-x-auto mt-2">
                    <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 border-b text-left">Email</th>
                          <th className="px-3 py-2 border-b text-left">Phone</th>
                          <th className="px-3 py-2 border-b text-left">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((err, idx) => (
                          <tr key={idx} className="bg-white even:bg-gray-50">
                            <td className="px-3 py-2 border-b">{err.email}</td>
                            <td className="px-3 py-2 border-b">{err.phone}</td>
                            <td className="px-3 py-2 border-b text-red-600">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBulkUpload; 
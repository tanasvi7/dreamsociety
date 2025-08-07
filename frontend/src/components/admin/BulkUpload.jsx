
import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  X,
  ArrowRight,
  Loader
} from 'lucide-react';

const BulkUpload = () => {
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [importStatus, setImportStatus] = useState('idle');
  const [importResults, setImportResults] = useState(null);

  const supportedFormats = [
    { name: 'CSV', extension: '.csv', icon: FileText },
    { name: 'Excel', extension: '.xlsx', icon: FileText },
    { name: 'JSON', extension: '.json', icon: FileText }
  ];

  const requiredFields = [
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email Address', required: true },
    { key: 'phone', label: 'Phone Number', required: true },
    { key: 'password', label: 'Password', required: true },
    { key: 'photo_url', label: 'Photo URL', required: false },
    { key: 'dob', label: 'Date of Birth', required: false },
    { key: 'gender', label: 'Gender', required: false },
    { key: 'village', label: 'Village', required: false },
    { key: 'mandal', label: 'Mandal', required: false },
    { key: 'district', label: 'District', required: false },
    { key: 'pincode', label: 'Pincode', required: false },
    { key: 'caste', label: 'Caste', required: false },
    { key: 'subcaste', label: 'Subcaste', required: false },
    { key: 'marital_status', label: 'Marital Status', required: false },
    { key: 'native_place', label: 'Native Place', required: false }
  ];

  const sampleFileColumns = [
    'full_name', 'email', 'phone', 'password', 'photo_url', 'dob', 'gender', 'village', 'mandal', 'district', 'pincode', 'caste', 'subcaste', 'marital_status', 'native_place',
    'education_degree_1', 'education_institution_1', 'education_year_of_passing_1', 'education_grade_1',
    'education_degree_2', 'education_institution_2', 'education_year_of_passing_2', 'education_grade_2',
    'education_degree_3', 'education_institution_3', 'education_year_of_passing_3', 'education_grade_3',
    'employment_company_name_1', 'employment_role_1', 'employment_years_of_experience_1', 'employment_currently_working_1',
    'employment_company_name_2', 'employment_role_2', 'employment_years_of_experience_2', 'employment_currently_working_2',
    'employment_company_name_3', 'employment_role_3', 'employment_years_of_experience_3', 'employment_currently_working_3',
    'family_name_1', 'family_relation_1', 'family_education_1', 'family_profession_1',
    'family_name_2', 'family_relation_2', 'family_education_2', 'family_profession_2',
    'family_name_3', 'family_relation_3', 'family_education_3', 'family_profession_3'
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadStep(2);
      
      // Mock file parsing - in real app, you'd parse the actual file
      const mockColumns = ['full_name', 'email', 'phone', 'password', 'photo_url', 'dob', 'gender', 'village', 'mandal', 'district', 'pincode', 'caste', 'subcaste', 'marital_status', 'native_place'];
      setFieldMapping(mockColumns.reduce((acc, col) => ({ ...acc, [col]: '' }), {}));
    }
  };

  const handleFieldMapping = (fileColumn, systemField) => {
    setFieldMapping(prev => ({
      ...prev,
      [fileColumn]: systemField
    }));
  };

  const startImport = () => {
    setImportStatus('processing');
    setUploadStep(3);
    
    // Simulate import process
    setTimeout(() => {
      setImportStatus('completed');
      setImportResults({
        total: 150,
        successful: 145,
        failed: 5,
        duplicates: 12,
        errors: [
          { row: 23, field: 'email', message: 'Invalid email format' },
          { row: 45, field: 'phone', message: 'Invalid phone number' },
          { row: 67, field: 'email', message: 'Duplicate email address' },
        ]
      });
    }, 3000);
  };

  const resetUpload = () => {
    setUploadStep(1);
    setUploadedFile(null);
    setFieldMapping({});
    setImportStatus('idle');
    setImportResults(null);
  };

  const downloadSampleFile = () => {
    // Link to the CSV template file in public directory
    const a = document.createElement('a');
    a.href = '/sample-bulk-upload-template.csv';
    a.download = 'sample-bulk-upload-template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Users</h2>
          <button
            onClick={downloadSampleFile}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Sample File</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                uploadStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <ArrowRight className={`w-4 h-4 mx-2 ${
                  uploadStep > step ? 'text-blue-600' : 'text-gray-400'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-8 text-sm">
          <span className={uploadStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            Upload File
          </span>
          <span className={uploadStep >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            Map Fields
          </span>
          <span className={uploadStep >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            Import Status
          </span>
        </div>
      </div>

      {/* Step 1: File Upload */}
      {uploadStep === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Upload Your File</h3>
          
          {/* Supported Formats */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Supported File Formats</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportedFormats.map((format) => (
                <div key={format.name} className="border border-gray-200 rounded-lg p-4 text-center">
                  <format.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-gray-900">{format.name}</p>
                  <p className="text-sm text-gray-600">{format.extension}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The sample template is in CSV format which can be opened in Excel. The template includes all required columns and example data.
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-gray-600 mb-4">
              Maximum file size: 10MB
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
            >
              Select File
            </label>
          </div>

          {/* File Requirements */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">File Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• First row should contain column headers</li>
              <li>• Required fields: full_name, email, phone, password</li>
              <li>• Optional fields: photo_url, dob, gender, village, mandal, district, pincode, caste, subcaste, marital_status, native_place</li>
              <li>• Education details: education_degree_1, education_institution_1, education_year_of_passing_1, education_grade_1 (up to 3 entries)</li>
              <li>• Employment details: employment_company_name_1, employment_role_1, employment_years_of_experience_1, employment_currently_working_1 (up to 3 entries)</li>
              <li>• Family details: family_name_1, family_relation_1, family_education_1, family_profession_1 (up to 3 entries)</li>
              <li>• Download the sample template for the complete structure</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <a 
                href="/bulk-upload-template-guide.md" 
                target="_blank" 
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                📖 View detailed template guide
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Field Mapping */}
      {uploadStep === 2 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 2: Map Your Fields</h3>
            <button
              onClick={resetUpload}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              File: <span className="font-medium">{uploadedFile?.name}</span>
            </p>
            <p className="text-sm text-gray-500">
              Map the columns from your file to the corresponding system fields
            </p>
          </div>

          <div className="space-y-4">
            {Object.keys(fieldMapping).map((fileColumn) => (
              <div key={fileColumn} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    File Column: {fileColumn}
                  </label>
                </div>
                <div>
                  <select
                    value={fieldMapping[fileColumn]}
                    onChange={(e) => handleFieldMapping(fileColumn, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select system field...</option>
                    {requiredFields.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label} {field.required ? '(Required)' : '(Optional)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={startImport}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Import
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Import Status */}
      {uploadStep === 3 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Step 3: Import Status</h3>

          {importStatus === 'processing' && (
            <div className="text-center py-8">
              <Loader className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-lg font-medium text-gray-900 mb-2">Processing your file...</p>
              <p className="text-gray-600">This may take a few minutes depending on file size</p>
            </div>
          )}

          {importStatus === 'completed' && importResults && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-green-900">Import Completed Successfully!</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{importResults.total}</p>
                    <p className="text-sm text-gray-600">Total Records</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{importResults.successful}</p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{importResults.duplicates}</p>
                    <p className="text-sm text-gray-600">Duplicates</p>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {importResults.errors.length > 0 && (
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                    <h4 className="text-lg font-semibold text-red-900">Import Errors</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {importResults.errors.map((error, index) => (
                      <div key={index} className="bg-white rounded p-3 border border-red-200">
                        <p className="text-sm">
                          <span className="font-medium">Row {error.row}:</span>{' '}
                          <span className="text-red-600">{error.message}</span>{' '}
                          <span className="text-gray-600">(Field: {error.field})</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={resetUpload}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload Another File
                </button>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Error Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkUpload;

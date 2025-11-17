import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export const MaterialsUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    // TODO: Implement actual file upload to Firebase Storage
    setTimeout(() => {
      const fileNames = Array.from(files).map(f => f.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
      setUploading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Study Materials</h2>
        <p className="text-gray-600 mb-6">
          Upload financial documents, reports, or study materials to analyze with AI
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <label className="cursor-pointer">
            <span className="text-blue-600 hover:text-blue-700 font-medium">
              Click to upload
            </span>
            <span className="text-gray-600"> or drag and drop</span>
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">
            PDF, DOC, DOCX, TXT up to 10MB
          </p>
        </div>

        {uploading && (
          <div className="mt-4 text-center text-gray-600">
            Uploading...
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((fileName, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
              >
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="flex-1 text-gray-700">{fileName}</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Analyze
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

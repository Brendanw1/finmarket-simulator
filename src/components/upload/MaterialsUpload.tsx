import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';
import { uploadCourseMaterials } from '../../services/claude';
import { saveUploadedMaterial, getUserMaterials } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UploadedMaterial } from '../../types';

export const MaterialsUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [materials, setMaterials] = useState<UploadedMaterial[]>([]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!validTypes.includes(file.type)) {
      setUploadStatus('error');
      setStatusMessage('Please upload a PDF or PowerPoint file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadStatus('error');
      setStatusMessage('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadStatus('processing');
    setUploadProgress(25);
    setStatusMessage('Reading file...');

    try {
      // Convert file to base64
      const base64Data = await convertFileToBase64(file);
      setUploadProgress(50);
      setStatusMessage('Uploading to Claude...');

      // Upload to Claude API
      const result = await uploadCourseMaterials(file.name, base64Data, file.type);

      if (!result.success) {
        throw new Error(result.error || 'Failed to process course materials');
      }

      setUploadProgress(75);
      setStatusMessage('Saving to database...');

      // Save material reference to Firebase
      const material: UploadedMaterial = {
        id: '',
        userId: user.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        content: result.summary,
        uploadedAt: new Date(),
        status: 'ready',
      };

      const materialId = await saveUploadedMaterial(material);
      material.id = materialId;

      setUploadProgress(100);
      setUploadStatus('success');
      setStatusMessage(`Successfully uploaded ${file.name}! Claude has analyzed your course materials.`);

      // Reload materials list
      loadMaterials();

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const loadMaterials = async () => {
    if (!user) return;

    try {
      const userMaterials = await getUserMaterials(user.id);
      setMaterials(userMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  // Load materials on mount
  useEffect(() => {
    loadMaterials();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Course Materials</h2>
          <p className="text-gray-600">
            Upload your textbook PDFs or lecture slides. Claude will analyze them to generate realistic scenarios
            and provide educational feedback based on your actual course content.
          </p>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.ppt,.pptx"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer flex flex-col items-center ${uploading ? 'opacity-50' : ''}`}
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <span className="text-lg font-medium text-gray-700 mb-2">
              {uploading ? 'Processing...' : 'Click to upload or drag and drop'}
            </span>
            <span className="text-sm text-gray-500">PDF or PowerPoint (Max 10MB)</span>
          </label>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{statusMessage}</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === 'success' && (
          <div className="mt-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{statusMessage}</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{statusMessage}</span>
          </div>
        )}

        {/* Uploaded Materials List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Materials</h3>

          {materials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No materials uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{material.fileName}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded {material.uploadedAt.toLocaleDateString()} •{' '}
                        {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {material.status === 'processing' && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}
                    {material.status === 'ready' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Ready</span>
                      </div>
                    )}
                    {material.status === 'error' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">Error</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Upload your course textbooks or lecture slides</li>
            <li>Claude analyzes the content and extracts key concepts and frameworks</li>
            <li>Scenarios are generated based on topics from your materials</li>
            <li>Feedback references specific theories and models from your course</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

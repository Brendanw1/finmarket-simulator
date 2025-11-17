import { UploadedMaterial } from '../../types';

interface DocumentViewerProps {
  document: UploadedMaterial | null;
}

export const DocumentViewer = ({ document }: DocumentViewerProps) => {
  if (!document) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Select a document to view</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">{document.fileName}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="p-6">
        {document.status === 'processing' && (
          <div className="text-center py-12">
            <p className="text-gray-600">Processing document...</p>
          </div>
        )}

        {document.status === 'error' && (
          <div className="text-center py-12">
            <p className="text-red-600">Error processing document</p>
          </div>
        )}

        {document.status === 'ready' && (
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {document.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

import { FaExclamationCircle } from "react-icons/fa";

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
        <FaExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi kết nối</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;

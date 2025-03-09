import React from "react";
import { File, Clock, Star, Users, MoreVertical, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const RecentDocuments = () => {
  const navigate = useNavigate();

  const documents = [
    { id: 1, title: "Lab Template - SPCC", icon: "📄", lastModified: "Feb 21, 2025", starred: false },
    { id: 2, title: "DT", icon: "📄", lastModified: "Feb 21, 2025", starred: false },
    { id: 3, title: "nmims_hack", icon: "📊", lastModified: "Feb 19, 2025", starred: false },
    { id: 4, title: "PS", icon: "📊", lastModified: "Feb 19, 2025", starred: false },
    { id: 5, title: "Shirdi Nagar-B.docx", icon: "📝", lastModified: "Feb 19, 2025", starred: false },
  ];

  const handleCreateNew = () => {
    navigate("/collaborations");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-gray-800">Recent documents</h1>
        <button
          onClick={handleCreateNew}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="border border-gray-200 rounded-lg shadow-sm cursor-pointer"
          onClick={handleCreateNew}
        >
          <div className="h-36 bg-gray-50 flex items-center justify-center border-b">
            <Plus className="w-10 h-10 text-blue-600" />
          </div>
          <div className="p-3 text-center">
            <h3 className="text-sm font-medium text-blue-600">Create new</h3>
          </div>
        </motion.div>

        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            whileHover={{ scale: 1.05 }}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            <Link to={`/collabarotion/85e15121-d003-4e29-aead-f8c801baf08a`}>
            <div className="h-36 bg-gray-100 flex items-center justify-center border-b">
              <span className="text-2xl">{doc.icon}</span>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-800 truncate" title={doc.title}>{doc.title}</h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                <span>{doc.lastModified}</span>
              </div>
            </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentDocuments;
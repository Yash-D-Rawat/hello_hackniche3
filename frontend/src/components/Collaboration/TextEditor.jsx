import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Save, RotateCcw } from "lucide-react";

const SAVE_INTERVAL_MS = 60000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isViewingVersion, setIsViewingVersion] = useState(false);
  const [versionDescription, setVersionDescription] = useState("");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  // Load document
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
      setIsViewingVersion(false);
      setCurrentVersion(null);
    });

    socket.emit("get-document", documentId);

    // Handle versions list
    socket.on("document-versions", (versionsList) => {
      setVersions(versionsList);
    });

    // Handle new version creation
    socket.on("version-created", (newVersion) => {
      setVersions((prevVersions) => [newVersion, ...prevVersions]);
    });

    // Handle loading a specific version
    socket.on("load-version", (versionData) => {
      quill.setContents(versionData);
      // Keep editor disabled in version view mode
      if (isViewingVersion) {
        quill.disable();
      }
    });

    // If user is authenticated, set user ID
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("set-user", userId);
    }
  }, [socket, quill, documentId]);

  // Auto-save document
  useEffect(() => {
    if (socket == null || quill == null || isViewingVersion) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill, isViewingVersion]);

  // Receive changes from other users
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // Send changes to other users
  useEffect(() => {
    if (socket == null || quill == null || isViewingVersion) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill, isViewingVersion]);

  // Quill editor initialization
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  // Function to load a specific version
  const loadVersion = (versionNumber) => {
    if (socket == null) return;

    socket.emit("get-version", { documentId, versionNumber });
    setCurrentVersion(versionNumber);
    setIsViewingVersion(true);
  };

  // Function to return to the current document
  const returnToCurrent = () => {
    if (socket == null) return;

    socket.emit("get-document", documentId);
    setIsViewingVersion(false);
    setCurrentVersion(null);
  };

  // Function to manually save a version with description
  const saveVersion = () => {
    if (socket == null || quill == null || isViewingVersion) return;

    socket.emit("save-version", {
      documentId,
      data: quill.getContents(),
      description:
        versionDescription || `Manual save ${new Date().toLocaleString()}`,
    });

    setVersionDescription("");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar for AI */}
      <div
        className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
          leftSidebarOpen ? "w-80" : "w-0"
        } flex flex-col relative`}
      >
        {leftSidebarOpen && (
          <div className="p-4 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
            <div className="space-y-4">
              <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                Generate Ideas
              </button>
              <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                Improve Grammar
              </button>
              <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                Summarize Content
              </button>
              {/* Add more AI functionality buttons as needed */}
            </div>
          </div>
        )}

        {/* Left Sidebar Toggle Button */}
        <button
          className="absolute -right-10 top-4 bg-gray-200 p-2 rounded-r hover:bg-gray-300 transition"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          aria-label={leftSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
        >
          {leftSidebarOpen ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Version View Banner */}
        {isViewingVersion && (
          <div className="px-4 py-2 bg-yellow-100 border-b border-yellow-200 flex justify-between items-center">
            <p className="text-yellow-800">
              Viewing version {currentVersion} - Read only mode
            </p>
            <button
              onClick={returnToCurrent}
              className="flex items-center gap-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded transition"
            >
              <RotateCcw size={16} />
              Return to Current Version
            </button>
          </div>
        )}

        {/* Editor Container */}
        <div className="flex-1 overflow-auto">
          <div className="h-full" ref={wrapperRef}></div>
        </div>
      </div>

      {/* Right Sidebar for Version History */}
      <div
        className={`bg-gray-50 border-l border-gray-200 transition-all duration-300 ${
          rightSidebarOpen ? "w-80" : "w-0"
        } flex flex-col relative`}
      >
        {rightSidebarOpen && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Version History</h3>

              {/* Save Version Form */}
              {!isViewingVersion && (
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Version description"
                    value={versionDescription}
                    onChange={(e) => setVersionDescription(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={saveVersion}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded transition"
                    title="Save Version"
                  >
                    <Save size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Versions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {versions.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No versions available
                </p>
              ) : (
                <ul className="space-y-2">
                  {versions.map((version) => (
                    <li
                      key={version.versionNumber}
                      className={`p-3 rounded border ${
                        currentVersion === version.versionNumber
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-white border-gray-200"
                      } hover:shadow-sm transition`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <button
                          onClick={() => loadVersion(version.versionNumber)}
                          className="font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Version {version.versionNumber}
                        </button>
                        <span className="text-xs text-gray-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {version.description && (
                        <p className="text-sm text-gray-600 truncate">
                          {version.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Right Sidebar Toggle Button */}
        <button
          className="absolute -left-10 top-4 bg-gray-200 p-2 rounded-l hover:bg-gray-300 transition"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          aria-label={
            rightSidebarOpen ? "Close version sidebar" : "Open version sidebar"
          }
        >
          {rightSidebarOpen ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>
    </div>
  );
}

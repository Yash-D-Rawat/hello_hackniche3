import { useCallback, useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  Download,
  Share,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import AISidebar from "./AISidebar"; // Import the new AISidebar component

const SAVE_INTERVAL_MS = 30000;
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
  const [isConnected, setIsConnected] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [notification, setNotification] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const formRef = useRef();
  useEffect(() => {
    let s;
    let retryCount = 0;
    const maxRetries = 5;
    const connectSocket = () => {
      try {
        s = io("http://localhost:5000", {
          reconnectionAttempts: maxRetries,
          timeout: 10000,
          transports: ["websocket", "polling"],
        });
        s.on("connect", () => {
          console.log("Socket connected successfully");
          setIsConnected(true);
        });
        s.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
          retryCount++;
          if (retryCount >= maxRetries) {
            console.error(
              "Max retries reached, please check if the server is running"
            );
          }
        });
        s.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          setIsConnected(false);
        });
        s.on("error", (error) => {
          console.error("Socket error:", error);
          setNotification({
            type: "error",
            message: error.message || "An error occurred",
          });

          setTimeout(() => setNotification(null), 5000);
        });
        setSocket(s);
      } catch (error) {
        console.error("Error creating socket:", error);
      }
    };
    connectSocket();
    return () => {
      if (s) {
        s.disconnect();
      }
    };
  }, []);
  useEffect(() => {
    if (socket == null || quill == null || !isConnected) return;
    if (isViewingVersion) return;
    const handleLoadDocument = (document) => {
      quill.setContents(document);
      quill.enable();
    };
    socket.once("load-document", handleLoadDocument);
    socket.emit("get-document", documentId);
    const handleDocumentVersions = (versionsList) => {
      setVersions(versionsList);
    };
    const handleVersionCreated = (newVersion) => {
      setVersions((prevVersions) => {
        const exists = prevVersions.some(
          (v) => v.versionNumber === newVersion.versionNumber
        );
        if (exists) {
          return prevVersions.map((v) =>
            v.versionNumber === newVersion.versionNumber ? newVersion : v
          );
        }
        return [newVersion, ...prevVersions];
      });
    };
    socket.on("document-versions", handleDocumentVersions);
    socket.on("version-created", handleVersionCreated);
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("set-user", userId);
    }
    return () => {
      socket.off("document-versions", handleDocumentVersions);
      socket.off("version-created", handleVersionCreated);
      socket.off("load-document", handleLoadDocument);
    };
  }, [socket, quill, documentId, isConnected, isViewingVersion]);
  useEffect(() => {
    if (socket == null || quill == null || !isConnected) return;
    const handleLoadVersion = (versionData) => {
      console.log("Loading version data", versionData);
      quill.setContents(versionData);
      if (isViewingVersion) {
        quill.disable();
      } else {
        quill.enable();
      }
    };
    const handleVersionRestored = (response) => {
      if (response.success) {
        setNotification({
          type: "success",
          message: response.message || "Version restored successfully",
        });
        setTimeout(() => setNotification(null), 5000);
      }
    };
    socket.on("load-version", handleLoadVersion);
    socket.on("version-restored", handleVersionRestored);
    return () => {
      socket.off("load-version", handleLoadVersion);
      socket.off("version-restored", handleVersionRestored);
    };
  }, [socket, quill, isConnected, isViewingVersion]);
  useEffect(() => {
    if (socket == null || quill == null || !isConnected) return;
    if (isViewingVersion) return;
    let saveTimeout = null;
    const performSave = () => {
      socket.emit("save-document", quill.getContents());
      setLastSaved(new Date());
    };
    const interval = setInterval(() => {
      if (saveTimeout) clearTimeout(saveTimeout);
      performSave();
    }, SAVE_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [socket, quill, isViewingVersion, isConnected]);
  useEffect(() => {
    if (socket == null || quill == null || !isConnected) return;
    if (isViewingVersion) return;
    let isReceivingChanges = false;
    const handler = (delta) => {
      isReceivingChanges = true;
      quill.updateContents(delta);
      setTimeout(() => {
        isReceivingChanges = false;
      }, 0);
    };
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill, isConnected, isViewingVersion]);
  useEffect(() => {
    if (socket == null || quill == null || !isConnected) return;
    if (isViewingVersion) return;
    let lastChangeId = null;
    let isReceivingChanges = false;
    const handler = (delta, oldDelta, source) => {
      if (source !== "user" || isReceivingChanges) return;
      const changeId = JSON.stringify(delta) + Date.now();
      if (changeId === lastChangeId) return;
      lastChangeId = changeId;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill, isViewingVersion, isConnected]);
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
  const loadVersion = (versionNumber) => {
    if (socket == null || !isConnected) return;
    console.log(`Loading version ${versionNumber}`);
    setIsViewingVersion(true);
    setCurrentVersion(versionNumber);
    socket.emit("get-version", { documentId, versionNumber });
  };
  const returnToCurrent = () => {
    if (socket == null || !isConnected) return;
    setIsViewingVersion(false);
    setCurrentVersion(null);
    if (quill) {
      quill.enable();
    }
    socket.emit("get-document", documentId);
  };
  const restoreVersion = (versionNumber) => {
    if (socket == null || !isConnected) return;
    socket.emit("get-version", { documentId, versionNumber });
    socket.once("load-version", (versionData) => {
      socket.emit("restore-version", {
        documentId,
        data: versionData,
        restoredFromVersion: versionNumber,
      });
      setIsViewingVersion(false);
      setCurrentVersion(null);
      if (quill) {
        quill.enable();
      }
    });
  };
  const saveVersion = () => {
    if (socket == null || quill == null || isViewingVersion || !isConnected)
      return;
    setTimeout(() => {
      socket.emit("save-version", {
        documentId,
        data: quill.getContents(),
        description:
          versionDescription || `Manual save ${new Date().toLocaleString()}`,
      });
      setVersionDescription("");
    }, 100);
  };
  const downloadAsPDF = () => {
    if (quill == null) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px";
    document.body.appendChild(iframe);
    const content = quill.root.innerHTML;
    iframe.contentDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document - ${documentId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.5;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 20px;
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 15px;
            }
            img {
              max-width: 100%;
            }
            pre {
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              overflow-x: auto;
            }
            blockquote {
              border-left: 4px solid #ccc;
              margin-left: 0;
              padding-left: 16px;
            }
            .ql-align-center {
              text-align: center;
            }
            .ql-align-right {
              text-align: right;
            }
            .ql-align-justify {
              text-align: justify;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };
  const handleShareModalToggle = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };
  const sendShareEmail = (e) => {
    e.preventDefault();
    const documentURL = `${window.location.origin}/Collabarotion/${documentId}`;
    const templateParams = {
      to_email: recipientEmail,
      from_name: localStorage.getItem("userName") || "Document Owner",
      document_link: documentURL,
      document_id: documentId,
      message: `You've been invited to collaborate on document ${documentId}. Click the link to join. ${documentURL}`,
    };
    emailjs
      .send("service_ziri33s", "template_vkc9b14", templateParams, {
        publicKey: "VIj0pNTwEKhKaukmj",
      })
      .then(
        () => {
          console.log("SUCCESS!");
          Swal.fire({
            title: "Success!",
            text: "Invitation sent successfully",
            icon: "success",
          });
          setRecipientEmail("");
          setIsShareModalOpen(false);
        },
        (error) => {
          console.log("FAILED...", error.text);
          Swal.fire({
            title: "Error!",
            text: "Failed to send invitation",
            icon: "error",
          });
        }
      );
  };
  return (
    <div>
      <div className="flex h-screen overflow-hidden">
        <div
          className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
            leftSidebarOpen ? "w-80" : "w-0"
          } flex flex-col relative`}
        >
          <AISidebar
            isOpen={leftSidebarOpen}
            toggleSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
            quill={quill}
            documentId={documentId}
            isConnected={isConnected}
          />

          {/* Always visible toggle button */}
          <button
            className={`absolute ${
              leftSidebarOpen ? "-right-10" : "left-0"
            } top-4 bg-gray-200 p-2 ${
              leftSidebarOpen ? "rounded-r" : "rounded-r"
            } hover:bg-gray-300 transition`}
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            aria-label={
              leftSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
            }
          >
            {leftSidebarOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div
                className={`px-2 py-1 text-xs rounded-full ${
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </div>
              {lastSaved && !isViewingVersion && (
                <div className="text-xs text-gray-500">
                  Last saved: {lastSaved.toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareModalToggle}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition"
                title="Share Document"
                disabled={!isConnected}
              >
                <Share size={16} />
                Share
              </button>
              <button
                onClick={downloadAsPDF}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition"
                title="Download as PDF"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
          {isViewingVersion && (
            <div className="px-4 py-2 bg-yellow-100 border-b border-yellow-200 flex justify-between items-center">
              <p className="text-yellow-800">
                Viewing version {currentVersion} - Read only mode
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => restoreVersion(currentVersion)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                  disabled={!isConnected}
                >
                  <Save size={16} />
                  Restore This Version
                </button>
                <button
                  onClick={returnToCurrent}
                  className="flex items-center gap-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded transition"
                >
                  <RotateCcw size={16} />
                  Return to Current
                </button>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <div className="h-full" ref={wrapperRef}></div>
          </div>
        </div>
        <div
          className={`bg-gray-50 border-l border-gray-200 transition-all duration-300 ${
            rightSidebarOpen ? "w-80" : "w-0"
          } flex flex-col relative`}
        >
          {rightSidebarOpen && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Version History</h3>
                {!isViewingVersion && (
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={saveVersion}
                      disabled={!isConnected}
                      className={`${
                        isConnected
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-400"
                      } text-white p-2 rounded transition`}
                      title="Save Version"
                    >
                      <Save size={20} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {versions.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    No versions available
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {versions.map((version) => (
                      <li
                        key={`version-${version.versionNumber}`}
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
                            disabled={!isConnected}
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
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() =>
                              restoreVersion(version.versionNumber)
                            }
                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                            disabled={!isConnected}
                          >
                            Restore
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <button
            className="absolute -left-10 top-4 bg-gray-200 p-2 rounded-l hover:bg-gray-300 transition"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            aria-label={
              rightSidebarOpen
                ? "Close version sidebar"
                : "Open version sidebar"
            }
          >
            {rightSidebarOpen ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>
        {isShareModalOpen && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h3 className="text-lg font-semibold mb-4">Share Document</h3>
              <form onSubmit={sendShareEmail} ref={formRef}>
                <div className="mb-4">
                  <label
                    htmlFor="recipientEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    name="to_email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter email address"
                    required
                  />
                  <input type="hidden" name="document_id" value={documentId} />
                  <input
                    type="hidden"
                    name="document_link"
                    value={`${window.location.origin}/documents/${documentId}`}
                  />
                  <input
                    type="hidden"
                    name="from_name"
                    value={localStorage.getItem("userName") || "Document Owner"}
                  />
                  <input
                    type="hidden"
                    name="message"
                    value={`You've been invited to collaborate on document ${documentId}. Click the link to join.`}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleShareModalToggle}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

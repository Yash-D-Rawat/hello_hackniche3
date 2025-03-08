import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import HomePage from "./pages/HomePage";
import LogIn from "./pages/Login";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar";
import TextImage from "./pages/TextImage";
import TextEditor from "./components/Collaboration/TextEditor";
import WhisperSpeechToText from "./pages/WhisperSpeechToText ";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Existing Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/Login" element={<LogIn />} />
          <Route path="/WhisperSpeech" element={<WhisperSpeechToText />} />
          <Route path="/TextImage" element={<TextImage />} />

          {/* TextEditor Routes */}
          <Route path="/Collabarotion/:id" element={<TextEditor />} />
          <Route path="/Collabarotion" element={<Navigate to={`/Collabarotion/${uuidV4()}`} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

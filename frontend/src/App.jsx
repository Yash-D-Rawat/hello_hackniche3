import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import HomePage from "./pages/HomePage";
import LogIn from "./pages/Login";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar";
import TextImage from "./pages/TextImage";
import TextEditor from "./components/Collaboration/TextEditor";
import WhisperSpeechToText from "./pages/WhisperSpeechToText ";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Existing Routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<LogIn />} />
          <Route path="/WhisperSpeech" element={<WhisperSpeechToText />} />
          <Route path="/TextImage" element={<TextImage />} />
          {/* TextEditor Routes */}
          <Route path="/Collabarotion/:id" element={<TextEditor />} />
          <Route
            path="/Collabarotion"
            element={<Navigate to={`/Collabarotion/${uuidV4()}`} />}
          />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

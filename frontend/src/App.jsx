import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LogIn from "./pages/Login";
import WhisperSpeechToText from "./pages/WhisperSpeechToText ";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar";
import TextImage from "./pages/TextImage";

function App() {
  return (
    <>
      <Router>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Login" element={<LogIn />} /> 
        <Route path="/WhisperSpeech" element={<WhisperSpeechToText/>} /> 
        <Route path="/TextImage" element={<TextImage/>} />
        </Routes>
         
      </Router>
    </>
  );
}

export default App;

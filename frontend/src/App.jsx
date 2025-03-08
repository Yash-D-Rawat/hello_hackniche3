import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LogIn from "./pages/Login";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    <>
      <Router>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Login" element={<LogIn />} /> 
        </Routes>
         
      </Router>
    </>
  );
}

export default App;

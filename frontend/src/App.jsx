import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import People from "./pages/People";

function App() {
  return (
    <div className="container">
      <nav className="nav">
        <h1>Person Management System</h1>
        <div className="nav-links">
          <Link to="/">Register</Link>
          <Link to="/people">People List</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/people" element={<People />} />
      </Routes>
    </div>
  );
}

export default App;

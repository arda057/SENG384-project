import { useState } from "react";

const API_URL = "http://localhost:5000/api/people";

function Home() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.full_name.trim()) {
      setError("Full Name is required.");
      return false;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return false;
    }

    if (!emailRegex.test(form.email)) {
      setError("Invalid email format.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validateForm()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "EMAIL_ALREADY_EXISTS") {
          setError("This email already exists.");
        } else if (data.error === "VALIDATION_ERROR") {
          setError("Please enter valid data.");
        } else {
          setError("Something went wrong.");
        }
        return;
      }

      setMessage("Person added successfully.");
      setForm({ full_name: "", email: "" });
    } catch (err) {
      setError("Server connection error.");
    }
  };

  return (
    <div className="card">
      <h2>Registration Form</h2>

      <form onSubmit={handleSubmit} className="form">
        <label>Full Name</label>
        <input
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Enter full name"
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email"
        />

        <button type="submit">Add Person</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Home;

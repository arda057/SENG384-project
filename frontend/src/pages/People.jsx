import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/people";

function People() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
  });
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setPeople(data);
    } catch (err) {
      setError("Failed to fetch people.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this person?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Delete failed.");
        return;
      }

      setPeople(people.filter((person) => person.id !== id));
    } catch (err) {
      setError("Server connection error.");
    }
  };

  const startEdit = (person) => {
    setEditingId(person.id);
    setEditForm({
      full_name: person.full_name,
      email: person.email,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ full_name: "", email: "" });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    setError("");

    if (!editForm.full_name.trim() || !editForm.email.trim()) {
      setError("Fields cannot be empty.");
      return;
    }

    if (!emailRegex.test(editForm.email)) {
      setError("Invalid email format.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "EMAIL_ALREADY_EXISTS") {
          setError("This email already exists.");
        } else if (data.error === "VALIDATION_ERROR") {
          setError("Please enter valid data.");
        } else if (data.error === "NOT_FOUND") {
          setError("Person not found.");
        } else {
          setError("Update failed.");
        }
        return;
      }

      setPeople(
        people.map((person) => (person.id === id ? data : person))
      );

      setEditingId(null);
      setEditForm({ full_name: "", email: "" });
    } catch (err) {
      setError("Server connection error.");
    }
  };

  return (
    <div className="card">
      <h2>People List</h2>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : people.length === 0 ? (
        <p>No people found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {people.map((person) => (
              <tr key={person.id}>
                <td>{person.id}</td>

                <td>
                  {editingId === person.id ? (
                    <input
                      type="text"
                      name="full_name"
                      value={editForm.full_name}
                      onChange={handleEditChange}
                    />
                  ) : (
                    person.full_name
                  )}
                </td>

                <td>
                  {editingId === person.id ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                    />
                  ) : (
                    person.email
                  )}
                </td>

                <td className="actions">
                  {editingId === person.id ? (
                    <>
                      <button onClick={() => handleUpdate(person.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(person)}>Edit</button>
                      <button onClick={() => handleDelete(person.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default People;

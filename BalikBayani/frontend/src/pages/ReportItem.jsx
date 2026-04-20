import { useState } from "react";
import api from "../services/api";

function ReportItem() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    status: "lost",
    location: "",
    date_reported: "",
  });
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    if (image) data.append("image", image);

    try {
      await api.post("/items", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Item submitted successfully and is waiting for admin approval");
      setForm({
        name: "",
        description: "",
        category: "",
        status: "lost",
        location: "",
        date_reported: "",
      });
      setImage(null);
    } catch (error) {
      alert(error.response?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Report Lost or Found Item</h2>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <label>Item Name</label>
          <input
            placeholder="Enter item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label>Description</label>
          <textarea
            placeholder="Describe the item"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label>Category</label>
          <input
            placeholder="Example: Wallet, Phone, ID"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <label>Location</label>
          <input
            placeholder="Where was it lost or found?"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <label>Date Reported</label>
          <input
            type="date"
            value={form.date_reported}
            onChange={(e) =>
              setForm({ ...form, date_reported: e.target.value })
            }
          />

          <label>Upload Image</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />

          <button type="submit">Submit Report</button>
        </form>
      </div>
    </div>
  );
}

export default ReportItem;

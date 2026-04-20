import { useState } from "react";
import api from "../services/api";

function ItemCard({ item, showClaimButton = false }) {
  const [claimMessage, setClaimMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const submitClaim = async () => {
    try {
      await api.post("/claims", {
        item_id: item.id,
        message: claimMessage,
      });
      alert("Claim request submitted successfully");
      setClaimMessage("");
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || "Claim request failed");
    }
  };

  return (
    <div className="card">
      <div style={{ marginBottom: "10px" }}>
        <span
          className={`badge ${item.status === "lost" ? "badge-lost" : "badge-found"}`}
        >
          {item.status.toUpperCase()}
        </span>

        {item.approval_status && (
          <span className={`badge badge-${item.approval_status}`}>
            {item.approval_status.toUpperCase()}
          </span>
        )}
      </div>

      <h3 style={{ marginTop: 0 }}>{item.name}</h3>
      <p>
        <strong>Category:</strong> {item.category || "N/A"}
      </p>
      <p>
        <strong>Location:</strong> {item.location || "N/A"}
      </p>
      <p>
        <strong>Description:</strong>{" "}
        {item.description || "No description provided"}
      </p>
      <p>
        <strong>Reported By:</strong> {item.reported_by || "Unknown"}
      </p>
      <p>
        <strong>Date Reported:</strong> {item.date_reported || "N/A"}
      </p>

      {item.image_url && (
        <img className="item-image" src={item.image_url} alt={item.name} />
      )}

      {showClaimButton && (
        <div style={{ marginTop: "14px" }}>
          {!showForm ? (
            <button onClick={() => setShowForm(true)}>Claim This Item</button>
          ) : (
            <>
              <textarea
                placeholder="Explain why this item is yours"
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
              />
              <button onClick={submitClaim} style={{ marginRight: "10px" }}>
                Submit Claim
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ItemCard;

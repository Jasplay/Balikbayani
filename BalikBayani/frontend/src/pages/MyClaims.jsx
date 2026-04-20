import { useEffect, useState } from "react";
import api from "../services/api";

function MyClaims() {
  const [claims, setClaims] = useState([]);

  const loadClaims = async () => {
    try {
      const res = await api.get("/claims/my-claims");
      setClaims(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  return (
    <div className="container">
      <h2 className="page-title">My Claim Requests</h2>

      {claims.map((claim) => (
        <div key={claim.id} className="card">
          <h3>{claim.item_name}</h3>
          <p>
            <strong>Status:</strong> {claim.item_status}
          </p>
          <p>
            <strong>Category:</strong> {claim.category}
          </p>
          <p>
            <strong>Location:</strong> {claim.location}
          </p>
          <p>
            <strong>Your Message:</strong> {claim.message}
          </p>
          <p>
            <strong>Claim Status:</strong> {claim.status}
          </p>
        </div>
      ))}
    </div>
  );
}

export default MyClaims;

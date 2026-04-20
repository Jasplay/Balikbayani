import { useEffect, useState } from "react";
import api from "../services/api";

function Admin() {
  const [users, setUsers] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadPendingItems = async () => {
    try {
      const res = await api.get("/items/pending");
      setPendingItems(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadClaims = async () => {
    try {
      const res = await api.get("/claims");
      setClaims(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const approveItem = async (id) => {
    try {
      await api.put(`/items/${id}/approve`);
      loadPendingItems();
      loadStats();
      alert("Item approved");
    } catch (error) {
      console.error(error);
      alert("Approval failed");
    }
  };

  const rejectItem = async (id) => {
    try {
      await api.put(`/items/${id}/reject`);
      loadPendingItems();
      loadStats();
      alert("Item rejected");
    } catch (error) {
      console.error(error);
      alert("Rejection failed");
    }
  };

  const approveClaim = async (id) => {
    try {
      await api.put(`/claims/${id}/approve`);
      loadClaims();
      loadStats();
      alert("Claim approved");
    } catch (error) {
      console.error(error);
      alert("Claim approval failed");
    }
  };

  const rejectClaim = async (id) => {
    try {
      await api.put(`/claims/${id}/reject`);
      loadClaims();
      loadStats();
      alert("Claim rejected");
    } catch (error) {
      console.error(error);
      alert("Claim rejection failed");
    }
  };

  useEffect(() => {
    loadUsers();
    loadPendingItems();
    loadClaims();
    loadStats();
  }, []);

  return (
    <div className="container">
      <h2 className="page-title">Admin Dashboard</h2>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Users</h4>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h4>Approved Items</h4>
            <p>{stats.approvedItems}</p>
          </div>
          <div className="stat-card">
            <h4>Pending Items</h4>
            <p>{stats.pendingItems}</p>
          </div>
          <div className="stat-card">
            <h4>Rejected Items</h4>
            <p>{stats.rejectedItems}</p>
          </div>
          <div className="stat-card">
            <h4>Claimed Items</h4>
            <p>{stats.claimedItems}</p>
          </div>
          <div className="stat-card">
            <h4>Total Claims</h4>
            <p>{stats.totalClaims}</p>
          </div>
          <div className="stat-card">
            <h4>Pending Claims</h4>
            <p>{stats.pendingClaims}</p>
          </div>
          <div className="stat-card">
            <h4>Unread Notifications</h4>
            <p>{stats.unreadNotifications}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} - {user.email} - {user.role}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Pending Items</h3>
        {pendingItems.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h4>{item.name}</h4>
            <p>{item.description}</p>
            <p>Status: {item.status}</p>
            <p>Category: {item.category}</p>
            <p>Location: {item.location}</p>
            <p>
              Reported by: {item.reported_by} ({item.reported_email})
            </p>
            <button
              className="success-btn"
              onClick={() => approveItem(item.id)}
              style={{ marginRight: "10px" }}
            >
              Approve
            </button>
            <button className="danger-btn" onClick={() => rejectItem(item.id)}>
              Reject
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Claim Requests</h3>
        {claims.map((claim) => (
          <div
            key={claim.id}
            style={{
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h4>{claim.item_name}</h4>
            <p>
              <strong>Claimant:</strong> {claim.claimant_name} (
              {claim.claimant_email})
            </p>
            <p>
              <strong>Item Status:</strong> {claim.item_status}
            </p>
            <p>
              <strong>Category:</strong> {claim.category}
            </p>
            <p>
              <strong>Location:</strong> {claim.location}
            </p>
            <p>
              <strong>Message:</strong> {claim.message}
            </p>
            <p>
              <strong>Claim Status:</strong> {claim.status}
            </p>

            {claim.status === "pending" && (
              <>
                <button
                  className="success-btn"
                  onClick={() => approveClaim(claim.id)}
                  style={{ marginRight: "10px" }}
                >
                  Approve Claim
                </button>
                <button
                  className="danger-btn"
                  onClick={() => rejectClaim(claim.id)}
                >
                  Reject Claim
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;

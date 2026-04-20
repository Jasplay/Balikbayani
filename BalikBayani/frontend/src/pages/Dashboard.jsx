import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import ItemCard from "../components/ItemCard";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    location: "",
  });

  const loadItems = async (customFilters = filters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(customFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await api.get(`/items?${params.toString()}`);
      setItems(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadItems();

    socket.on("item_approved", () => {
      loadItems();
    });

    return () => {
      socket.off("item_approved");
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadItems(filters);
  };

  return (
    <div className="container">
      <h2 className="page-title">Lost and Found Dashboard</h2>

      <div className="form-card" style={{ marginBottom: "20px" }}>
        <form onSubmit={handleSearch}>
          <label>Search</label>
          <input
            placeholder="Search by item name or description"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <label>Category</label>
          <input
            placeholder="Enter category"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          />

          <label>Location</label>
          <input
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
          />

          <button type="submit">Apply Filters</button>
        </form>
      </div>

      <div className="grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} showClaimButton={true} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

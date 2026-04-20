import { useEffect, useState } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard";

function MyItems() {
  const [items, setItems] = useState([]);

  const loadMyItems = async () => {
    try {
      const res = await api.get("/items/my-items");
      setItems(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMyItems();
  }, []);

  return (
    <div className="container">
      <h2 className="page-title">My Reported Items</h2>
      <div className="grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default MyItems;

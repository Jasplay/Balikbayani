import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const loadNotifications = async () => {
    try {
      const res = await api.get("/items/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/items/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadNotifications();

    socket.on("notification_created", (data) => {
      if (data.userIds?.includes(user?.id)) {
        loadNotifications();
      }
    });

    return () => {
      socket.off("notification_created");
    };
  }, []);

  return (
    <div className="container">
      <h2 className="page-title">Notifications</h2>

      {notifications.length === 0 ? (
        <div className="card">
          <p>No notifications yet.</p>
        </div>
      ) : (
        notifications.map((note) => (
          <div key={note.id} className="card">
            <p>{note.message}</p>
            <p>Status: {note.is_read ? "Read" : "Unread"}</p>
            {!note.is_read && (
              <button onClick={() => markRead(note.id)}>Mark as Read</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;

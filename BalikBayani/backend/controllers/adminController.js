const db = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM items WHERE id = ?", [id]);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [[users]] = await db.query("SELECT COUNT(*) AS total FROM users");
    const [[approvedItems]] = await db.query(
      "SELECT COUNT(*) AS total FROM items WHERE approval_status = 'approved'",
    );
    const [[pendingItems]] = await db.query(
      "SELECT COUNT(*) AS total FROM items WHERE approval_status = 'pending'",
    );
    const [[rejectedItems]] = await db.query(
      "SELECT COUNT(*) AS total FROM items WHERE approval_status = 'rejected'",
    );
    const [[claimedItems]] = await db.query(
      "SELECT COUNT(*) AS total FROM items WHERE is_claimed = TRUE",
    );
    const [[claims]] = await db.query("SELECT COUNT(*) AS total FROM claims");
    const [[pendingClaims]] = await db.query(
      "SELECT COUNT(*) AS total FROM claims WHERE status = 'pending'",
    );
    const [[notifications]] = await db.query(
      "SELECT COUNT(*) AS total FROM notifications",
    );
    const [[unreadNotifications]] = await db.query(
      "SELECT COUNT(*) AS total FROM notifications WHERE is_read = FALSE",
    );

    res.json({
      totalUsers: users.total,
      approvedItems: approvedItems.total,
      pendingItems: pendingItems.total,
      rejectedItems: rejectedItems.total,
      claimedItems: claimedItems.total,
      totalClaims: claims.total,
      pendingClaims: pendingClaims.total,
      totalNotifications: notifications.total,
      unreadNotifications: unreadNotifications.total,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  deleteItem,
  getDashboardStats,
};

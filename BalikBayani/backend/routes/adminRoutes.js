const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  deleteItem,
  getDashboardStats,
} = require("../controllers/adminController");

router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/stats", verifyToken, isAdmin, getDashboardStats);
router.delete("/items/:id", verifyToken, isAdmin, deleteItem);

module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const {
  createItem,
  getItems,
  getMyItems,
  getNotifications,
  markNotificationRead,
  approveItem,
  rejectItem,
  getPendingItems,
} = require("../controllers/itemController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getItems);
router.get("/my-items", verifyToken, getMyItems);
router.get("/notifications", verifyToken, getNotifications);
router.put("/notifications/:id/read", verifyToken, markNotificationRead);
router.get("/pending", verifyToken, isAdmin, getPendingItems);
router.put("/:id/approve", verifyToken, isAdmin, approveItem);
router.put("/:id/reject", verifyToken, isAdmin, rejectItem);
router.post("/", verifyToken, upload.single("image"), createItem);

module.exports = router;

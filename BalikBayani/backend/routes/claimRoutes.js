const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const {
  createClaim,
  getMyClaims,
  getAllClaims,
  approveClaim,
  rejectClaim,
} = require("../controllers/claimController");

router.post("/", verifyToken, createClaim);
router.get("/my-claims", verifyToken, getMyClaims);
router.get("/", verifyToken, isAdmin, getAllClaims);
router.put("/:id/approve", verifyToken, isAdmin, approveClaim);
router.put("/:id/reject", verifyToken, isAdmin, rejectClaim);

module.exports = router;

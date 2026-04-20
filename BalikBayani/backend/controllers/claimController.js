const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");

const createClaim = async (req, res) => {
  try {
    const { item_id, message } = req.body;
    const claimant_user_id = req.user.id;

    if (!item_id || !message) {
      return res.status(400).json({ message: "Item and message are required" });
    }

    const [existing] = await db.query(
      'SELECT * FROM claims WHERE item_id = ? AND claimant_user_id = ? AND status = "pending"',
      [item_id, claimant_user_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "You already submitted a pending claim for this item",
      });
    }

    await db.query(
      "INSERT INTO claims (item_id, claimant_user_id, message) VALUES (?, ?, ?)",
      [item_id, claimant_user_id, message],
    );

    res.status(201).json({ message: "Claim request submitted successfully" });
  } catch (error) {
    console.error("Create claim error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT claims.*, items.name AS item_name, items.status AS item_status, items.category, items.location
       FROM claims
       JOIN items ON claims.item_id = items.id
       WHERE claims.claimant_user_id = ?
       ORDER BY claims.created_at DESC`,
      [req.user.id],
    );

    res.json(rows);
  } catch (error) {
    console.error("Get my claims error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllClaims = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT claims.*, 
              items.name AS item_name,
              items.status AS item_status,
              items.category,
              items.location,
              users.name AS claimant_name,
              users.email AS claimant_email
       FROM claims
       JOIN items ON claims.item_id = items.id
       JOIN users ON claims.claimant_user_id = users.id
       ORDER BY claims.created_at DESC`,
    );

    res.json(rows);
  } catch (error) {
    console.error("Get all claims error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const approveClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const [claimRows] = await db.query("SELECT * FROM claims WHERE id = ?", [
      id,
    ]);

    if (claimRows.length === 0) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const claim = claimRows[0];

    await db.query('UPDATE claims SET status = "approved" WHERE id = ?', [id]);

    await db.query("UPDATE items SET is_claimed = TRUE WHERE id = ?", [
      claim.item_id,
    ]);

    await db.query(
      'UPDATE claims SET status = "rejected" WHERE item_id = ? AND id != ? AND status = "pending"',
      [claim.item_id, id],
    );

    await db.query(
      "INSERT INTO notifications (user_id, message, related_item_id) VALUES (?, ?, ?)",
      [claim.claimant_user_id, "Your claim has been approved.", claim.item_id],
    );

    req.app.get("io").emit("notification_created", {
      userIds: [claim.claimant_user_id],
    });

    const [rows] = await db.query(
      `SELECT users.email, users.name, items.name AS item_name
       FROM claims
       JOIN users ON claims.claimant_user_id = users.id
       JOIN items ON claims.item_id = items.id
       WHERE claims.id = ?`,
      [id],
    );

    if (rows.length > 0) {
      const claimInfo = rows[0];

      await sendEmail({
        to: claimInfo.email,
        subject: "Your claim has been approved",
        html: `
          <p>Hello ${claimInfo.name},</p>
          <p>Your claim for <strong>${claimInfo.item_name}</strong> has been approved.</p>
          <p>Please contact the administrator or office for turnover instructions.</p>
          <p>Thank you,<br>BalikBayani</p>
        `,
      });
    }

    res.json({
      message: "Claim approved successfully and email sent",
    });
  } catch (error) {
    console.error("Approve claim error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE claims SET status = "rejected" WHERE id = ?', [id]);

    res.json({ message: "Claim rejected successfully" });
  } catch (error) {
    console.error("Reject claim error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getAllClaims,
  approveClaim,
  rejectClaim,
};

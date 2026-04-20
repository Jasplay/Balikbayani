const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../utils/sendEmail");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "balikbayani_items",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
};

const createMatchNotifications = async (item, req) => {
  const oppositeStatus = item.status === "lost" ? "found" : "lost";

  const [matches] = await db.query(
    `SELECT * FROM items
     WHERE status = ?
       AND approval_status = 'approved'
       AND is_claimed = FALSE
       AND LOWER(category) = LOWER(?)
       AND LOWER(location) = LOWER(?)
       AND id != ?
     ORDER BY created_at DESC`,
    [oppositeStatus, item.category, item.location, item.id],
  );

  for (const match of matches) {
    const messageForCurrentUser = `Possible match found for your ${item.status} item: ${match.name}`;
    const messageForMatchedUser = `Possible match found for your ${match.status} item: ${item.name}`;

    await db.query(
      "INSERT INTO notifications (user_id, message, related_item_id) VALUES (?, ?, ?)",
      [item.user_id, messageForCurrentUser, match.id],
    );

    await db.query(
      "INSERT INTO notifications (user_id, message, related_item_id) VALUES (?, ?, ?)",
      [match.user_id, messageForMatchedUser, item.id],
    );

    req.app.get("io").emit("notification_created", {
      userIds: [item.user_id, match.user_id],
    });

    const [userRows1] = await db.query(
      "SELECT name, email FROM users WHERE id = ?",
      [item.user_id],
    );

    const [userRows2] = await db.query(
      "SELECT name, email FROM users WHERE id = ?",
      [match.user_id],
    );

    if (userRows1.length > 0) {
      await sendEmail({
        to: userRows1[0].email,
        subject: "Possible match found for your item",
        html: `
          <p>Hello ${userRows1[0].name},</p>
          <p>We found a possible match for your <strong>${item.status}</strong> item.</p>
          <p><strong>Matched Item:</strong> ${match.name}</p>
          <p><strong>Category:</strong> ${match.category}</p>
          <p><strong>Location:</strong> ${match.location}</p>
          <p>Please log in to BalikBayani to review it.</p>
        `,
      });
    }

    if (userRows2.length > 0) {
      await sendEmail({
        to: userRows2[0].email,
        subject: "Possible match found for your item",
        html: `
          <p>Hello ${userRows2[0].name},</p>
          <p>We found a possible match for your <strong>${match.status}</strong> item.</p>
          <p><strong>Matched Item:</strong> ${item.name}</p>
          <p><strong>Category:</strong> ${item.category}</p>
          <p><strong>Location:</strong> ${item.location}</p>
          <p>Please log in to BalikBayani to review it.</p>
        `,
      });
    }
  }

  return matches;
};

const createItem = async (req, res) => {
  try {
    const { name, description, category, status, location, date_reported } =
      req.body;
    const user_id = req.user.id;

    let image_url = null;

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      image_url = uploadedImage.secure_url;
    }

    if (!name || !status || !category || !location) {
      return res
        .status(400)
        .json({ message: "Name, status, category, and location are required" });
    }

    const [result] = await db.query(
      `INSERT INTO items (user_id, name, description, category, status, image_url, location, date_reported, approval_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        user_id,
        name,
        description,
        category,
        status,
        image_url,
        location,
        date_reported,
      ],
    );

    const [newItemRows] = await db.query("SELECT * FROM items WHERE id = ?", [
      result.insertId,
    ]);
    const newItem = newItemRows[0];

    req.app.get("io").emit("new_item_pending", newItem);

    res.status(201).json({
      message: "Item submitted and waiting for admin approval",
      item: newItem,
    });
  } catch (error) {
    console.error("Create item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getItems = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      category = "",
      location = "",
    } = req.query;

    let query = `
      SELECT items.*, users.name AS reported_by
      FROM items
      JOIN users ON items.user_id = users.id
      WHERE items.approval_status = 'approved'
        AND items.is_claimed = FALSE
    `;

    const params = [];

    if (search) {
      query += " AND (items.name LIKE ? OR items.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += " AND items.status = ?";
      params.push(status);
    }

    if (category) {
      query += " AND items.category = ?";
      params.push(category);
    }

    if (location) {
      query += " AND items.location = ?";
      params.push(location);
    }

    query += " ORDER BY items.created_at DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );

    res.json(rows);
  } catch (error) {
    console.error("Get my items error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );
    res.json(rows);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const approveItem = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE items SET approval_status = 'approved' WHERE id = ?",
      [id],
    );

    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [id]);
    const item = rows[0];

    if (item) {
      const matches = await createMatchNotifications(item, req);
      req.app.get("io").emit("item_approved", item);
      req.app
        .get("io")
        .emit("matches_created", { itemId: item.id, count: matches.length });
    }

    res.json({ message: "Item approved successfully" });
  } catch (error) {
    console.error("Approve item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE items SET approval_status = 'rejected' WHERE id = ?",
      [id],
    );
    res.json({ message: "Item rejected successfully" });
  } catch (error) {
    console.error("Reject item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPendingItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT items.*, users.name AS reported_by, users.email AS reported_email
       FROM items
       JOIN users ON items.user_id = users.id
       WHERE items.approval_status = 'pending'
       ORDER BY items.created_at DESC`,
    );
    res.json(rows);
  } catch (error) {
    console.error("Get pending items error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createItem,
  getItems,
  getMyItems,
  getNotifications,
  markNotificationRead,
  approveItem,
  rejectItem,
  getPendingItems,
};

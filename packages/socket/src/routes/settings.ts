import { Router } from "express";
import { userService } from "@quizio/socket/services/userService";
import { User } from "@quizio/socket/db/models/user";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "username and password required" });
      return;
    }
    const existing = await userService.findByUsername(username);
    if (existing) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }
    const user = await userService.createUser(username, password);
    res
      .status(201)
      .json({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
      });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (userToDelete.username === currentUser.username) {
      res.status(400).json({ error: "Cannot delete yourself" });
      return;
    }
    await userService.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const currentUser = (req as any).user;
    const user = await userService.findByUsername(currentUser.username);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const valid = await userService.verifyPassword(user, currentPassword);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    await userService.updatePassword(user._id.toString(), newPassword);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/:id/password", async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      res.status(400).json({ error: "newPassword required" });
      return;
    }
    const updated = await userService.updatePassword(
      req.params.id,
      newPassword,
    );
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

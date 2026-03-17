import { Router } from "express";
import jwt from "jsonwebtoken";
import { userService } from "@quizio/socket/services/userService";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "username and password required" });
      return;
    }
    const user = await userService.findByUsername(username);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await userService.verifyPassword(user, password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "8h" },
    );
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret",
    ) as any;
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "8h" },
    );
    res.json({ token: newToken });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;

import mongoose from "mongoose";
import { User } from "@quizio/socket/db/models/user";
import bcrypt from "bcryptjs";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("Admin already exists, skipping seed");
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash("changeme", 10);
  await User.create({ username: "admin", passwordHash, role: "admin" });
  console.log("Created admin user: admin / changeme");
  console.log("IMPORTANT: Change the password after first login!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

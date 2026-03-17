import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);
  isConnected = true;
  console.log("MongoDB connected");

  process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

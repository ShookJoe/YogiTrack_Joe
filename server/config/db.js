import mongoose from "mongoose";

// Connects Mongoose to whatever MONGODB_URI points at -- a local
// mongod for development, or the Atlas cluster in production.
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

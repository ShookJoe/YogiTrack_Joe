import mongoose from "mongoose";

// Instructor record for Add an Instructor
// instructorId is generated server-side see routes/personRouter.js
const instructorSchema = new mongoose.Schema(
  {
    instructorId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    preferredContact: { type: String, required: true, enum: ["phone", "email"] },
  },
  { timestamps: true }
);

export default mongoose.model("Instructor", instructorSchema);

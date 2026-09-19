import mongoose from "mongoose";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Scheduled class  
const classSchema = new mongoose.Schema(
  {
    instructorId: { type: String, required: true },
    day: { type: String, required: true, enum: DAYS },
    time: { type: String, required: true }, // 24-hour "HH:MM"
    classType: { type: String, required: true, enum: ["General", "Special"] },
    payRate: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Enforces the use case's only one class can be held at any time rule at the database level
classSchema.index({ day: 1, time: 1 }, { unique: true });

export const CLASS_DAYS = DAYS;
export default mongoose.model("Class", classSchema);

import mongoose from "mongoose";

// Customers checked in to one class on one day (Record Class Attendance).
// classId is the Class document's _id, since classes have no id of their own.
const attendanceSchema = new mongoose.Schema(
  {
    attendanceId: { type: String, required: true, unique: true },
    classId: { type: String, required: true },
    instructorId: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // 24-hour "HH:MM"
    customerIds: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);

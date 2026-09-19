import mongoose from "mongoose";

// Customer record for Add a Customer 
// mirrors Instructor since both follow the same add person use case
// classBalance is the only extra field, initialized to 0 
const customerSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    preferredContact: { type: String, required: true, enum: ["phone", "email"] },
    classBalance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);

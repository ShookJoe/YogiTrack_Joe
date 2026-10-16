import mongoose from "mongoose";

// A customer buying a package (Record a Sale)
const saleSchema = new mongoose.Schema(
  {
    saleId: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    packageId: { type: String, required: true },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, required: true, trim: true },
    paymentDate: { type: Date, required: true },
    validityStart: { type: Date, required: true },
    validityEnd: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);

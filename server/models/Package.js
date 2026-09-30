import mongoose from "mongoose";

// Purchasable class pass bundle
const packageSchema = new mongoose.Schema(
  {
    packageId: { type: String, required: true, unique: true },
    packageName: { type: String, required: true, trim: true },
    packageCategory: { type: String, required: true, enum: ["General", "Senior"] },
    numClasses: { type: String, required: true, enum: ["1", "4", "10", "unlimited"] },
    classType: { type: String, required: true, enum: ["General", "Special"] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);

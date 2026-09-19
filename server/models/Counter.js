import mongoose from "mongoose";

// Internal collection that hands out sequential IDs for Instructor and Customer records. One document per sequence name
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

// Atomically increments and returns the next value for a named sequence
export async function nextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// Turns a raw sequence number into the display ID format from the use case example: formatId("I", 1) -> "I00001".
export function formatId(prefix, seq) {
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

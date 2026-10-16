// GET/POST /api/attendance for Record Class Attendance. An instructor checks
// customers into one of their classes and each customer's balance drops by
// one, unless they have an unlimited package that covers that day.
import { Router } from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import ClassModel from "../models/Class.js";
import Customer from "../models/Customer.js";
import Instructor from "../models/Instructor.js";
import PackageModel from "../models/Package.js";
import Sale from "../models/Sale.js";
import { nextSequence, formatId } from "../models/Counter.js";

const router = Router();
const REQUIRED_FIELDS = ["classId", "instructorId", "date", "time", "customerIds"];

// Ids of the customers who bought an unlimited package that covers this date
async function unlimitedCustomers(customerIds, date) {
  const sales = await Sale.find({
    customerId: { $in: customerIds },
    validityStart: { $lte: date },
    validityEnd: { $gte: date },
  });
  if (sales.length === 0) return new Set();

  const unlimitedPackages = await PackageModel.find({
    packageId: { $in: sales.map((s) => s.packageId) },
    numClasses: "unlimited",
  });
  const unlimitedIds = new Set(unlimitedPackages.map((p) => p.packageId));
  return new Set(sales.filter((s) => unlimitedIds.has(s.packageId)).map((s) => s.customerId));
}

// "Hello Sam! You are checked-in for a class on 05/10/26 at 09:00 am. Your class-balance is 3."
function checkInMessage(firstName, date, time, balance) {
  const [year, month, day] = date.toISOString().slice(0, 10).split("-");
  const [hour, minute] = time.split(":").map(Number);
  const hour12 = String(hour % 12 || 12).padStart(2, "0");
  const ampm = hour >= 12 ? "pm" : "am";
  return `Hello ${firstName}! You are checked-in for a class on ${day}/${month}/${year.slice(2)} at ${hour12}:${String(minute).padStart(2, "0")} ${ampm}. Your class-balance is ${balance}.`;
}

async function list(req, res) {
  const records = await Attendance.find().sort({ createdAt: -1 });
  res.json(records);
}

async function create(req, res) {
  const { classId, instructorId, date, time, customerIds, allowNegative } = req.body;

  const missing = REQUIRED_FIELDS.filter((field) => req.body[field] === undefined || req.body[field] === "");
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }
  if (!Array.isArray(customerIds) || customerIds.length === 0) {
    return res.status(400).json({ error: "Add at least one customer to the class" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
    return res.status(400).json({ error: "Date is not valid" });
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: "Time is not valid" });
  }

  const instructor = await Instructor.findOne({ instructorId });
  if (!instructor) {
    return res.status(400).json({ error: `No instructor found with id ${instructorId}` });
  }
  const cls = mongoose.isValidObjectId(classId) ? await ClassModel.findById(classId) : null;
  if (!cls) {
    return res.status(400).json({ error: `No class found with id ${classId}` });
  }
  if (cls.instructorId !== instructorId) {
    return res.status(400).json({ error: "That class is not assigned to this instructor" });
  }

  const ids = [...new Set(customerIds)];
  const customers = await Customer.find({ customerId: { $in: ids } });
  const unknown = ids.filter((id) => !customers.some((c) => c.customerId === id));
  if (unknown.length > 0) {
    return res.status(400).json({ error: `No customer found with id ${unknown.join(", ")}` });
  }

  // Checking the same customer into the same class twice would charge them twice
  const attendanceDate = new Date(date);
  const already = await Attendance.find({ classId, date: attendanceDate, customerIds: { $in: ids } });
  if (already.length > 0) {
    const doneIds = new Set(already.flatMap((a) => a.customerIds));
    const names = customers.filter((c) => doneIds.has(c.customerId)).map((c) => `${c.firstName} ${c.lastName}`);
    return res.status(400).json({ error: `${names.join(", ")} already checked in to this class on ${date}` });
  }

  const unlimited = await unlimitedCustomers(ids, attendanceDate);
  const charged = customers.filter((c) => !unlimited.has(c.customerId));
  const short = charged.filter((c) => c.classBalance < 1);
  if (short.length > 0 && !allowNegative) {
    return res.status(409).json({
      insufficient: true,
      customers: short.map((c) => ({
        customerId: c.customerId,
        firstName: c.firstName,
        lastName: c.lastName,
        classBalance: c.classBalance,
      })),
      message: "Some customers don't have a class left in their balance.",
    });
  }

  const newId = formatId("A", await nextSequence("attendanceId"));
  let record;
  try {
    record = await Attendance.create({
      attendanceId: newId,
      classId,
      instructorId,
      date: attendanceDate,
      time,
      customerIds: ids,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    if (charged.length > 0) {
      await Customer.updateMany(
        { customerId: { $in: charged.map((c) => c.customerId) } },
        { $inc: { classBalance: -1 } }
      );
    }
  } catch (err) {
    // Don't leave an attendance record behind that never reached the balances
    await Attendance.deleteOne({ attendanceId: newId });
    return res.status(500).json({ error: "Could not update class balances, attendance was not saved" });
  }

  const updated = await Customer.find({ customerId: { $in: ids } });
  const checkedIn = ids.map((id) => updated.find((c) => c.customerId === id));

  // No email/text service yet, so the confirmations are logged and returned
  const messages = checkedIn.map((c) => {
    const balance = unlimited.has(c.customerId) ? "unlimited" : String(c.classBalance);
    const message = checkInMessage(c.firstName, attendanceDate, time, balance);
    console.log(`[notify ${c.preferredContact} -> ${c.email || c.phone}] ${message}`);
    return { customerId: c.customerId, message };
  });

  res.status(201).json({
    record,
    message: `Attendance ${newId} saved for ${ids.length} customer${ids.length === 1 ? "" : "s"}.`,
    messages,
    customers: checkedIn.map((c) => ({ customerId: c.customerId, classBalance: c.classBalance })),
  });
}

router.get("/", list);
router.post("/", create);

export default router;

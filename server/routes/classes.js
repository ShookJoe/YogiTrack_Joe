// GET/POST /api/classes -- Use Case for Add a Class looks up the
// instructor, enforces "only one class at any given day/time", and on
// conflict suggests open alternative slots instead of just rejecting.
import { Router } from "express";
import ClassModel, { CLASS_DAYS } from "../models/Class.js";
import Instructor from "../models/Instructor.js";

const router = Router();
const OPEN_HOUR = 6;
const CLOSE_HOUR = 20;

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseTime(time) {
  const [h, m] = time.split(":").map(Number);
  return { h, m };
}

// Finds up to 3 open slots near the requested time: first by trying
// later hours the same day within studio hours, then
// falling back to the same time the following day if the day is full.
async function suggestSlots(day, time) {
  const { h, m } = parseTime(time);
  const dayClasses = await ClassModel.find({ day });
  const taken = new Set(dayClasses.map((c) => c.time));

  const suggestions = [];
  for (let step = 1; step <= (CLOSE_HOUR - OPEN_HOUR) && suggestions.length < 3; step++) {
    const candidateHour = h + step;
    if (candidateHour > CLOSE_HOUR) break;
    const candidate = `${pad(candidateHour)}:${pad(m)}`;
    if (!taken.has(candidate)) {
      suggestions.push({ day, time: candidate });
    }
  }

  if (suggestions.length < 3) {
    const nextDayIndex = (CLASS_DAYS.indexOf(day) + 1) % CLASS_DAYS.length;
    const nextDay = CLASS_DAYS[nextDayIndex];
    const nextDayClasses = await ClassModel.find({ day: nextDay });
    const nextDayTaken = new Set(nextDayClasses.map((c) => c.time));
    if (!nextDayTaken.has(time)) {
      suggestions.push({ day: nextDay, time });
    }
  }

  return suggestions;
}

router.get("/", async (req, res) => {
  const classes = await ClassModel.find().sort({ day: 1, time: 1 });
  res.json(classes);
});

router.post("/", async (req, res) => {
  const { instructorId, day, time, classType, payRate } = req.body;

  const missing = ["instructorId", "day", "time", "classType", "payRate"].filter(
    (field) => req.body[field] === undefined || req.body[field] === ""
  );
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  const instructor = await Instructor.findOne({ instructorId });
  if (!instructor) {
    return res.status(400).json({ error: `No instructor found with id ${instructorId}` });
  }

  // Schedule conflict check only one class can be
  // held at any given day/time, regardless of instructor.
  const conflict = await ClassModel.findOne({ day, time });
  if (conflict) {
    const suggestions = await suggestSlots(day, time);
    return res.status(409).json({
      conflict: true,
      message: `${day} at ${time} is already booked. Try one of the open slots below, or pick a different day/time.`,
      suggestions,
    });
  }

  try {
    const record = await ClassModel.create({ instructorId, day, time, classType, payRate });

    // notifications one message for the manager, one for the instructor,
    const managerMessage = `Class scheduled: ${day} at ${time} (${classType}) with ${instructor.firstName} ${instructor.lastName}, pay rate $${payRate}.`;
    const instructorMessage = `Hello ${instructor.firstName}! You've been scheduled to teach a ${classType} class on ${day} at ${time}.`;
    console.log(`[notify manager] ${managerMessage}`);
    console.log(`[notify ${instructor.preferredContact} -> ${instructor.email || instructor.phone}] ${instructorMessage}`);

    res.status(201).json({ record, message: managerMessage });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

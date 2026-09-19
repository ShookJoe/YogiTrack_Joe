import Instructor from "../models/Instructor.js";
import { createPersonRouter } from "./personRouter.js";

// GET/POST /api/instructors -- see personRouter.js for the shared logic.
const router = createPersonRouter({
  Model: Instructor,
  idField: "instructorId",
  prefix: "I",
  counterName: "instructorId",
  label: "instructor",
});

export default router;

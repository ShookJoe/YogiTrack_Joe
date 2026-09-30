// GET/POST /api/packages for Add a Package
// just validation, ID generation, and a confirmation message.
import { Router } from "express";
import PackageModel from "../models/Package.js";
import { nextSequence, formatId } from "../models/Counter.js";

const router = Router();
const REQUIRED_FIELDS = [
  "packageName",
  "packageCategory",
  "numClasses",
  "classType",
  "startDate",
  "endDate",
  "price",
];

async function list(req, res) {
  const packages = await PackageModel.find().sort({ createdAt: -1 });
  res.json(packages);
}

async function create(req, res) {
  const missing = REQUIRED_FIELDS.filter((field) => req.body[field] === undefined || req.body[field] === "");
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  const seq = await nextSequence("packageId");
  const newId = formatId("P", seq);

  try {
    const record = await PackageModel.create({
      packageId: newId,
      packageName: req.body.packageName,
      packageCategory: req.body.packageCategory,
      numClasses: req.body.numClasses,
      classType: req.body.classType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      price: req.body.price,
    });

    const message = `Package added. Your package id is ${newId}.`;
    res.status(201).json({ record, message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

router.get("/", list);
router.post("/", create);

export default router;

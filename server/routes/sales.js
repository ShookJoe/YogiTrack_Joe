// GET/POST /api/sales for Record a Sale. Checks the customer and package
// exist, validates the payment against the package, then adds the
// package's classes to the customer's balance.
import { Router } from "express";
import Sale from "../models/Sale.js";
import Customer from "../models/Customer.js";
import PackageModel from "../models/Package.js";
import { nextSequence, formatId } from "../models/Counter.js";

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;
const REQUIRED_FIELDS = [
  "customerId",
  "packageId",
  "amountPaid",
  "paymentMode",
  "paymentDate",
  "validityStart",
  "validityEnd",
];

// Returns an error message, or null if the sale is valid
function validateSale(pkg, { amountPaid, paymentDate, validityStart, validityEnd }) {
  const now = Date.now();
  const paidAt = new Date(paymentDate);
  const start = new Date(validityStart);
  const end = new Date(validityEnd);

  if ([paidAt, start, end].some((d) => Number.isNaN(d.getTime()))) {
    return "One of the dates is not valid";
  }
  if (Number(amountPaid) !== pkg.price) {
    return `Amount paid must match the package price of $${pkg.price}`;
  }
  // "Current" = within the last day, with a few minutes of slack for clock differences
  if (paidAt.getTime() > now + 5 * 60 * 1000 || paidAt.getTime() < now - DAY_MS) {
    return "Payment date and time must be current";
  }
  if (start > end) {
    return "Validity start must be before the validity end";
  }
  if (start < pkg.startDate || end > pkg.endDate) {
    return "Validity dates must fall within the package's start and end dates";
  }
  // Date inputs are stored as UTC midnight, so compare against today's UTC date with a day of slack
  const n = new Date(now);
  const todayUtc = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  if (end.getTime() < todayUtc - DAY_MS) {
    return "That validity period has already ended";
  }
  return null;
}

async function list(req, res) {
  const sales = await Sale.find().sort({ createdAt: -1 });
  res.json(sales);
}

async function create(req, res) {
  const missing = REQUIRED_FIELDS.filter((field) => req.body[field] === undefined || req.body[field] === "");
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  const { customerId, packageId, amountPaid, paymentMode, paymentDate, validityStart, validityEnd } = req.body;

  const customer = await Customer.findOne({ customerId });
  if (!customer) {
    return res.status(400).json({ error: `No customer found with id ${customerId}` });
  }
  const pkg = await PackageModel.findOne({ packageId });
  if (!pkg) {
    return res.status(400).json({ error: `No package found with id ${packageId}` });
  }

  const problem = validateSale(pkg, req.body);
  if (problem) {
    return res.status(400).json({ error: problem });
  }

  // Only spend a sale ID once the sale has passed validation
  const newId = formatId("S", await nextSequence("saleId"));

  let record;
  try {
    record = await Sale.create({
      saleId: newId,
      customerId,
      packageId,
      amountPaid,
      paymentMode,
      paymentDate,
      validityStart,
      validityEnd,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  // Unlimited packages don't add to the numeric balance
  const classesAdded = pkg.numClasses === "unlimited" ? 0 : Number(pkg.numClasses);
  let updated;
  try {
    updated = await Customer.findOneAndUpdate(
      { customerId },
      { $inc: { classBalance: classesAdded } },
      { new: true }
    );
  } catch (err) {
    updated = null;
  }
  if (!updated) {
    // Don't leave a sale behind that never reached the customer's balance
    await Sale.deleteOne({ saleId: newId });
    return res.status(500).json({ error: "Could not update the customer's class balance, sale was not recorded" });
  }

  const message =
    pkg.numClasses === "unlimited"
      ? `Sale ${newId} recorded. ${customer.firstName} ${customer.lastName} has unlimited classes through ${record.validityEnd.toISOString().slice(0, 10)}.`
      : `Sale ${newId} recorded. ${customer.firstName} ${customer.lastName}'s class balance is now ${updated.classBalance}.`;

  res.status(201).json({ record, message, customerId, classBalance: updated.classBalance });
}

router.get("/", list);
router.post("/", create);

export default router;

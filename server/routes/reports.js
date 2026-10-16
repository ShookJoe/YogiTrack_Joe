// GET /api/reports/... for Generate Studio Reports. Read-only: every report
// is worked out from the existing records, nothing new is stored.
import { Router } from "express";
import Attendance from "../models/Attendance.js";
import ClassModel, { CLASS_DAYS } from "../models/Class.js";
import Customer from "../models/Customer.js";
import Instructor from "../models/Instructor.js";
import PackageModel from "../models/Package.js";
import Sale from "../models/Sale.js";

const router = Router();

const isoDay = (date) => date.toISOString().slice(0, 10);
const money = (n) => Math.round(n * 100) / 100;
const fullName = (person) => `${person.firstName} ${person.lastName}`;

function byDayAndTime(a, b) {
  return CLASS_DAYS.indexOf(a.day) - CLASS_DAYS.indexOf(b.day) || a.time.localeCompare(b.time);
}

// How many packages were sold and how much they brought in
async function packageSales(req, res) {
  const [packages, sales] = await Promise.all([PackageModel.find().sort({ createdAt: 1 }), Sale.find()]);

  const rows = packages.map((p) => {
    const sold = sales.filter((s) => s.packageId === p.packageId);
    return {
      packageId: p.packageId,
      packageName: p.packageName,
      packageCategory: p.packageCategory,
      numClasses: p.numClasses,
      classType: p.classType,
      price: p.price,
      salesCount: sold.length,
      revenue: money(sold.reduce((sum, s) => sum + s.amountPaid, 0)),
    };
  });

  res.json({
    rows,
    totalSales: rows.reduce((sum, r) => sum + r.salesCount, 0),
    totalRevenue: money(rows.reduce((sum, r) => sum + r.revenue, 0)),
  });
}

// Each instructor's classes and how many customer check-ins each one has had
async function instructorClasses(req, res) {
  const [instructors, classes, attendance] = await Promise.all([
    Instructor.find().sort({ instructorId: 1 }),
    ClassModel.find(),
    Attendance.find(),
  ]);

  const result = instructors.map((i) => {
    const rows = classes
      .filter((c) => c.instructorId === i.instructorId)
      .sort(byDayAndTime)
      .map((c) => ({
        classId: String(c._id),
        day: c.day,
        time: c.time,
        classType: c.classType,
        payRate: c.payRate,
        checkIns: attendance
          .filter((a) => a.classId === String(c._id))
          .reduce((sum, a) => sum + a.customerIds.length, 0),
      }));
    return {
      instructorId: i.instructorId,
      name: fullName(i),
      classes: rows,
      totalCheckIns: rows.reduce((sum, r) => sum + r.checkIns, 0),
    };
  });

  res.json({ instructors: result });
}

// Each customer's packages, marked active, future, or expired. The browser
// sends its own idea of today since the server's date can be a day ahead.
async function customerPackages(req, res) {
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.query.today) ? req.query.today : isoDay(new Date());
  const [customers, sales, packages] = await Promise.all([
    Customer.find().sort({ customerId: 1 }),
    Sale.find(),
    PackageModel.find(),
  ]);

  const result = customers.map((c) => {
    const rows = sales
      .filter((s) => s.customerId === c.customerId)
      .map((s) => {
        const start = isoDay(s.validityStart);
        const end = isoDay(s.validityEnd);
        const pkg = packages.find((p) => p.packageId === s.packageId);
        return {
          saleId: s.saleId,
          packageId: s.packageId,
          packageName: pkg ? pkg.packageName : s.packageId,
          validityStart: start,
          validityEnd: end,
          status: end < today ? "expired" : start > today ? "future" : "active",
        };
      })
      .sort((a, b) => a.validityStart.localeCompare(b.validityStart));
    return { customerId: c.customerId, name: fullName(c), classBalance: c.classBalance, packages: rows };
  });

  res.json({ today, customers: result });
}

// What each instructor is owed for one month: pay rate x classes taught. A
// class counts as taught on a day if attendance was recorded for it, and two
// attendance entries for the same class and day are still one class.
async function teacherPayments(req, res) {
  const month = req.query.month;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")) {
    return res.status(400).json({ error: "Month must look like 2026-10" });
  }
  const [year, monthNumber] = month.split("-").map(Number);
  const attendance = await Attendance.find({
    date: { $gte: new Date(Date.UTC(year, monthNumber - 1, 1)), $lt: new Date(Date.UTC(year, monthNumber, 1)) },
  });

  const checkInsByDay = new Map();
  for (const a of attendance) {
    const key = `${a.classId}|${isoDay(a.date)}`;
    checkInsByDay.set(key, (checkInsByDay.get(key) || 0) + a.customerIds.length);
  }

  const perClass = new Map();
  for (const [key, checkIns] of checkInsByDay) {
    const classId = key.split("|")[0];
    const totals = perClass.get(classId) || { sessions: 0, checkIns: 0 };
    totals.sessions += 1;
    totals.checkIns += checkIns;
    perClass.set(classId, totals);
  }

  const classes = await ClassModel.find({ _id: { $in: [...perClass.keys()] } });
  const instructors = await Instructor.find({
    instructorId: { $in: [...new Set(classes.map((c) => c.instructorId))] },
  }).sort({ instructorId: 1 });

  const result = instructors.map((i) => {
    const rows = classes
      .filter((c) => c.instructorId === i.instructorId)
      .sort(byDayAndTime)
      .map((c) => {
        const { sessions, checkIns } = perClass.get(String(c._id));
        return {
          classId: String(c._id),
          day: c.day,
          time: c.time,
          classType: c.classType,
          payRate: c.payRate,
          sessions,
          checkIns,
          pay: money(sessions * c.payRate),
        };
      });
    return {
      instructorId: i.instructorId,
      name: fullName(i),
      classes: rows,
      total: money(rows.reduce((sum, r) => sum + r.pay, 0)),
    };
  });

  res.json({ month, instructors: result, grandTotal: money(result.reduce((sum, i) => sum + i.total, 0)) });
}

router.get("/package-sales", packageSales);
router.get("/instructors", instructorClasses);
router.get("/customers", customerPackages);
router.get("/teacher-payments", teacherPayments);

export default router;

import { Router } from "express";
import { nextSequence, formatId } from "../models/Counter.js";

const REQUIRED_FIELDS = ["firstName", "lastName", "address", "phone", "email", "preferredContact"];

/**
 * Builds a CRUD router shared by Instructor and Customer, which follow the
 * same "add" use case: duplicate name confirmation, generated ID,
 * validation, save, and simulated welcome notification.
 */
export function createPersonRouter({ Model, idField, prefix, counterName, label }) {
  const router = Router();

  router.get("/", async (req, res) => {
    const records = await Model.find().sort({ createdAt: -1 });
    res.json(records);
  });

  router.post("/", async (req, res) => {
    const { firstName, lastName, confirmDuplicate } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "firstName and lastName are required" });
    }

    const missing = REQUIRED_FIELDS.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }

    // Case insensitive name match
    //  The client resubmits with confirmDuplicate
    if (!confirmDuplicate) {
      const existing = await Model.find({
        firstName: new RegExp(`^${firstName}$`, "i"),
        lastName: new RegExp(`^${lastName}$`, "i"),
      });
      if (existing.length > 0) {
        return res.status(409).json({
          duplicate: true,
          matches: existing,
          message: `A ${label} record for ${firstName} ${lastName} already exists. Submit again to confirm this is a different person.`,
        });
      }
    }

    const seq = await nextSequence(counterName);
    const newId = formatId(prefix, seq);

    try {
      const record = await Model.create({
        [idField]: newId,
        firstName,
        lastName,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        preferredContact: req.body.preferredContact,
      });

      // the confirmation message is logged as a stand-in for actually
      // sending it via the person's preferredContact method.
      const message = `Welcome to Yoga'Hom! Your ${label} id is ${newId}.`;
      console.log(`[notify ${record.preferredContact} -> ${record.email || record.phone}] ${message}`);

      res.status(201).json({ record, message });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}

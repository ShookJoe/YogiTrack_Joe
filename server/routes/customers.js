import Customer from "../models/Customer.js";
import { createPersonRouter } from "./personRouter.js";

// GET/POST /api/customers -- see personRouter.js for the shared logic.
const router = createPersonRouter({
  Model: Customer,
  idField: "customerId",
  prefix: "C",
  counterName: "customerId",
  label: "customer",
});

export default router;

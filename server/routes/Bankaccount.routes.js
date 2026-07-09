import express from "express";
import {
  getAllBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../controllers/Bankaccount.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createBankAccountSchema,
  updateBankAccountSchema,
} from "../schemas/bankAccount.schema.js";

const router = express.Router();

router.get("/", protect, isAdmin, getAllBankAccounts);
router.post(
  "/",
  protect,
  isAdmin,
  validate(createBankAccountSchema),
  createBankAccount,
);
router.put(
  "/:id",
  protect,
  isAdmin,
  validate(updateBankAccountSchema),
  updateBankAccount,
);
router.delete("/:id", protect, isAdmin, deleteBankAccount);

export default router;

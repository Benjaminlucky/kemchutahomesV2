import express from "express";
import {
  getAllBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../controllers/Bankaccount.controller.js";
import { protect, isAdmin, hasPermission } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createBankAccountSchema,
  updateBankAccountSchema,
} from "../schemas/bankAccount.schema.js";

const router = express.Router();

router.get("/", protect, isAdmin, hasPermission("bank_accounts"), getAllBankAccounts);
router.post(
  "/",
  protect,
  isAdmin,
  hasPermission("bank_accounts"),
  validate(createBankAccountSchema),
  createBankAccount,
);
router.put(
  "/:id",
  protect,
  isAdmin,
  hasPermission("bank_accounts"),
  validate(updateBankAccountSchema),
  updateBankAccount,
);
router.delete("/:id", protect, isAdmin, hasPermission("bank_accounts"), deleteBankAccount);

export default router;

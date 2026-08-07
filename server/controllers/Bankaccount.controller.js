import { isValidObjectId } from "mongoose";
import BankAccount from "../models/BankAccount.model.js";

// ── :id guard ────────────────────────────────────────────────────────────────
// Mirrors estate.controller.js's rejectedInvalidId — without it, a malformed
// id reaches findById/findByIdAndUpdate, throws a CastError, and gets reported
// as a generic 500 for what is plainly bad client input. Returns true when it
// has already sent the response.
const rejectedInvalidId = (req, res) => {
  if (isValidObjectId(req.params.id)) return false;
  res.status(400).json({ message: "Invalid bank account ID" });
  return true;
};

// ── Default seed (runs once if collection is empty) ───────────────────────────
const DEFAULTS = [
  {
    bankName: "ACCESS BANK PLC",
    accountName: "KEMCHUTA HOMES LIMITED",
    accountNumber: "0000000000",
    isPrimary: true,
    isActive: true,
    note: "Primary account for all property payments",
  },
];

async function ensureDefaults() {
  const count = await BankAccount.countDocuments();
  if (count === 0) await BankAccount.insertMany(DEFAULTS);
}

// ── Helper exported for use in subscription controller + pdfGenerator ─────────
// Returns active bank accounts sorted primary first
export async function getActiveBankAccounts() {
  await ensureDefaults();
  return BankAccount.find({ isActive: true })
    .sort({ isPrimary: -1, createdAt: 1 })
    .lean();
}

// ── GET /api/bank-accounts (admin) ───────────────────────────────────────────
export const getAllBankAccounts = async (req, res) => {
  try {
    await ensureDefaults();
    const accounts = await BankAccount.find()
      .sort({ isPrimary: -1, createdAt: 1 })
      .lean();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bank accounts" });
  }
};

// ── POST /api/bank-accounts (admin) ──────────────────────────────────────────
export const createBankAccount = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, sortCode, note, isPrimary } =
      req.body;
    if (!bankName?.trim() || !accountName?.trim() || !accountNumber?.trim())
      return res.status(400).json({
        message: "Bank name, account name, and account number are required",
      });

    // The very first account is always primary regardless of what was
    // requested — there must never be a moment with zero primary accounts.
    const isFirstAccount = (await BankAccount.countDocuments()) === 0;

    const account = await BankAccount.create({
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      sortCode: sortCode?.trim() || "",
      note: note?.trim() || "",
      isActive: true,
      isPrimary: isFirstAccount ? true : !!isPrimary,
    });

    // Demote others only AFTER the new account exists — if create() had
    // thrown, no other account would have been touched, so a failed request
    // never leaves the system with zero primary accounts.
    if (account.isPrimary) {
      await BankAccount.updateMany(
        { _id: { $ne: account._id } },
        { isPrimary: false },
      );
    }

    res.status(201).json({ message: "Bank account added", account });
  } catch (err) {
    console.error("createBankAccount:", err);
    res.status(500).json({ message: "Failed to create bank account" });
  }
};

// ── PUT /api/bank-accounts/:id (admin) ───────────────────────────────────────
export const updateBankAccount = async (req, res) => {
  if (rejectedInvalidId(req, res)) return;
  try {
    const existing = await BankAccount.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ message: "Bank account not found" });

    const {
      bankName,
      accountName,
      accountNumber,
      sortCode,
      note,
      isActive,
      isPrimary,
    } = req.body;

    const resultingActive =
      isActive !== undefined ? Boolean(isActive) : existing.isActive;
    const resultingPrimary =
      isPrimary !== undefined ? Boolean(isPrimary) : existing.isPrimary;

    if (resultingPrimary && !resultingActive) {
      return res.status(400).json({
        message: "The primary account must be active — activate it first, or make a different account primary.",
      });
    }

    if (existing.isActive && resultingActive === false) {
      const otherActive = await BankAccount.countDocuments({
        _id: { $ne: existing._id },
        isActive: true,
      });
      if (otherActive === 0) {
        return res
          .status(400)
          .json({ message: "Cannot deactivate the only active bank account." });
      }
    }

    if (existing.isPrimary && resultingPrimary === false) {
      const otherActive = await BankAccount.countDocuments({
        _id: { $ne: existing._id },
        isActive: true,
      });
      if (otherActive === 0) {
        return res.status(400).json({
          message: "Cannot unset the only account as primary — make another account primary instead.",
        });
      }
    }

    const account = await BankAccount.findByIdAndUpdate(
      req.params.id,
      {
        ...(bankName !== undefined && { bankName: bankName.trim() }),
        ...(accountName !== undefined && { accountName: accountName.trim() }),
        ...(accountNumber !== undefined && {
          accountNumber: accountNumber.trim(),
        }),
        ...(sortCode !== undefined && { sortCode: sortCode.trim() }),
        ...(note !== undefined && { note: note.trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isPrimary !== undefined && { isPrimary: Boolean(isPrimary) }),
      },
      { new: true },
    );

    // Demote others only AFTER the update succeeded — if another request had
    // deleted this id in the meantime, findByIdAndUpdate returns null above
    // (guarded, so we'd never reach here) and no other account gets touched.
    if (isPrimary) {
      await BankAccount.updateMany(
        { _id: { $ne: account._id } },
        { isPrimary: false },
      );
    }

    res.json({ message: "Bank account updated", account });
  } catch (err) {
    console.error("updateBankAccount:", err);
    res.status(500).json({ message: "Failed to update bank account" });
  }
};

// ── DELETE /api/bank-accounts/:id (admin) ────────────────────────────────────
export const deleteBankAccount = async (req, res) => {
  if (rejectedInvalidId(req, res)) return;
  try {
    const account = await BankAccount.findById(req.params.id);
    if (!account)
      return res.status(404).json({ message: "Bank account not found" });

    // Prevent deleting the last account
    const total = await BankAccount.countDocuments();
    if (total <= 1)
      return res
        .status(400)
        .json({ message: "Cannot delete the only bank account" });

    if (account.isActive) {
      const otherActive = await BankAccount.countDocuments({
        _id: { $ne: account._id },
        isActive: true,
      });
      if (otherActive === 0) {
        return res
          .status(400)
          .json({ message: "Cannot delete the only active bank account" });
      }
    }

    await BankAccount.findByIdAndDelete(req.params.id);

    // If deleted account was primary, promote the oldest remaining ACTIVE
    // account — an inactive account must never be silently crowned primary.
    if (account.isPrimary) {
      const replacement = await BankAccount.findOne({ isActive: true }).sort({
        createdAt: 1,
      });
      if (replacement)
        await BankAccount.findByIdAndUpdate(replacement._id, {
          isPrimary: true,
        });
    }

    res.json({ message: "Bank account deleted" });
  } catch (err) {
    console.error("deleteBankAccount:", err);
    res.status(500).json({ message: "Failed to delete bank account" });
  }
};

import BankAccount from "../models/BankAccount.model.js";

// ── Default seed (runs once if collection is empty) ───────────────────────────
const DEFAULTS = [
  {
    bankName: "ACCESS BANK PLC",
    accountName: "KEMCHUTA HOMES LIMITED",
    accountNumber: "XXXXXXXXXX",
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

    // If new account is primary, demote others
    if (isPrimary) {
      await BankAccount.updateMany({}, { isPrimary: false });
    }

    const account = await BankAccount.create({
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      sortCode: sortCode?.trim() || "",
      note: note?.trim() || "",
      isPrimary: !!isPrimary,
    });
    res.status(201).json({ message: "Bank account added", account });
  } catch (err) {
    console.error("createBankAccount:", err);
    res.status(500).json({ message: "Failed to create bank account" });
  }
};

// ── PUT /api/bank-accounts/:id (admin) ───────────────────────────────────────
export const updateBankAccount = async (req, res) => {
  try {
    const {
      bankName,
      accountName,
      accountNumber,
      sortCode,
      note,
      isActive,
      isPrimary,
    } = req.body;

    // If setting as primary, demote others first
    if (isPrimary) {
      await BankAccount.updateMany(
        { _id: { $ne: req.params.id } },
        { isPrimary: false },
      );
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
    if (!account)
      return res.status(404).json({ message: "Bank account not found" });
    res.json({ message: "Bank account updated", account });
  } catch (err) {
    res.status(500).json({ message: "Failed to update bank account" });
  }
};

// ── DELETE /api/bank-accounts/:id (admin) ────────────────────────────────────
export const deleteBankAccount = async (req, res) => {
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

    await BankAccount.findByIdAndDelete(req.params.id);

    // If deleted account was primary, promote oldest remaining
    if (account.isPrimary) {
      const oldest = await BankAccount.findOne().sort({ createdAt: 1 });
      if (oldest)
        await BankAccount.findByIdAndUpdate(oldest._id, { isPrimary: true });
    }

    res.json({ message: "Bank account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete bank account" });
  }
};

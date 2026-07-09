import Inspection from "../models/inspection.model.js";
import {
  notifyInspectionBooked,
  notifyInspectionStatusChanged,
} from "../utils/notifications.js";
import { escapeRegex } from "../utils/escapeRegex.js";

// ── POST /api/inspections ────────────────────────────────────────────────────
// Books an inspection and fires email + SMS to admin and client simultaneously.
export const bookInspection = async (req, res) => {
  try {
    const {
      estateName,
      estateId,
      firstName,
      lastName,
      email,
      phone,
      inspectionDate,
      persons,
      notes,
    } = req.body;

    if (
      !estateName ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !inspectionDate ||
      !persons
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    const date = new Date(inspectionDate);
    if (date < new Date()) {
      return res
        .status(400)
        .json({ message: "Inspection date cannot be in the past." });
    }

    const inspection = await Inspection.create({
      estateName,
      estateId: estateId || null,
      firstName,
      lastName,
      email,
      phone,
      inspectionDate: date,
      persons,
      notes,
    });

    // Fire dual-channel notification (email + SMS) — non-blocking
    notifyInspectionBooked(inspection).catch((err) =>
      console.error("Inspection notification failed:", err.message),
    );

    res.status(201).json({
      message: "Inspection booked successfully!",
      inspection: {
        _id: inspection._id,
        estateName: inspection.estateName,
        firstName: inspection.firstName,
        lastName: inspection.lastName,
        email: inspection.email,
        phone: inspection.phone,
        inspectionDate: inspection.inspectionDate,
        persons: inspection.persons,
        status: inspection.status,
      },
    });
  } catch (err) {
    console.error("bookInspection:", err);
    res.status(500).json({ message: "Failed to book inspection." });
  }
};

// ── GET /api/inspections — Admin: get all ────────────────────────────────────
export const getAllInspections = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const safeSearch = escapeRegex(String(search).slice(0, 100));
      filter.$or = [
        { estateName: { $regex: safeSearch, $options: "i" } },
        { firstName: { $regex: safeSearch, $options: "i" } },
        { lastName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [inspections, total] = await Promise.all([
      Inspection.find(filter)
        .sort({ inspectionDate: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Inspection.countDocuments(filter),
    ]);
    res.json({
      inspections,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inspections." });
  }
};

// ── PATCH /api/inspections/:id/status — Admin: update status ─────────────────
// Fires email + SMS to the client for confirmed, cancelled, and completed.
// Was previously silent — clients received nothing on status change.
export const updateInspectionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "confirmed", "cancelled", "completed"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!inspection)
      return res.status(404).json({ message: "Inspection not found." });

    // Notify client on every meaningful status change (fire and forget)
    if (["confirmed", "cancelled", "completed"].includes(status)) {
      notifyInspectionStatusChanged(inspection).catch((err) =>
        console.error("Inspection status notification failed:", err.message),
      );
    }

    res.json({ message: "Status updated.", inspection });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status." });
  }
};

// ── PATCH /api/inspections/:id/notes — Admin: update notes ───────────────────
export const updateInspectionNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      { notes: notes || "" },
      { new: true },
    );
    if (!inspection)
      return res.status(404).json({ message: "Inspection not found." });
    res.json({ message: "Notes updated.", inspection });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notes." });
  }
};

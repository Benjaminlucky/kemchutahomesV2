"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  icon: Icon = AlertTriangle,
  danger = true,
  loading = false,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  icon?: LucideIcon;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${danger ? "bg-red-100" : "bg-customPurple-100"}`}
            >
              <Icon className={danger ? "text-red-600" : "text-customPurple-600"} size={28} />
            </div>
            <h3 className="mt-4 text-center text-2xl font-bold text-gray-800">{title}</h3>
            <div className="mt-3 text-center leading-relaxed text-gray-600">{description}</div>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" size="md" className="flex-1 rounded-lg" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                variant={danger ? "dangerSolid" : "primary"}
                size="md"
                loading={loading}
                className="flex-1 rounded-lg"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

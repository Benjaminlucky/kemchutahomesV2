"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

function ToastInner({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -20, x: "-50%" }}
      className="fixed top-6 left-1/2 z-[100] flex items-center gap-3 rounded-xl border border-green-200 bg-white px-6 py-4 shadow-2xl"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="text-green-600" size={20} />
      </div>
      <div>
        <p className="font-semibold text-gray-800">Success!</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 rounded-full p-1 transition-colors hover:bg-gray-100">
        <X size={16} className="text-gray-500" />
      </button>
    </motion.div>
  );
}

export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  return <AnimatePresence>{message && <ToastInner message={message} onClose={onClose} />}</AnimatePresence>;
}

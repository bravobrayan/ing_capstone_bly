import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function PopupSuccess({ show, message, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="bg-white rounded-3xl shadow-xl p-6 text-center w-80 border border-purple-100"
          >
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <h2 className="text-lg font-semibold text-gray-800 mb-1">¡Listo!</h2>
            <p className="text-sm text-gray-600 mb-5">{message}</p>
            <button
              onClick={onClose}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              Aceptar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

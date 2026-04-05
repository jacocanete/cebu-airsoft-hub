import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedCountProps {
  value: number;
  className?: string;
}

export function AnimatedCount({ value, className = "" }: AnimatedCountProps) {
  const prevRef = useRef(value);
  const direction = value >= prevRef.current ? 1 : -1;
  prevRef.current = value;

  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={{ y: direction * 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction * -12, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

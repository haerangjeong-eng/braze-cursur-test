import { motion } from 'framer-motion'

/** HTML 복사 성공 시 — 원이 나타난 뒤 체크 선이 그려지는 연출 */
export default function HtmlCopySuccessIcon() {
  return (
    <motion.div
      className="relative flex h-10 w-10 shrink-0 items-center justify-center"
      initial={{ scale: 0.35, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 24, mass: 0.55 }}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="h-9 w-9 text-green-300" fill="none">
        <motion.circle
          cx="20"
          cy="20"
          r="16"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
        />
        <motion.path
          d="M11.5 20.5l5.2 5.2L28.5 13"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        />
      </svg>
    </motion.div>
  )
}

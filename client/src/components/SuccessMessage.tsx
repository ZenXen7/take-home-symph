import { motion } from "framer-motion"
import { CheckCircleIcon, CheckIcon, CopyIcon } from "lucide-react"

interface ShortenedUrl {
  id: string
  original_url: string
  short_url: string
  short_code: string
  custom_slug: string | null
  expiration_date: string | null
  utm_parameters: Record<string, string> | null
  click_count: number
  createdAt: string
}

interface SuccessMessageProps {
  shortenedUrl: ShortenedUrl
  copied: boolean
  onCopy: (text: string) => void
}

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

export default function SuccessMessage({ shortenedUrl, copied, onCopy }: SuccessMessageProps) {
  return (
    <motion.div
      className="bg-green-50 border border-green-200 rounded-2xl p-8 md:p-10 mb-8 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h3 className="text-xl md:text-2xl font-semibold mb-4 text-green-700 flex items-center gap-2">
        <CheckCircleIcon className="w-6 h-6" /> URL Shortened Successfully!
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-green-700">Your shortened URL:</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={shortenedUrl.short_url}
              readOnly
              className="flex-1 p-3 bg-white rounded-lg border border-green-300 text-slate-900 text-base truncate"
            />
            <motion.button
              onClick={() => onCopy(shortenedUrl.short_url)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center gap-2"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-5 h-5" /> Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="w-5 h-5" /> Copy
                </>
              )}
            </motion.button>
          </div>
        </div>
        <div className="text-sm text-green-700 space-y-1">
          <p>
            <strong>Original URL:</strong>{" "}
            <a
              href={shortenedUrl.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-800 truncate inline-block max-w-full"
            >
              {shortenedUrl.original_url}
            </a>
          </p>
          <p>
            <strong>Short Code:</strong> {shortenedUrl.short_code}
          </p>
          {shortenedUrl.expiration_date && (
            <p>
              <strong>Expires:</strong> {new Date(shortenedUrl.expiration_date).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
} 
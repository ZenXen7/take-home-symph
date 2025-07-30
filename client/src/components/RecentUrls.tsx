import { motion } from "framer-motion"
import { CopyIcon, ClockIcon } from "lucide-react"

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

interface RecentUrlsProps {
  urls: ShortenedUrl[]
  onCopy: (text: string) => void
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

export default function RecentUrls({ urls, onCopy }: RecentUrlsProps) {
  if (urls.length === 0) return null

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 md:p-10 shadow-xl border border-slate-200/50"
      variants={cardVariants}
    >
      <h3 className="text-xl md:text-2xl font-semibold mb-6 text-slate-800 flex items-center gap-2">
        <ClockIcon className="w-6 h-6" /> Recent URLs
      </h3>
      <motion.div className="space-y-4" variants={containerVariants}>
        {urls.map((url) => (
          <motion.div
            key={url.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-500 transition-all duration-200"
            variants={itemVariants}
          >
            <div className="flex-1 min-w-0 mb-2 sm:mb-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <a
                  href={url.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium text-lg truncate"
                >
                  /{url.short_code}
                </a>
                <span className="text-slate-400 hidden sm:block">→</span>
                <span className="text-slate-600 truncate text-sm max-w-full sm:max-w-[calc(100%-100px)]">
                  {url.original_url}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {url.click_count} clicks • Created {new Date(url.createdAt).toLocaleDateString()}
              </div>
            </div>
            <motion.button
              onClick={() => onCopy(url.short_url)}
              className="ml-0 sm:ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors duration-200 flex items-center gap-1"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <CopyIcon className="w-4 h-4" /> Copy
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
} 
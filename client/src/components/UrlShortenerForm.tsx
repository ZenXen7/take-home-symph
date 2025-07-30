import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
} from "lucide-react"

interface UrlFormData {
  original_url: string
  custom_slug: string
  expiration_date: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
}

interface UrlShortenerFormProps {
  onSubmit: (formData: UrlFormData) => Promise<void>
  loading: boolean
  error: string
  apiBaseUrl: string
}


const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

export default function UrlShortenerForm({ onSubmit, loading, error, apiBaseUrl }: UrlShortenerFormProps) {
  const [formData, setFormData] = useState<UrlFormData>({
    original_url: "",
    custom_slug: "",
    expiration_date: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 md:p-10 mb-8 shadow-xl border border-slate-200/50"
      variants={cardVariants}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="original_url" className="block text-sm font-semibold mb-2 text-slate-700">
            Enter your long URL *
          </label>
          <input
            id="original_url"
            type="text"
            name="original_url"
            value={formData.original_url}
            onChange={handleInputChange}
            placeholder="https://example.com/very-long-url"
            className="w-full p-4 bg-white rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="custom_slug" className="block text-sm font-semibold mb-2 text-slate-700">
            Custom slug (optional)
          </label>
          <div className="flex rounded-lg overflow-hidden border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
            <span className="inline-flex items-center px-4 bg-slate-100 text-slate-600 text-sm font-medium">
              {`${apiBaseUrl.replace(/^(https?:\/\/(?:www\.)?)/, "")}/`}
            </span>
            <input
              id="custom_slug"
              type="text"
              name="custom_slug"
              value={formData.custom_slug}
              onChange={handleInputChange}
              placeholder="my-custom-link"
              className="flex-1 p-4 bg-white text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
        <motion.button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
          whileHover={{ x: 5 }}
        >
          {showAdvanced ? (
            <>
              <ChevronUpIcon className="w-4 h-4" /> Hide Advanced Options
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" /> Show Advanced Options
            </>
          )}
        </motion.button>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden"
            >
              <div>
                <label htmlFor="expiration_date" className="block text-sm font-medium mb-2 text-slate-700">
                  Expiration Date (optional)
                </label>
                <input
                  id="expiration_date"
                  type="datetime-local"
                  name="expiration_date"
                  value={formData.expiration_date}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 transition-all duration-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="utm_source" className="block text-sm font-medium mb-2 text-slate-700">
                    UTM Source
                  </label>
                  <input
                    id="utm_source"
                    type="text"
                    name="utm_source"
                    value={formData.utm_source}
                    onChange={handleInputChange}
                    placeholder="google"
                    className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="utm_medium" className="block text-sm font-medium mb-2 text-slate-700">
                    UTM Medium
                  </label>
                  <input
                    id="utm_medium"
                    type="text"
                    name="utm_medium"
                    value={formData.utm_medium}
                    onChange={handleInputChange}
                    placeholder="email"
                    className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="utm_campaign" className="block text-sm font-medium mb-2 text-slate-700">
                    UTM Campaign
                  </label>
                  <input
                    id="utm_campaign"
                    type="text"
                    name="utm_campaign"
                    value={formData.utm_campaign}
                    onChange={handleInputChange}
                    placeholder="summer_sale"
                    className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="utm_term" className="block text-sm font-medium mb-2 text-slate-700">
                    UTM Term
                  </label>
                  <input
                    id="utm_term"
                    type="text"
                    name="utm_term"
                    value={formData.utm_term}
                    onChange={handleInputChange}
                    placeholder="running shoes"
                    className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="utm_content" className="block text-sm font-medium mb-2 text-slate-700">
                    UTM Content
                  </label>
                  <input
                    id="utm_content"
                    type="text"
                    name="utm_content"
                    value={formData.utm_content}
                    onChange={handleInputChange}
                    placeholder="logolink"
                    className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2Icon className="animate-spin w-5 h-5" /> Shortening...
            </span>
          ) : (
            "Shorten URL"
          )}
        </motion.button>
      </form>
    </motion.div>
  )
} 
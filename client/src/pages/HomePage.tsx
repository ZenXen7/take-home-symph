import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRightIcon,
  TrendingUpIcon,
} from "lucide-react"
import UrlShortenerForm from "../components/UrlShortenerForm"
import SuccessMessage from "../components/SuccessMessage"
import RecentUrls from "../components/RecentUrls"

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


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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


export default function HomePage() {
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null)
  const [recentUrls, setRecentUrls] = useState<ShortenedUrl[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchRecentUrls()
  }, [])

  const fetchRecentUrls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls?limit=5`)
      if (response.ok) {
        const data = await response.json()
        setRecentUrls(data.urls || [])
      }
    } catch (err) {
      console.error("Failed to fetch recent URLs:", err)
    }
  }

  const handleSubmit = async (formData: UrlFormData) => {
    setError("")
    setShortenedUrl(null)

    if (!formData.original_url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    setLoading(true)
    try {
      const utmParams: Record<string, string> = {}
      if (formData.utm_source) utmParams["utm_source"] = formData.utm_source
      if (formData.utm_medium) utmParams["utm_medium"] = formData.utm_medium
      if (formData.utm_campaign) utmParams["utm_campaign"] = formData.utm_campaign
      if (formData.utm_term) utmParams["utm_term"] = formData.utm_term
      if (formData.utm_content) utmParams["utm_content"] = formData.utm_content

      const requestBody = {
        original_url: formData.original_url.trim(),
        custom_slug: formData.custom_slug?.trim() || undefined,
        expiration_date: formData.expiration_date || undefined,
        utm_parameters: Object.keys(utmParams).length > 0 ? utmParams : undefined,
      }
      const response = await fetch(`${API_BASE_URL}/api/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
      const data = await response.json()
      if (response.ok) {
        setShortenedUrl(data)
        fetchRecentUrls()
      } else {
        setError(data.error || "Failed to shorten URL")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }



  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900 font-sans"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight"
            variants={itemVariants}
          >
            URL Shortener
          </motion.h1>
          <motion.p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto" variants={itemVariants}>
            Create short, memorable links with advanced tracking capabilities
          </motion.p>
        </div>

        <div className="max-w-2xl mx-auto">
          <UrlShortenerForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            apiBaseUrl={API_BASE_URL}
          />

                    <AnimatePresence>
            {shortenedUrl && (
              <SuccessMessage
                shortenedUrl={shortenedUrl}
                copied={copied}
                onCopy={copyToClipboard}
              />
            )}
          </AnimatePresence>

          <RecentUrls urls={recentUrls} onCopy={copyToClipboard} />
        </div>

        <div className="text-center mt-12">
          <Link
            to="/second"
            className="inline-flex items-center px-8 py-4 bg-slate-800 hover:bg-slate-900 rounded-full transition-all duration-300 text-lg font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-slate-500/30"
          >
            <TrendingUpIcon className="mr-2 w-5 h-5" />
            View Analytics Dashboard <ArrowRightIcon className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

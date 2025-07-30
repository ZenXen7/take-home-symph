import { TrendingUp, Eye } from "lucide-react"

interface UrlData {
  id: string
  original_url: string
  short_url: string
  short_code: string
  custom_slug: string | null
  click_count: number
  createdAt: string
  is_expired: boolean
  expiration_date: string | null
  utm_parameters: Record<string, string> | null
}

interface TopPerformingUrlsProps {
  urls: UrlData[]
  onViewUrl: (url: UrlData) => void
}

export default function TopPerformingUrls({ urls, onViewUrl }: TopPerformingUrlsProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50">
      <h3 className="text-xl font-semibold mb-6 text-green-700 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" /> Top Performing URLs
      </h3>
      <div className="space-y-4">
        {urls.map((url, index) => (
          <div key={url.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-600">/{url.short_code}</span>
                <span className="text-green-700 font-semibold">{url.click_count} clicks</span>
              </div>
              <p className="text-slate-600 text-sm truncate">{url.original_url}</p>
            </div>
            <button
              onClick={() => onViewUrl(url)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors text-white flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 
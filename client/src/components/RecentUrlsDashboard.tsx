import { Clock, Eye, AlertCircle } from "lucide-react"

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

interface RecentUrlsDashboardProps {
  urls: UrlData[]
  onViewUrl: (url: UrlData) => void
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function RecentUrlsDashboard({ urls, onViewUrl }: RecentUrlsDashboardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50">
      <h3 className="text-xl font-semibold mb-6 text-blue-700 flex items-center gap-2">
        <Clock className="w-5 h-5" /> Recent URLs
      </h3>
      <div className="space-y-4">
        {urls.map((url) => (
          <div key={url.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-600">/{url.short_code}</span>
                <span className="text-slate-600">{url.click_count} clicks</span>
                {url.is_expired && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Expired
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm truncate">{url.original_url}</p>
              <p className="text-slate-500 text-xs">{formatDate(url.createdAt)}</p>
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
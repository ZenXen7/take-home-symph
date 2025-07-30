import { LinkIcon, Eye, BarChart3, Clock } from "lucide-react"

interface Analytics {
  totalUrls: number
  totalClicks: number
  avgClicksPerUrl: number
  expiredUrls: number
}

interface AnalyticsCardsProps {
  analytics: Analytics
}

export default function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Total URLs</p>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalUrls}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <LinkIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Total Clicks</p>
            <p className="text-3xl font-bold text-green-600">{analytics.totalClicks}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Avg Clicks/URL</p>
            <p className="text-3xl font-bold text-slate-700">{analytics.avgClicksPerUrl}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-lg">
            <BarChart3 className="w-8 h-8 text-slate-700" />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Expired URLs</p>
            <p className="text-3xl font-bold text-red-600">{analytics.expiredUrls}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  )
} 
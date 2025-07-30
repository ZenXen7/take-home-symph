import { Copy, Eye, Trash2, AlertCircle, CheckCircle } from "lucide-react"

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

interface UrlTableProps {
  urls: UrlData[]
  copied: boolean
  onCopy: (text: string) => void
  onViewUrl: (url: UrlData) => void
  onDeleteUrl: (id: string) => void
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

export default function UrlTable({ urls, copied, onCopy, onViewUrl, onDeleteUrl }: UrlTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50">
      <h3 className="text-xl font-semibold mb-6 text-slate-800">All URLs</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-slate-700 font-medium">Short Code</th>
              <th className="text-left py-3 px-4 text-slate-700 font-medium">Original URL</th>
              <th className="text-left py-3 px-4 text-slate-700 font-medium">Clicks</th>
              <th className="text-left py-3 px-4 text-slate-700 font-medium">Created</th>
              <th className="text-left py-3 px-4 text-slate-700 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-slate-700 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url) => (
              <tr key={url.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <span className="font-mono text-blue-600">/{url.short_code}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="max-w-xs">
                    <p className="truncate text-slate-700">{url.original_url}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-green-600 font-semibold">{url.click_count}</span>
                </td>
                <td className="py-3 px-4 text-slate-600 text-sm">
                  {formatDate(url.createdAt)}
                </td>
                <td className="py-3 px-4">
                  {url.is_expired ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Expired
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCopy(url.short_url)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors text-white flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => onViewUrl(url)}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-xs transition-colors text-white flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => onDeleteUrl(url.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors text-white flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 
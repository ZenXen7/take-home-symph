import { X, Copy, Trash2, AlertCircle, CheckCircle } from "lucide-react"

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

interface UrlDetailsModalProps {
  url: UrlData | null
  onClose: () => void
  onCopy: (text: string) => void
  onDelete: (id: string) => void
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

export default function UrlDetailsModal({ url, onClose, onCopy, onDelete }: UrlDetailsModalProps) {
  if (!url) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">URL Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Short URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url.short_url}
                readOnly
                className="flex-1 p-3 bg-slate-50 rounded border border-slate-200 text-slate-900"
              />
              <button
                onClick={() => onCopy(url.short_url)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-white flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Original URL</label>
            <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-900 break-all">{url.original_url}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Short Code</label>
              <p className="p-3 bg-slate-50 rounded border border-slate-200 text-blue-600 font-mono">{url.short_code}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Click Count</label>
              <p className="p-3 bg-slate-50 rounded border border-slate-200 text-green-600 font-semibold">{url.click_count}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Created</label>
              <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-900">{formatDate(url.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                {url.is_expired ? (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Expired
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {url.expiration_date && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Expiration Date</label>
              <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-900">{formatDate(url.expiration_date)}</p>
            </div>
          )}

          {url.utm_parameters && Object.keys(url.utm_parameters).length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">UTM Parameters</label>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <pre className="text-sm text-slate-900 whitespace-pre-wrap">
                  {JSON.stringify(url.utm_parameters, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onCopy(url.short_url)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-white flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Short URL
            </button>
            <button
              onClick={() => onDelete(url.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors text-white flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete URL
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded transition-colors text-white flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
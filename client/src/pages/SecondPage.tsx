import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  analyticsResponseSchema, 
  analyticsSchema,
  type UrlData,
  type Analytics
} from "../schemas/urlSchemas";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function SecondPage() {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedUrl, setSelectedUrl] = useState<UrlData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls?limit=100`);
      if (response.ok) {
        const rawData = await response.json();
        
        // Validate API response with Zod
        const validationResult = analyticsResponseSchema.safeParse(rawData);
        
        if (!validationResult.success) {
          console.error('API response validation failed:', validationResult.error);
          setError('Invalid data received from server');
          return;
        }
        
        const data = validationResult.data;
        setUrls(data.urls);
        
        const totalUrls = data.urls.length;
        const totalClicks = data.urls.reduce((sum, url) => sum + url.click_count, 0);
        const avgClicksPerUrl = totalUrls > 0 ? Math.round((totalClicks / totalUrls) * 10) / 10 : 0;
        const expiredUrls = data.urls.filter((url) => url.is_expired).length;

        const analyticsData = {
          totalUrls,
          totalClicks,
          avgClicksPerUrl,
          expiredUrls
        };

        // Validate analytics data
        const analyticsValidation = analyticsSchema.safeParse(analyticsData);
        if (analyticsValidation.success) {
          setAnalytics(analyticsValidation.data);
        } else {
          console.error('Analytics validation failed:', analyticsValidation.error);
          setError('Invalid analytics data');
        }
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUrls(urls.filter(url => url.id !== id));
        if (selectedUrl?.id === id) {
          setSelectedUrl(null);
        }
        
        const updatedUrls = urls.filter(url => url.id !== id);
        const totalUrls = updatedUrls.length;
        const totalClicks = updatedUrls.reduce((sum, url) => sum + url.click_count, 0);
        const avgClicksPerUrl = totalUrls > 0 ? Math.round((totalClicks / totalUrls) * 10) / 10 : 0;
        const expiredUrls = updatedUrls.filter(url => url.is_expired).length;

        const analyticsData = {
          totalUrls,
          totalClicks,
          avgClicksPerUrl,
          expiredUrls
        };

        // Validate analytics data before setting
        const analyticsValidation = analyticsSchema.safeParse(analyticsData);
        if (analyticsValidation.success) {
          setAnalytics(analyticsValidation.data);
        } else {
          console.error('Analytics validation failed after delete:', analyticsValidation.error);
        }
      } else {
        setError('Failed to delete URL');
      }
    } catch {
      setError('Network error occurred');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTopUrls = () => {
    return urls
      .sort((a, b) => b.click_count - a.click_count)
      .slice(0, 5);
  };

  const getRecentUrls = () => {
    return urls
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-300">Track and manage your shortened URLs</p>
          </div>
          <Link 
            to="/" 
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
          >
            ← Create New URL
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total URLs</p>
                  <p className="text-3xl font-bold text-blue-400">{analytics.totalUrls}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Clicks</p>
                  <p className="text-3xl font-bold text-green-400">{analytics.totalClicks}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Clicks/URL</p>
                  <p className="text-3xl font-bold text-purple-400">{analytics.avgClicksPerUrl}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Expired URLs</p>
                  <p className="text-3xl font-bold text-red-400">{analytics.expiredUrls}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-green-400">🏆 Top Performing URLs</h3>
            <div className="space-y-4">
              {getTopUrls().map((url, index) => (
                <div key={url.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-purple-400">/{url.short_code}</span>
                      <span className="text-green-400 font-semibold">{url.click_count} clicks</span>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{url.original_url}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUrl(url)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-blue-400">🕒 Recent URLs</h3>
            <div className="space-y-4">
              {getRecentUrls().map((url) => (
                <div key={url.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-purple-400">/{url.short_code}</span>
                      <span className="text-gray-400">{url.click_count} clicks</span>
                      {url.is_expired && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">{url.original_url}</p>
                    <p className="text-gray-500 text-xs">{formatDate(url.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUrl(url)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">All URLs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-300">Short Code</th>
                  <th className="text-left py-3 px-4 text-gray-300">Original URL</th>
                  <th className="text-left py-3 px-4 text-gray-300">Clicks</th>
                  <th className="text-left py-3 px-4 text-gray-300">Created</th>
                  <th className="text-left py-3 px-4 text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <span className="font-mono text-purple-400">/{url.short_code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <p className="truncate text-gray-300">{url.original_url}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-green-400 font-semibold">{url.click_count}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {formatDate(url.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {url.is_expired ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(url.short_url)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => setSelectedUrl(url)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteUrl(url.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                        >
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

        {selectedUrl && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">URL Details</h3>
                <button
                  onClick={() => setSelectedUrl(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Short URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedUrl.short_url}
                      readOnly
                      className="flex-1 p-3 bg-slate-700 rounded border text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedUrl.short_url)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Original URL</label>
                  <p className="p-3 bg-slate-700 rounded text-white break-all">{selectedUrl.original_url}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Short Code</label>
                    <p className="p-3 bg-slate-700 rounded text-purple-400 font-mono">{selectedUrl.short_code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Click Count</label>
                    <p className="p-3 bg-slate-700 rounded text-green-400 font-semibold">{selectedUrl.click_count}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Created</label>
                    <p className="p-3 bg-slate-700 rounded text-white">{formatDate(selectedUrl.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <div className="p-3 bg-slate-700 rounded">
                      {selectedUrl.is_expired ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm rounded">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedUrl.expiration_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Expiration Date</label>
                    <p className="p-3 bg-slate-700 rounded text-white">{formatDate(selectedUrl.expiration_date)}</p>
                  </div>
                )}

                {selectedUrl.utm_parameters && Object.keys(selectedUrl.utm_parameters).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">UTM Parameters</label>
                    <div className="p-3 bg-slate-700 rounded">
                      <pre className="text-sm text-white whitespace-pre-wrap">
                        {JSON.stringify(selectedUrl.utm_parameters, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => copyToClipboard(selectedUrl.short_url)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Copy Short URL
                  </button>
                  <button
                    onClick={() => deleteUrl(selectedUrl.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    Delete URL
                  </button>
                  <button
                    onClick={() => setSelectedUrl(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecondPage;

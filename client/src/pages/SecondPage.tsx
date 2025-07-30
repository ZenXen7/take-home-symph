import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  analyticsResponseSchema, 
  analyticsSchema,
  type UrlData,
  type Analytics
} from "../schemas/urlSchemas";
import AnalyticsCards from "../components/AnalyticsCards";
import TopPerformingUrls from "../components/TopPerformingUrls";
import RecentUrlsDashboard from "../components/RecentUrlsDashboard";
import UrlTable from "../components/UrlTable";
import UrlDetailsModal from "../components/UrlDetailsModal";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">Track and manage your shortened URLs</p>
          </div>
          <Link 
            to="/" 
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors font-medium text-white"
          >
            ← Create New URL
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {analytics && <AnalyticsCards analytics={analytics} />}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <TopPerformingUrls urls={getTopUrls()} onViewUrl={setSelectedUrl} />
          <RecentUrlsDashboard urls={getRecentUrls()} onViewUrl={setSelectedUrl} />
        </div>

        <UrlTable
          urls={urls}
          copied={copied}
          onCopy={copyToClipboard}
          onViewUrl={setSelectedUrl}
          onDeleteUrl={deleteUrl}
        />

        <UrlDetailsModal
          url={selectedUrl}
          onClose={() => setSelectedUrl(null)}
          onCopy={copyToClipboard}
          onDelete={deleteUrl}
        />
      </div>
    </div>
  );
}

export default SecondPage;

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  urlFormSchema, 
  shortenedUrlSchema, 
  recentUrlsSchema,
  type UrlFormData,
  type ShortenedUrl
} from "../schemas/urlSchemas";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function HomePage() {
  const [formData, setFormData] = useState<UrlFormData>({
    original_url: '',
    custom_slug: '',
    expiration_date: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: ''
  });
  
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null);
  const [recentUrls, setRecentUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRecentUrls();
  }, []);

  const fetchRecentUrls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls?limit=5`);
      if (response.ok) {
        const rawData = await response.json();
        
        // Validate the response
        const validationResult = recentUrlsSchema.safeParse(rawData);
        
        if (validationResult.success) {
          setRecentUrls(validationResult.data.urls);
        } else {
          console.error('Recent URLs validation failed:', validationResult.error);
        }
      }
    } catch (err) {
      console.error('Failed to fetch recent URLs:', err);
    }
  };

  const buildUtmParameters = (formData: UrlFormData) => {
    const utmParams: Record<string, string> = {};
    if (formData.utm_source) utmParams['utm_source'] = formData.utm_source;
    if (formData.utm_medium) utmParams['utm_medium'] = formData.utm_medium;
    if (formData.utm_campaign) utmParams['utm_campaign'] = formData.utm_campaign;
    if (formData.utm_term) utmParams['utm_term'] = formData.utm_term;
    if (formData.utm_content) utmParams['utm_content'] = formData.utm_content;
    return Object.keys(utmParams).length > 0 ? utmParams : undefined;
  };

  const resetForm = () => {
    setFormData({
      original_url: '',
      custom_slug: '',
      expiration_date: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: ''
    });
    setShowAdvanced(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortenedUrl(null);
    
    const validationResult = urlFormSchema.safeParse(formData);

    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        original_url: validationResult.data.original_url.trim(),
        custom_slug: validationResult.data.custom_slug?.trim() || undefined,
        expiration_date: validationResult.data.expiration_date || undefined,
        utm_parameters: buildUtmParameters(validationResult.data)
      };

      const response = await fetch(`${API_BASE_URL}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const rawData = await response.json();

      if (response.ok) {
        // Validate the response data
        const validationResult = shortenedUrlSchema.safeParse(rawData);
        
        if (validationResult.success) {
          setShortenedUrl(validationResult.data);
          resetForm();
          fetchRecentUrls();
        } else {
          console.error('Response validation failed:', validationResult.error);
          setError('Invalid response from server');
        }
      } else {
        setError(rawData.error || 'Failed to shorten URL');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            URL Shortener
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Create short, memorable links with advanced tracking capabilities
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter your long URL *
                </label>
                <input
                  type="text"
                  name="original_url"
                  value={formData.original_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/very-long-url"
                  className="w-full p-4 bg-white/20 rounded-lg border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Custom slug (optional)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-white/20 border border-r-0 border-white/30 rounded-l-lg text-gray-300">
                    localhost:8000/
                  </span>
                  <input
                    type="text"
                    name="custom_slug"
                    value={formData.custom_slug}
                    onChange={handleInputChange}
                    placeholder="my-custom-link"
                    className="flex-1 p-4 bg-white/20 rounded-r-lg border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-300"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                {showAdvanced ? '↑ Hide' : '↓ Show'} Advanced Options
              </button>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expiration Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      name="expiration_date"
                      value={formData.expiration_date}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white/20 rounded-lg border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        UTM Source
                      </label>
                      <input
                        type="text"
                        name="utm_source"
                        value={formData.utm_source}
                        onChange={handleInputChange}
                        placeholder="google"
                        className="w-full p-3 bg-white/20 rounded-lg border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        UTM Medium
                      </label>
                      <input
                        type="text"
                        name="utm_medium"
                        value={formData.utm_medium}
                        onChange={handleInputChange}
                        placeholder="email"
                        className="w-full p-3 bg-white/20 rounded-lg border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        UTM Campaign
                      </label>
                      <input
                        type="text"
                        name="utm_campaign"
                        value={formData.utm_campaign}
                        onChange={handleInputChange}
                        placeholder="summer_sale"
                        className="w-full p-3 bg-white/20 rounded-lg border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        UTM Term
                      </label>
                      <input
                        type="text"
                        name="utm_term"
                        value={formData.utm_term}
                        onChange={handleInputChange}
                        placeholder="running shoes"
                        className="w-full p-3 bg-white/20 rounded-lg border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        UTM Content
                      </label>
                      <input
                        type="text"
                        name="utm_content"
                        value={formData.utm_content}
                        onChange={handleInputChange}
                        placeholder="logolink"
                        className="w-full p-3 bg-white/20 rounded-lg border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </form>
          </div>

          {shortenedUrl && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-green-200">
                URL Shortened Successfully! 🎉
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-green-200">
                    Your shortened URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shortenedUrl.short_url}
                      readOnly
                      className="flex-1 p-3 bg-white/20 rounded-lg border border-green-400/50 text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(shortenedUrl.short_url)}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-green-200">
                  <p><strong>Original URL:</strong> {shortenedUrl.original_url}</p>
                  <p><strong>Short Code:</strong> {shortenedUrl.short_code}</p>
                  {shortenedUrl.expiration_date && (
                    <p><strong>Expires:</strong> {new Date(shortenedUrl.expiration_date).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {recentUrls.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6">Recent URLs</h3>
              <div className="space-y-4">
                {recentUrls.map((url) => (
                  <div key={url.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <a
                          href={url.short_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 font-medium"
                        >
                          /{url.short_code}
                        </a>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-300 truncate text-sm">
                          {url.original_url}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {url.click_count} clicks • Created {new Date(url.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(url.short_url)}
                      className="ml-4 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/second" 
            className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            View Analytics Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

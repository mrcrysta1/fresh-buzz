import { ExternalLink, Clock, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  roman_summary: string;
  link: string;
  created_at: string;
  source: string;
}

const NewsFeed = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching news:', error);
        toast({
          title: "Error",
          description: "Failed to fetch latest news",
          variant: "destructive"
        });
        return;
      }

      setNewsItems(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error", 
        description: "Failed to connect to news service",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    setRefreshing(true);
    try {
      // Call the edge function to fetch fresh news
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) {
        throw error;
      }

      toast({
        title: "News Updated",
        description: data.message || "Fresh news fetched successfully"
      });

      // Refresh the local news list
      await fetchNews();
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not fetch fresh news. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleReadMore = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Latest News</h1>
          <p className="text-muted-foreground">Loading fresh headlines...</p>
        </div>
        <div className="grid gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="news-card animate-pulse">
              <div className="h-6 bg-muted rounded mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Latest News</h1>
        <p className="text-muted-foreground">Stay updated with Pakistani business & finance news</p>
        
        <Button 
          onClick={refreshNews}
          disabled={refreshing}
          variant="outline" 
          size="sm"
          className="mt-4"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Fetching...' : 'Refresh News'}
        </Button>
      </div>

      {newsItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No news items found</p>
          <Button onClick={refreshNews} disabled={refreshing}>
            {refreshing ? 'Fetching...' : 'Fetch Latest News'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {newsItems.map((item) => (
            <article key={item.id} className="news-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <h2 className="text-xl font-semibold text-foreground leading-tight hover:text-primary transition-colors cursor-pointer"
                      onClick={() => handleReadMore(item.link)}>
                    {item.title}
                  </h2>
                  
                  {item.roman_summary && (
                    <div className="bg-accent/50 rounded-lg p-3 border-l-4 border-primary">
                      <p className="text-sm text-foreground font-medium">
                        🌟 {item.roman_summary}
                      </p>
                    </div>
                  )}
                  
                  {item.summary && (
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {item.summary}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(item.created_at)}
                      </span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        {item.source}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReadMore(item.link)}
                      className="ml-auto"
                    >
                      Read More
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
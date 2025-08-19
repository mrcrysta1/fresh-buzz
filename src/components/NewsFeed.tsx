import { ExternalLink, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

// Mock data - replace with API call to your Python backend
const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "Breaking: Major Tech Company Announces Revolutionary AI Breakthrough",
    description: "Scientists have developed a new artificial intelligence system that can process information 10x faster than current models, potentially revolutionizing multiple industries.",
    url: "https://example.com/news/1",
    publishedAt: "2024-01-19T10:30:00Z",
    source: "TechNews Today"
  },
  {
    id: "2", 
    title: "Global Climate Summit Reaches Historic Agreement",
    description: "World leaders have signed a landmark agreement to reduce carbon emissions by 50% over the next decade, marking a significant step in fighting climate change.",
    url: "https://example.com/news/2",
    publishedAt: "2024-01-19T08:15:00Z",
    source: "Environmental Weekly"
  },
  {
    id: "3",
    title: "New Medical Treatment Shows Promise for Cancer Patients",
    description: "Clinical trials of an innovative therapy have shown remarkable results, with 85% of patients experiencing significant improvement in their condition.",
    url: "https://example.com/news/3", 
    publishedAt: "2024-01-19T07:45:00Z",
    source: "Medical Journal"
  },
  {
    id: "4",
    title: "Space Mission Discovers Water on Distant Planet",
    description: "NASA's latest space probe has found evidence of liquid water on a planet 40 light-years away, raising new possibilities for extraterrestrial life.",
    url: "https://example.com/news/4",
    publishedAt: "2024-01-18T22:20:00Z",
    source: "Space Explorer"
  },
  {
    id: "5",
    title: "Economic Markets Show Strong Recovery Signs",
    description: "Global markets have posted their best quarterly performance in five years, with experts citing improved investor confidence and strong corporate earnings.",
    url: "https://example.com/news/5",
    publishedAt: "2024-01-18T16:30:00Z",
    source: "Financial Times"
  }
];

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const NewsFeed = () => {
  const handleReadMore = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Latest News</h1>
        <p className="text-muted-foreground">Stay updated with the latest headlines</p>
      </div>

      <div className="grid gap-6">
        {mockNews.map((item) => (
          <article key={item.id} className="news-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <h2 className="text-xl font-semibold text-foreground leading-tight hover:text-primary transition-colors cursor-pointer"
                    onClick={() => handleReadMore(item.url)}>
                  {item.title}
                </h2>
                
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(item.publishedAt)}
                    </span>
                    <span>{item.source}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReadMore(item.url)}
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

      {/* Load more button for future pagination */}
      <div className="text-center pt-6">
        <Button variant="outline" className="px-8">
          Load More News
        </Button>
      </div>
    </div>
  );
};

export default NewsFeed;
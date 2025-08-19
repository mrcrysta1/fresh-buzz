-- Create news_items table to store fetched news
CREATE TABLE public.news_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  summary TEXT,
  roman_summary TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_seen BOOLEAN NOT NULL DEFAULT false
);

-- Create index for efficient querying
CREATE INDEX idx_news_items_created_at ON public.news_items(created_at DESC);
CREATE INDEX idx_news_items_is_seen ON public.news_items(is_seen);

-- Enable RLS (though this will be public data)
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (no login required)
CREATE POLICY "Anyone can view news items" 
ON public.news_items 
FOR SELECT 
USING (true);

-- Create function to fetch latest news (will be called by edge function)
CREATE OR REPLACE FUNCTION public.get_latest_news(limit_count integer DEFAULT 20)
RETURNS TABLE(
  id text,
  title text,
  link text,
  summary text,
  roman_summary text,
  source text,
  created_at timestamptz,
  is_seen boolean
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.link,
    n.summary,
    n.roman_summary,
    n.source,
    n.created_at,
    n.is_seen
  FROM public.news_items n
  ORDER BY n.created_at DESC
  LIMIT limit_count;
END;
$$;
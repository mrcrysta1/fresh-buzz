import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface NewsItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  source: string;
}

// Hash function to generate unique IDs
function hashId(text: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16);
  });
}

async function generateHashId(text: string): Promise<string> {
  return await hashId(text);
}

// AI Summarization in Roman Urdu
async function aiSummarizeRoman(text: string, title: string): Promise<string> {
  if (!openAIApiKey) {
    return `${title.substring(0, 60)} — ye important update hai, details link me dekh lo.`;
  }

  const prompt = `
Summarize the following news for a Pakistani audience in 2 short lines **in Roman Urdu**, very simple and casual.
Keep only the key fact (who/what) + action (ban/warning/job/report) + when (if present) + what to do (avoid/join/apply).
No formal Urdu script; ONLY Roman Urdu.
Return max ~35 words total.

Title: ${title}
Text: ${text}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 120,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.strip();
  } catch (error) {
    console.error('AI summarization failed:', error);
    return `${title.substring(0, 60)} — ye important update hai, details link me dekh lo.`;
  }
}

// Fetch RSS feeds
async function fetchRSS(url: string, sourceName: string): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (AlertsBot; +https://example.com)'
      }
    });
    
    const xmlText = await response.text();
    
    // Simple XML parsing for RSS
    const titleMatches = xmlText.match(/<title[^>]*>([^<]+)<\/title>/gi) || [];
    const linkMatches = xmlText.match(/<link[^>]*>([^<]+)<\/link>/gi) || [];
    const descMatches = xmlText.match(/<description[^>]*>([^<]+)<\/description>/gi) || [];
    
    // Skip first title/link (usually feed title)
    for (let i = 1; i < Math.min(titleMatches.length, 21); i++) {
      const title = titleMatches[i]?.replace(/<[^>]+>/g, '').trim() || '';
      const link = linkMatches[i]?.replace(/<[^>]+>/g, '').trim() || '';
      const summary = descMatches[i-1]?.replace(/<[^>]+>/g, '').trim() || '';
      
      if (title && link) {
        const id = await generateHashId(title + '|' + link);
        items.push({
          id,
          title,
          link,
          summary,
          source: sourceName
        });
      }
    }
  } catch (error) {
    console.error(`RSS fetch failed for ${url}:`, error);
  }
  
  return items;
}

// Fetch SECP press releases
async function fetchSECPPress(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  const url = "https://www.secp.gov.pk/media-center/press-releases/";
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (AlertsBot; +https://example.com)'
      }
    });
    
    const html = await response.text();
    
    // Simple HTML parsing for SECP links
    const linkRegex = /<a[^>]*href=["']([^"']*press[^"']*)["'][^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null && items.length < 10) {
      let link = match[1];
      const title = match[2].trim();
      
      if (link.startsWith('/')) {
        link = 'https://www.secp.gov.pk' + link;
      }
      
      const id = await generateHashId(title + '|' + link);
      items.push({
        id,
        title,
        link,
        summary: '',
        source: 'SECP'
      });
    }
  } catch (error) {
    console.error('SECP fetch failed:', error);
  }
  
  return items;
}

// Main collection function
async function collectItems(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];
  
  // RSS sources
  const sources = [
    { url: "https://www.dawn.com/business/rss.xml", name: "Dawn Business" },
    { url: "https://www.thenews.com.pk/rss/1/1", name: "The News" },
    { url: "https://propakistani.pk/category/business/feed/", name: "ProPakistani" },
  ];
  
  // Fetch RSS feeds
  for (const source of sources) {
    const items = await fetchRSS(source.url, source.name);
    allItems.push(...items);
  }
  
  // Fetch SECP press releases
  const secpItems = await fetchSECPPress();
  allItems.push(...secpItems);
  
  // Remove duplicates by ID
  const uniqueItems = new Map();
  allItems.forEach(item => {
    uniqueItems.set(item.id, item);
  });
  
  return Array.from(uniqueItems.values());
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting news fetch process...');
    
    // Collect all news items
    const items = await collectItems();
    console.log(`Collected ${items.length} news items`);
    
    let newCount = 0;
    
    // Process each item
    for (const item of items) {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('news_items')
        .select('id')
        .eq('id', item.id)
        .single();
      
      if (existing) {
        console.log(`Skipping existing item: ${item.title}`);
        continue;
      }
      
      // Generate AI summary in Roman Urdu
      const textForAI = item.summary || item.title;
      const romanSummary = await aiSummarizeRoman(textForAI, item.title);
      
      // Insert new item
      const { error } = await supabase
        .from('news_items')
        .insert({
          id: item.id,
          title: item.title,
          link: item.link,
          summary: item.summary,
          roman_summary: romanSummary,
          source: item.source,
        });
      
      if (error) {
        console.error('Error inserting news item:', error);
      } else {
        console.log(`Inserted new item: ${item.title}`);
        newCount++;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      totalItems: items.length, 
      newItems: newCount,
      message: `Processed ${items.length} items, ${newCount} new items added`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
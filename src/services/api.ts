export interface Track {
  _id: string;
  title: string;
  slug: string;
  artist: string;
  coverArtUrl: string;
  trackFileUrl: string;
  genre?: string;
  isQuote?: boolean;
}

export interface Quote {
  _id: string;
  quotes: string;
  slug: string;
  author: string;
  genre: string;
  coverArtUrl: string;
  quoteFileUrl: string;
}

export interface SanityResponse {
  result: Track[];
}

export async function fetchTracks(): Promise<Track[]> {
  const API_URL = "https://somecodes.api.sanity.io/v2026-02-28/data/query/production?query=*%5B_type+%3D%3D+%22track%22%5D+%7B%0A++_id%2C%0A++title%2C%0A++%22slug%22%3A+slug.current%2C%0A++artist%2C%0A++%22coverArtUrl%22%3A+coverArt.asset-%3Eurl%2C%0A++%22trackFileUrl%22%3A+trackFile.asset-%3Eurl%2C%0A++genre%0A%7D&perspective=drafts";
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch tracks: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Handle both direct array and Sanity { result: ... } wrapper
    if (Array.isArray(data)) {
      return data;
    } else if (data.result && Array.isArray(data.result)) {
      return data.result;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return [];
  }
}

export async function fetchQuotes(): Promise<Quote[]> {
  const API_URL = "https://somecodes.api.sanity.io/v2026-02-28/data/query/production?query=*%5B_type+%3D%3D+%22quotes%22%5D+%7B%0A++_id%2C%0A++quotes%2C%0A++%22slug%22%3A+slug.current%2C%0A++author%2C%0A++genre%2C%0A++%22coverArtUrl%22%3A+coverArt.asset-%3Eurl%2C%0A++%22quoteFileUrl%22%3A+QuoteFile.asset-%3Eurl%0A%7D&perspective=drafts";

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch quotes: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    } else if (data.result && Array.isArray(data.result)) {
      return data.result;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

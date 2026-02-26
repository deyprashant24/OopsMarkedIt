const axios = require('axios');
const cheerio = require('cheerio');

const scrapeMetadata = async (url) => {
  try {
    // 1. Fetch HTML content of the URL
    // Fake User-Agent aur extra headers bhejna zaroori hai taaki websites (jaise Claude) block na karein
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000, // 10 seconds wait karenge heavy sites ke liye
    });

    // 2. Load HTML into Cheerio
    const $ = cheerio.load(data);

    // Helper: Agar URL relative hai (jaise '/images/banner.png'), toh absolute banayenge
    const getAbsoluteUrl = (link) => {
      if (!link) return null;
      if (link.startsWith('http')) return link;
      try {
        return new URL(link, url).href;
      } catch (e) {
        return null;
      }
    };

    // Helper function to get meta tags securely (checks OG, Twitter, and standard tags)
    const getMetaTag = (name) => 
      $(`meta[property="${name}"]`).attr('content') || 
      $(`meta[name="${name}"]`).attr('content') || 
      $(`meta[name="twitter:${name.replace('og:', '')}"]`).attr('content') ||
      $(`meta[itemprop="${name.replace('og:', '')}"]`).attr('content');

    // 3. Extract Data (Priority: OpenGraph -> Standard Meta -> Fallback)
    const title = getMetaTag('og:title') || $('title').text() || new URL(url).hostname;
    const description = getMetaTag('og:description') || getMetaTag('description') || '';
    
    // Extract Image and convert to absolute URL
    let imageUrl = getMetaTag('og:image') || getMetaTag('image') || $('link[rel="image_src"]').attr('href') || '';
    imageUrl = getAbsoluteUrl(imageUrl);
    
    // Extract Favicon
    let favicon = $('link[rel="icon"]').attr('href') || 
                  $('link[rel="shortcut icon"]').attr('href') ||
                  $('link[rel="apple-touch-icon"]').attr('href');
    
    if (favicon) {
      favicon = getAbsoluteUrl(favicon);
    } else {
      // Fallback: Default Google favicon grabber
      const urlObj = new URL(url);
      favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    }

    // Extract raw domain (e.g., github.com)
    const domain = new URL(url).hostname.replace('www.', '');

    return { 
      title: title.trim(), 
      description: description.trim(), 
      imageUrl: imageUrl || '', 
      favicon: favicon, 
      domain: domain 
    };

  } catch (error) {
    console.error(`⚠️ Scraper Error for ${url}:`, error.message);
    
    // Agar scraping fail ho jaye (jaise Cloudflare block kar de), toh app crash hone se bachayein
    let fallbackDomain = '';
    try {
      fallbackDomain = new URL(url).hostname.replace('www.', '');
    } catch(e) {
      fallbackDomain = 'Unknown Link';
    }

    return {
      title: fallbackDomain,
      description: 'Site protected or unavailable: Automated description extraction blocked.',
      imageUrl: '',
      favicon: `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=128`,
      domain: fallbackDomain
    };
  }
};

module.exports = scrapeMetadata;
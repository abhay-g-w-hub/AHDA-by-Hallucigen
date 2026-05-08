const axios = require('axios');
const { search } = require('duck-duck-scrape');

async function retrieveEvidence(query) {
  const evidence = [];

  const fetchWiki = async () => {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const wikiRes = await axios.get(wikiUrl, { headers: { 'User-Agent': 'AHDA-Prototype/1.0' } });
    if (wikiRes.data.query?.search?.length > 0) {
      for (let i = 0; i < Math.min(3, wikiRes.data.query.search.length); i++) {
        evidence.push({
          source: `Wikipedia: ${wikiRes.data.query.search[i].title}`,
          text: wikiRes.data.query.search[i].snippet.replace(/<\/?[^>]+(>|$)/g, "")
        });
      }
    }
  };

  const fetchCrossref = async () => {
    try {
      const crossrefUrl = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&select=title,abstract&rows=1`;
      const crossrefRes = await axios.get(crossrefUrl);
      if (crossrefRes.data.message?.items?.length > 0) {
        const item = crossrefRes.data.message.items[0];
        if (item.abstract) {
           evidence.push({
             source: `Academic Paper: ${item.title?.[0] || 'Unknown Title'}`,
             text: item.abstract.replace(/<\/?[^>]+(>|$)/g, "")
           });
        }
      }
    } catch (e) {
      console.error("Crossref API error:", e.message);
    }
  };

  const fetchDdg = async () => {
    try {
      const [ddgResults, ddgFactCheck] = await Promise.all([
        search(query, { safeSearch: "off" }).catch(() => null),
        search(`fact check myth truth ${query}`, { safeSearch: "off" }).catch(() => null)
      ]);
      
      const combinedDdg = [...(ddgResults?.results || []), ...(ddgFactCheck?.results || [])];
      
      if (combinedDdg.length > 0) {
        const addedUrls = new Set();
        let addedCount = 0;
        for (const res of combinedDdg) {
          if (!addedUrls.has(res.url) && addedCount < 4) {
            addedUrls.add(res.url);
            evidence.push({
              source: `Web: ${res.title}`,
              text: res.description
            });
            addedCount++;
          }
        }
      }
    } catch (e) {
      console.error("DuckDuckGo scrape error:", e.message);
    }
  };

  try {
    // Run all fetches concurrently to minimize time taken
    await Promise.allSettled([fetchWiki(), fetchCrossref(), fetchDdg()]);
    return evidence;
  } catch (error) {
    console.error(`Error retrieving evidence for "${query}":`, error);
    return evidence;
  }
}

module.exports = { retrieveEvidence };

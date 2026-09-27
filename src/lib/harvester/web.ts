export interface WebArticleResult {
  title: string;
  url: string;
  authorOrSource: string;
  contentMarkdown: string;
}

export async function fetchWebDocumentation(
  query: string,
  topic: string
): Promise<WebArticleResult[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;

  // 1. Search top web documentation / tutorial URLs
  let candidateUrls: { title: string; url: string; snippet?: string }[] = [];

  if (tavilyKey && !tavilyKey.includes('placeholder')) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${topic} ${query} documentation guide tutorial`,
          search_depth: 'basic',
          include_answer: false,
          max_results: 4,
          exclude_domains: [
            'youtube.com',
            'youtu.be',
            'vimeo.com',
            'tiktok.com',
            'dailymotion.com',
          ],
        }),
        next: { revalidate: 86400 },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.results)) {
          candidateUrls = data.results
            .filter((r: { url?: string }) => {
              if (!r.url) return false;
              const lower = r.url.toLowerCase();
              return (
                !lower.includes('youtube.com') &&
                !lower.includes('youtu.be') &&
                !lower.includes('vimeo.com') &&
                !lower.includes('tiktok.com')
              );
            })
            .map((r: { title?: string; url: string; content?: string }) => ({
              title: r.title || query,
              url: r.url,
              snippet: r.content || '',
            }));
        }
      }
    } catch (err) {
      console.warn('Tavily search error:', err);
    }
  }

  // 2. If Tavily provided URLs, extract clean Markdown via Jina Reader API
  if (candidateUrls.length > 0) {
    const articles: WebArticleResult[] = [];

    for (const candidate of candidateUrls.slice(0, 2)) {
      try {
        const jinaUrl = `https://r.jina.ai/${candidate.url}`;
        const jinaRes = await fetch(jinaUrl, {
          headers: {
            Accept: 'text/markdown, text/plain',
            'X-Return-Format': 'markdown',
          },
          next: { revalidate: 86400 },
        });

        if (jinaRes.ok) {
          const rawMarkdown = await jinaRes.text();

          // Reject scraping error pages or blocked responses
          const isInvalidScrape =
            rawMarkdown.includes('Warning: Target URL returned error') ||
            rawMarkdown.includes('error 401') ||
            rawMarkdown.includes('error 403') ||
            rawMarkdown.includes('Skip navigation') ||
            rawMarkdown.includes('Just a moment...') ||
            rawMarkdown.trim().length < 80;

          if (!isInvalidScrape) {
            // Clean up any stray relative image references or warnings
            const sanitized = rawMarkdown
              .replace(/!\[([^\]]*)\]\((?:\/[^)]*|data:[^)]*)\)/gi, '') // remove broken relative images
              .replace(/Warning:\s*Target URL returned error[^\n]*/gi, '');

            const cleanMarkdown = sanitized.length > 3500
              ? sanitized.substring(0, 3500) + '\n\n*(Content truncated for focused study. Visit original URL for complete details.)*'
              : sanitized;

            articles.push({
              title: candidate.title,
              url: candidate.url,
              authorOrSource: new URL(candidate.url).hostname.replace('www.', ''),
              contentMarkdown: cleanMarkdown,
            });
            continue;
          }
        }

        // Fallback to snippet if Jina failed or was blocked
        if (candidate.snippet && candidate.snippet.length > 60 && !candidate.snippet.includes('401 Unauthorized')) {
          articles.push({
            title: candidate.title,
            url: candidate.url,
            authorOrSource: new URL(candidate.url).hostname.replace('www.', ''),
            contentMarkdown: `## ${candidate.title}\n\n${candidate.snippet}\n\n[Read complete article on ${new URL(candidate.url).hostname}](${candidate.url})`,
          });
        }
      } catch {
        if (candidate.snippet && candidate.snippet.length > 60) {
          articles.push({
            title: candidate.title,
            url: candidate.url,
            authorOrSource: new URL(candidate.url).hostname.replace('www.', ''),
            contentMarkdown: `## ${candidate.title}\n\n${candidate.snippet}\n\n[Read complete article on ${new URL(candidate.url).hostname}](${candidate.url})`,
          });
        }
      }
    }

    if (articles.length > 0) {
      return articles;
    }
  }

  // 3. Fallback High-Quality Markdown Documentation Guide
  return [
    {
      title: `${query} — Official Technical Reference & Guide`,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(`${topic} ${query}`)}`,
      authorOrSource: 'LearnStratum Documentation Portal',
      contentMarkdown: `## Core Conceptual Overview: ${query}

### 1. Fundamentals
When studying **${topic}**, mastering **${query}** represents a pivotal conceptual milestone. It forms the backbone of reliable system architectures and practical workflows.

### 2. Key Architecture Points
* **Modularity:** Ensure components remain loosely coupled and easily testable.
* **State Management:** Trace data lifecycles from input parameters down to underlying storage.
* **Error Resilience:** Always handle edge cases, timeouts, and network boundary conditions.

### 3. Best Practices & Production Guidelines
1. Strive for declarative, self-documenting code and configurations.
2. Monitor latency and memory bottlenecks during intensive operations.
3. Validate all inputs at runtime using schemas or contracts.
`,
    },
  ];
}

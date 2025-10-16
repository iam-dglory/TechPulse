# Company Data Scraper

A comprehensive Python web scraper that collects company data from multiple sources including SEC EDGAR filings, news articles, and employee reviews.

## Features

- **SEC EDGAR Scraping**: Extracts financial data from 10-K, 10-Q, and other SEC filings
- **News Article Collection**: Scrapes company-related news from Google News API
- **Employee Reviews**: Collects reviews from Glassdoor (limited due to anti-bot measures)
- **Data Validation**: Uses Pydantic models for data quality assurance
- **Rate Limiting**: Implements proper rate limiting for all sources
- **Async Performance**: Uses async/await for high-performance concurrent scraping
- **PostgreSQL Storage**: Stores all data in a properly structured PostgreSQL database
- **Monitoring**: Comprehensive logging and metrics collection
- **Error Handling**: Robust error handling and retry mechanisms

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd data_collection
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database**:

   ```bash
   # Create database
   createdb company_data

   # Or using psql
   psql -U postgres -c "CREATE DATABASE company_data;"
   ```

4. **Configure environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

## Configuration

### Required Environment Variables

- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name (default: company_data)
- `DB_USER`: Database username (default: postgres)
- `DB_PASSWORD`: Database password
- `GOOGLE_NEWS_API_KEY`: Google News API key (optional)
- `SEC_EDGAR_USER_AGENT`: User agent for SEC EDGAR requests

### Optional Configuration

- Rate limiting settings
- Logging configuration
- Scraping parameters

## Usage

### Basic Usage

```python
import asyncio
from scraper import CompanyDataScraper

async def main():
    companies = [
        {
            'name': 'Apple Inc.',
            'cik': '0000320193',
            'ticker': 'AAPL',
            'industry': 'Technology',
            'sector': 'Consumer Electronics'
        }
    ]

    async with CompanyDataScraper() as scraper:
        results = await scraper.scrape_multiple_companies(companies)
        print(f"Scraped data for {len(results)} companies")

if __name__ == "__main__":
    asyncio.run(main())
```

### Command Line Usage

```bash
python scraper.py
```

## Database Schema

The scraper creates the following tables:

### Companies Table

- `id`: Primary key
- `company_name`: Company name
- `cik`: SEC Central Index Key
- `ticker`: Stock ticker symbol
- `industry`: Industry classification
- `sector`: Sector classification
- `created_at`, `updated_at`: Timestamps

### Financial Metrics Table

- `id`: Primary key
- `company_cik`: Foreign key to companies table
- `revenue`: Total revenue
- `net_income`: Net income
- `total_debt`: Total debt
- `cash_flow`: Operating cash flow
- `assets`: Total assets
- `liabilities`: Total liabilities
- `equity`: Stockholders' equity
- `filing_date`: SEC filing date
- `period_end_date`: Financial period end date

### News Articles Table

- `id`: Primary key
- `company_name`: Company name
- `title`: Article title
- `url`: Article URL
- `published_date`: Publication date
- `source`: News source
- `content`: Article content
- `sentiment_score`: Sentiment analysis score (-1 to 1)

### Employee Reviews Table

- `id`: Primary key
- `company_name`: Company name
- `rating`: Overall rating (1-5)
- `review_text`: Review content
- `job_title`: Job title of reviewer
- `location`: Reviewer location
- `review_date`: Review date
- `pros`, `cons`: Pros and cons sections
- Various rating categories (work-life balance, culture, etc.)

## API Keys Setup

### Google News API

1. Go to [News API](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key
4. Set `GOOGLE_NEWS_API_KEY` in your environment

### SEC EDGAR

1. Set `SEC_EDGAR_USER_AGENT` to identify your application
2. Format: "Your Company Name your-email@example.com"

## Rate Limiting

The scraper implements rate limiting for different sources:

- **SEC EDGAR**: 10 requests per second
- **Google News**: 100 requests per day (API limit)
- **Glassdoor**: 1 request per 5 seconds
- **General**: 2 requests per second

## Error Handling

The scraper includes comprehensive error handling:

- Network timeouts and connection errors
- Rate limit handling with automatic backoff
- Data validation errors
- Database connection issues
- Graceful shutdown on interruption

## Monitoring

The scraper provides detailed monitoring:

- Request success/failure rates
- Rate limit hits
- Data points collected
- Runtime metrics
- Performance statistics

## Limitations

### Glassdoor Scraping

Glassdoor has strong anti-bot measures, so the scraper has limited functionality for collecting employee reviews. Consider using official APIs or alternative data sources.

### SEC EDGAR

- Some filings may not be in machine-readable format
- Financial data extraction depends on consistent formatting
- XBRL data is preferred but not always available

### News API

- Google News API has daily limits
- Some articles may require subscription access
- Content extraction may be limited by paywalls

## Legal Considerations

- Respect robots.txt files
- Follow terms of service for all sources
- Implement appropriate rate limiting
- Consider data privacy regulations
- Use data responsibly and ethically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

1. Check the logs in `data_collection/scraper.log`
2. Verify your configuration
3. Check API key validity
4. Ensure database connectivity
5. Review rate limiting settings

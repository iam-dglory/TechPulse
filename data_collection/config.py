"""
Configuration settings for the company data scraper
"""

import os
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class DatabaseConfig:
    """Database configuration"""
    host: str = os.getenv('DB_HOST', 'localhost')
    port: int = int(os.getenv('DB_PORT', '5432'))
    database: str = os.getenv('DB_NAME', 'company_data')
    user: str = os.getenv('DB_USER', 'postgres')
    password: str = os.getenv('DB_PASSWORD', 'password')
    pool_size: int = int(os.getenv('DB_POOL_SIZE', '20'))
    max_overflow: int = int(os.getenv('DB_MAX_OVERFLOW', '30'))

@dataclass
class APIConfig:
    """API configuration"""
    google_news_api_key: str = os.getenv('GOOGLE_NEWS_API_KEY', '')
    sec_edgar_user_agent: str = os.getenv('SEC_EDGAR_USER_AGENT', 'Your Company Name your-email@example.com')
    
@dataclass
class RateLimitConfig:
    """Rate limiting configuration"""
    sec_edgar: float = float(os.getenv('SEC_EDGAR_RATE_LIMIT', '10'))  # requests per second
    google_news: int = int(os.getenv('GOOGLE_NEWS_RATE_LIMIT', '100'))  # requests per day
    glassdoor: float = float(os.getenv('GLASSDOOR_RATE_LIMIT', '0.2'))  # requests per second (1 per 5 seconds)
    general: float = float(os.getenv('GENERAL_RATE_LIMIT', '2'))  # requests per second

@dataclass
class ScrapingConfig:
    """Scraping configuration"""
    max_concurrent_requests: int = int(os.getenv('MAX_CONCURRENT_REQUESTS', '3'))
    request_timeout: int = int(os.getenv('REQUEST_TIMEOUT', '30'))
    max_retries: int = int(os.getenv('MAX_RETRIES', '3'))
    retry_delay: float = float(os.getenv('RETRY_DELAY', '1.0'))
    news_days_back: int = int(os.getenv('NEWS_DAYS_BACK', '30'))
    max_filings_per_company: int = int(os.getenv('MAX_FILINGS_PER_COMPANY', '5'))

@dataclass
class LoggingConfig:
    """Logging configuration"""
    level: str = os.getenv('LOG_LEVEL', 'INFO')
    log_file: str = os.getenv('LOG_FILE', 'data_collection/scraper.log')
    max_log_size: int = int(os.getenv('MAX_LOG_SIZE', '10485760'))  # 10MB
    backup_count: int = int(os.getenv('LOG_BACKUP_COUNT', '5'))

# Default company list for testing
DEFAULT_COMPANIES = [
    {
        'name': 'Apple Inc.',
        'cik': '0000320193',
        'ticker': 'AAPL',
        'industry': 'Technology',
        'sector': 'Consumer Electronics'
    },
    {
        'name': 'Microsoft Corporation',
        'cik': '0000789019',
        'ticker': 'MSFT',
        'industry': 'Technology',
        'sector': 'Software'
    },
    {
        'name': 'Amazon.com Inc.',
        'cik': '0001018724',
        'ticker': 'AMZN',
        'industry': 'Technology',
        'sector': 'E-commerce'
    },
    {
        'name': 'Alphabet Inc.',
        'cik': '0001652044',
        'ticker': 'GOOGL',
        'industry': 'Technology',
        'sector': 'Internet Services'
    },
    {
        'name': 'Tesla Inc.',
        'cik': '0001318605',
        'ticker': 'TSLA',
        'industry': 'Automotive',
        'sector': 'Electric Vehicles'
    }
]

# SEC EDGAR form types to scrape
SEC_FORM_TYPES = ['10-K', '10-Q', '8-K', 'DEF 14A']

# Financial metrics to extract
FINANCIAL_METRICS = [
    'revenue',
    'net_income',
    'total_debt',
    'cash_flow',
    'assets',
    'liabilities',
    'equity',
    'gross_profit',
    'operating_income',
    'ebitda'
]

# News sources to prioritize
PRIORITY_NEWS_SOURCES = [
    'Reuters',
    'Bloomberg',
    'Wall Street Journal',
    'Financial Times',
    'CNBC',
    'MarketWatch',
    'Yahoo Finance',
    'Seeking Alpha'
]

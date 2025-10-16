#!/usr/bin/env python3
"""
Comprehensive Web Scraper for Company Data Collection
Scrapes SEC EDGAR filings, news articles, and employee reviews
"""

import asyncio
import aiohttp
import asyncpg
import logging
import time
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlparse
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy.utils.log import configure_logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import pandas as pd
from pydantic import BaseModel, validator, Field
import psycopg2
from psycopg2.extras import RealDictCursor
import schedule
import signal
import sys
from contextlib import asynccontextmanager
import hashlib
import os
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_collection/scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Rate limiting configuration
RATE_LIMITS = {
    'sec_edgar': 10,  # requests per second
    'google_news': 100,  # requests per day (API limit)
    'glassdoor': 1,  # requests per 5 seconds
    'general': 2  # requests per second for other sites
}

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', 5432),
    'database': os.getenv('DB_NAME', 'company_data'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password')
}

# API Keys (should be set as environment variables)
GOOGLE_NEWS_API_KEY = os.getenv('GOOGLE_NEWS_API_KEY')
SEC_EDGAR_USER_AGENT = os.getenv('SEC_EDGAR_USER_AGENT', 'Your Company Name your-email@example.com')

@dataclass
class RateLimiter:
    """Rate limiter for different services"""
    def __init__(self, requests_per_second: float):
        self.requests_per_second = requests_per_second
        self.last_request_time = 0.0
    
    async def wait_if_needed(self):
        """Wait if necessary to respect rate limits"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        min_interval = 1.0 / self.requests_per_second
        
        if time_since_last < min_interval:
            sleep_time = min_interval - time_since_last
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()

# Rate limiters for different services
rate_limiters = {
    'sec_edgar': RateLimiter(RATE_LIMITS['sec_edgar']),
    'google_news': RateLimiter(RATE_LIMITS['google_news'] / 86400),  # Convert daily to per second
    'glassdoor': RateLimiter(RATE_LIMITS['glassdoor'] / 5),  # 1 request per 5 seconds
    'general': RateLimiter(RATE_LIMITS['general'])
}

# Data validation models using Pydantic
class FinancialMetrics(BaseModel):
    """Financial metrics validation model"""
    revenue: Optional[float] = Field(None, ge=0)
    net_income: Optional[float] = None
    total_debt: Optional[float] = Field(None, ge=0)
    cash_flow: Optional[float] = None
    assets: Optional[float] = Field(None, ge=0)
    liabilities: Optional[float] = Field(None, ge=0)
    equity: Optional[float] = None
    filing_date: datetime
    period_end_date: datetime
    company_cik: str = Field(..., min_length=10, max_length=10)
    
    @validator('company_cik')
    def validate_cik(cls, v):
        if not v.isdigit():
            raise ValueError('CIK must be numeric')
        return v.zfill(10)

class NewsArticle(BaseModel):
    """News article validation model"""
    title: str = Field(..., min_length=1, max_length=500)
    url: str = Field(..., regex=r'^https?://')
    published_date: datetime
    source: str = Field(..., min_length=1, max_length=100)
    content: Optional[str] = None
    company_name: str = Field(..., min_length=1, max_length=200)
    sentiment_score: Optional[float] = Field(None, ge=-1, le=1)
    
    @validator('url')
    def validate_url(cls, v):
        parsed = urlparse(v)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError('Invalid URL format')
        return v

class EmployeeReview(BaseModel):
    """Employee review validation model"""
    company_name: str = Field(..., min_length=1, max_length=200)
    rating: float = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    job_title: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=100)
    review_date: Optional[datetime] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    work_life_balance: Optional[float] = Field(None, ge=1, le=5)
    culture_values: Optional[float] = Field(None, ge=1, le=5)
    career_opportunities: Optional[float] = Field(None, ge=1, le=5)
    compensation_benefits: Optional[float] = Field(None, ge=1, le=5)
    senior_management: Optional[float] = Field(None, ge=1, le=5)

class CompanyData(BaseModel):
    """Complete company data validation model"""
    company_name: str = Field(..., min_length=1, max_length=200)
    cik: str = Field(..., min_length=10, max_length=10)
    ticker: Optional[str] = Field(None, max_length=10)
    industry: Optional[str] = Field(None, max_length=100)
    sector: Optional[str] = Field(None, max_length=100)
    financial_metrics: List[FinancialMetrics] = []
    news_articles: List[NewsArticle] = []
    employee_reviews: List[EmployeeReview] = []
    last_updated: datetime = Field(default_factory=datetime.now)

class DatabaseManager:
    """Database operations manager"""
    
    def __init__(self):
        self.connection = None
        self.pool = None
    
    async def create_pool(self):
        """Create async connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                host=DB_CONFIG['host'],
                port=DB_CONFIG['port'],
                database=DB_CONFIG['database'],
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                min_size=5,
                max_size=20
            )
            logger.info("Database connection pool created successfully")
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise
    
    async def close_pool(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    async def create_tables(self):
        """Create database tables if they don't exist"""
        create_tables_sql = """
        -- Companies table
        CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(200) NOT NULL,
            cik VARCHAR(10) UNIQUE NOT NULL,
            ticker VARCHAR(10),
            industry VARCHAR(100),
            sector VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Financial metrics table
        CREATE TABLE IF NOT EXISTS financial_metrics (
            id SERIAL PRIMARY KEY,
            company_cik VARCHAR(10) REFERENCES companies(cik),
            revenue DECIMAL(15,2),
            net_income DECIMAL(15,2),
            total_debt DECIMAL(15,2),
            cash_flow DECIMAL(15,2),
            assets DECIMAL(15,2),
            liabilities DECIMAL(15,2),
            equity DECIMAL(15,2),
            filing_date DATE NOT NULL,
            period_end_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(company_cik, filing_date, period_end_date)
        );
        
        -- News articles table
        CREATE TABLE IF NOT EXISTS news_articles (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(200) NOT NULL,
            title VARCHAR(500) NOT NULL,
            url TEXT UNIQUE NOT NULL,
            published_date TIMESTAMP NOT NULL,
            source VARCHAR(100) NOT NULL,
            content TEXT,
            sentiment_score DECIMAL(3,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Employee reviews table
        CREATE TABLE IF NOT EXISTS employee_reviews (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(200) NOT NULL,
            rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
            review_text TEXT,
            job_title VARCHAR(200),
            location VARCHAR(100),
            review_date DATE,
            pros TEXT,
            cons TEXT,
            work_life_balance DECIMAL(2,1) CHECK (work_life_balance >= 1 AND work_life_balance <= 5),
            culture_values DECIMAL(2,1) CHECK (culture_values >= 1 AND culture_values <= 5),
            career_opportunities DECIMAL(2,1) CHECK (career_opportunities >= 1 AND career_opportunities <= 5),
            compensation_benefits DECIMAL(2,1) CHECK (compensation_benefits >= 1 AND compensation_benefits <= 5),
            senior_management DECIMAL(2,1) CHECK (senior_management >= 1 AND senior_management <= 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_companies_cik ON companies(cik);
        CREATE INDEX IF NOT EXISTS idx_financial_metrics_cik ON financial_metrics(company_cik);
        CREATE INDEX IF NOT EXISTS idx_news_articles_company ON news_articles(company_name);
        CREATE INDEX IF NOT EXISTS idx_employee_reviews_company ON employee_reviews(company_name);
        CREATE INDEX IF NOT EXISTS idx_news_articles_date ON news_articles(published_date);
        CREATE INDEX IF NOT EXISTS idx_financial_metrics_date ON financial_metrics(filing_date);
        """
        
        async with self.pool.acquire() as conn:
            await conn.execute(create_tables_sql)
            logger.info("Database tables created/verified successfully")
    
    async def save_company_data(self, company_data: CompanyData):
        """Save complete company data to database"""
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                # Save company info
                await conn.execute("""
                    INSERT INTO companies (company_name, cik, ticker, industry, sector, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (cik) DO UPDATE SET
                        company_name = EXCLUDED.company_name,
                        ticker = EXCLUDED.ticker,
                        industry = EXCLUDED.industry,
                        sector = EXCLUDED.sector,
                        updated_at = EXCLUDED.updated_at
                """, company_data.company_name, company_data.cik, company_data.ticker,
                    company_data.industry, company_data.sector, company_data.last_updated)
                
                # Save financial metrics
                for metric in company_data.financial_metrics:
                    await conn.execute("""
                        INSERT INTO financial_metrics 
                        (company_cik, revenue, net_income, total_debt, cash_flow, assets, 
                         liabilities, equity, filing_date, period_end_date)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        ON CONFLICT (company_cik, filing_date, period_end_date) DO UPDATE SET
                            revenue = EXCLUDED.revenue,
                            net_income = EXCLUDED.net_income,
                            total_debt = EXCLUDED.total_debt,
                            cash_flow = EXCLUDED.cash_flow,
                            assets = EXCLUDED.assets,
                            liabilities = EXCLUDED.liabilities,
                            equity = EXCLUDED.equity
                    """, metric.company_cik, metric.revenue, metric.net_income, metric.total_debt,
                        metric.cash_flow, metric.assets, metric.liabilities, metric.equity,
                        metric.filing_date, metric.period_end_date)
                
                # Save news articles
                for article in company_data.news_articles:
                    await conn.execute("""
                        INSERT INTO news_articles 
                        (company_name, title, url, published_date, source, content, sentiment_score)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (url) DO NOTHING
                    """, article.company_name, article.title, article.url, article.published_date,
                        article.source, article.content, article.sentiment_score)
                
                # Save employee reviews
                for review in company_data.employee_reviews:
                    await conn.execute("""
                        INSERT INTO employee_reviews 
                        (company_name, rating, review_text, job_title, location, review_date,
                         pros, cons, work_life_balance, culture_values, career_opportunities,
                         compensation_benefits, senior_management)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    """, review.company_name, review.rating, review.review_text, review.job_title,
                        review.location, review.review_date, review.pros, review.cons,
                        review.work_life_balance, review.culture_values, review.career_opportunities,
                        review.compensation_benefits, review.senior_management)
        
        logger.info(f"Saved data for company: {company_data.company_name}")

class SECEdgarScraper:
    """SEC EDGAR filings scraper"""
    
    def __init__(self, session: aiohttp.ClientSession):
        self.session = session
        self.base_url = "https://www.sec.gov"
        self.edgar_url = f"{self.base_url}/cgi-bin/browse-edgar"
        self.headers = {
            'User-Agent': SEC_EDGAR_USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
    
    async def get_company_filings(self, cik: str, form_types: List[str] = None) -> List[Dict]:
        """Get company filings from SEC EDGAR"""
        if form_types is None:
            form_types = ['10-K', '10-Q']
        
        await rate_limiters['sec_edgar'].wait_if_needed()
        
        params = {
            'action': 'getcompany',
            'CIK': cik,
            'type': ','.join(form_types),
            'count': '100',
            'output': 'atom'
        }
        
        try:
            async with self.session.get(
                self.edgar_url, 
                params=params, 
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    content = await response.text()
                    return self._parse_edgar_feed(content)
                else:
                    logger.warning(f"SEC EDGAR request failed with status {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching SEC EDGAR data for CIK {cik}: {e}")
            return []
    
    def _parse_edgar_feed(self, xml_content: str) -> List[Dict]:
        """Parse SEC EDGAR atom feed"""
        try:
            root = ET.fromstring(xml_content)
            filings = []
            
            for entry in root.findall('.//{http://www.w3.org/2005/Atom}entry'):
                filing = {
                    'title': entry.find('.//{http://www.w3.org/2005/Atom}title').text,
                    'link': entry.find('.//{http://www.w3.org/2005/Atom}link').get('href'),
                    'updated': entry.find('.//{http://www.w3.org/2005/Atom}updated').text,
                    'summary': entry.find('.//{http://www.w3.org/2005/Atom}summary').text
                }
                filings.append(filing)
            
            return filings
        except Exception as e:
            logger.error(f"Error parsing SEC EDGAR feed: {e}")
            return []
    
    async def get_filing_content(self, filing_url: str) -> str:
        """Get the content of a specific filing"""
        await rate_limiters['sec_edgar'].wait_if_needed()
        
        try:
            async with self.session.get(
                filing_url, 
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logger.warning(f"Failed to fetch filing content: {response.status}")
                    return ""
        except Exception as e:
            logger.error(f"Error fetching filing content: {e}")
            return ""
    
    def extract_financial_metrics(self, filing_content: str, filing_date: str) -> List[FinancialMetrics]:
        """Extract financial metrics from filing content"""
        metrics = []
        
        try:
            soup = BeautifulSoup(filing_content, 'html.parser')
            
            # Look for financial statements in XBRL or HTML format
            financial_data = self._extract_xbrl_data(soup)
            if not financial_data:
                financial_data = self._extract_html_financial_data(soup)
            
            if financial_data:
                # Parse filing date
                filing_dt = datetime.strptime(filing_date, '%Y-%m-%d')
                
                # Extract period end date from content
                period_end = self._extract_period_end_date(soup, filing_dt)
                
                metric = FinancialMetrics(
                    revenue=financial_data.get('revenue'),
                    net_income=financial_data.get('net_income'),
                    total_debt=financial_data.get('total_debt'),
                    cash_flow=financial_data.get('cash_flow'),
                    assets=financial_data.get('assets'),
                    liabilities=financial_data.get('liabilities'),
                    equity=financial_data.get('equity'),
                    filing_date=filing_dt,
                    period_end_date=period_end,
                    company_cik="0000000000"  # Will be set by caller
                )
                metrics.append(metric)
        
        except Exception as e:
            logger.error(f"Error extracting financial metrics: {e}")
        
        return metrics
    
    def _extract_xbrl_data(self, soup: BeautifulSoup) -> Dict:
        """Extract financial data from XBRL format"""
        financial_data = {}
        
        # Common XBRL tags for financial metrics
        xbrl_tags = {
            'revenue': ['Revenues', 'Revenue', 'TotalRevenue', 'NetSales'],
            'net_income': ['NetIncomeLoss', 'NetIncome', 'NetEarnings'],
            'total_debt': ['LongTermDebt', 'TotalDebt', 'Debt'],
            'cash_flow': ['NetCashProvidedByUsedInOperatingActivities', 'OperatingCashFlow'],
            'assets': ['Assets', 'TotalAssets'],
            'liabilities': ['Liabilities', 'TotalLiabilities'],
            'equity': ['StockholdersEquity', 'TotalEquity', 'Equity']
        }
        
        for metric, tags in xbrl_tags.items():
            for tag in tags:
                element = soup.find(text=re.compile(tag, re.IGNORECASE))
                if element:
                    # Try to find the numeric value
                    parent = element.parent
                    if parent:
                        value_text = parent.get_text()
                        value = self._extract_numeric_value(value_text)
                        if value is not None:
                            financial_data[metric] = value
                            break
        
        return financial_data
    
    def _extract_html_financial_data(self, soup: BeautifulSoup) -> Dict:
        """Extract financial data from HTML tables"""
        financial_data = {}
        
        # Look for financial statement tables
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    label = cells[0].get_text().strip().lower()
                    value_text = cells[1].get_text().strip()
                    value = self._extract_numeric_value(value_text)
                    
                    if value is not None:
                        if 'revenue' in label or 'sales' in label:
                            financial_data['revenue'] = value
                        elif 'net income' in label or 'net earnings' in label:
                            financial_data['net_income'] = value
                        elif 'debt' in label:
                            financial_data['total_debt'] = value
                        elif 'cash flow' in label:
                            financial_data['cash_flow'] = value
                        elif 'assets' in label:
                            financial_data['assets'] = value
                        elif 'liabilities' in label:
                            financial_data['liabilities'] = value
                        elif 'equity' in label:
                            financial_data['equity'] = value
        
        return financial_data
    
    def _extract_numeric_value(self, text: str) -> Optional[float]:
        """Extract numeric value from text"""
        # Remove common formatting
        text = re.sub(r'[,$\s]', '', text)
        text = re.sub(r'\(([^)]+)\)', r'-\1', text)  # Handle parentheses for negative values
        
        # Look for numbers with optional decimal places
        match = re.search(r'-?\d+(?:\.\d+)?', text)
        if match:
            try:
                return float(match.group())
            except ValueError:
                pass
        
        return None
    
    def _extract_period_end_date(self, soup: BeautifulSoup, filing_date: datetime) -> datetime:
        """Extract period end date from filing content"""
        # Look for period end date in various formats
        date_patterns = [
            r'period ended\s+(\w+\s+\d{1,2},\s+\d{4})',
            r'as of\s+(\w+\s+\d{1,2},\s+\d{4})',
            r'(\d{4}-\d{2}-\d{2})'
        ]
        
        text = soup.get_text()
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    date_str = match.group(1)
                    return datetime.strptime(date_str, '%B %d, %Y')
                except ValueError:
                    try:
                        return datetime.strptime(date_str, '%Y-%m-%d')
                    except ValueError:
                        continue
        
        # Default to filing date if no period end date found
        return filing_date

class GoogleNewsScraper:
    """Google News API scraper"""
    
    def __init__(self, session: aiohttp.ClientSession):
        self.session = session
        self.api_key = GOOGLE_NEWS_API_KEY
        self.base_url = "https://newsapi.org/v2"
    
    async def get_company_news(self, company_name: str, days_back: int = 30) -> List[NewsArticle]:
        """Get news articles about a company"""
        if not self.api_key:
            logger.warning("Google News API key not provided")
            return []
        
        await rate_limiters['google_news'].wait_if_needed()
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        params = {
            'q': f'"{company_name}"',
            'from': start_date.strftime('%Y-%m-%d'),
            'to': end_date.strftime('%Y-%m-%d'),
            'sortBy': 'publishedAt',
            'language': 'en',
            'pageSize': 100,
            'apiKey': self.api_key
        }
        
        try:
            async with self.session.get(
                f"{self.base_url}/everything",
                params=params,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_news_response(data, company_name)
                else:
                    logger.warning(f"Google News API request failed: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching news for {company_name}: {e}")
            return []
    
    def _parse_news_response(self, data: Dict, company_name: str) -> List[NewsArticle]:
        """Parse Google News API response"""
        articles = []
        
        try:
            for article_data in data.get('articles', []):
                try:
                    article = NewsArticle(
                        title=article_data.get('title', ''),
                        url=article_data.get('url', ''),
                        published_date=datetime.fromisoformat(
                            article_data.get('publishedAt', '').replace('Z', '+00:00')
                        ),
                        source=article_data.get('source', {}).get('name', ''),
                        content=article_data.get('content', ''),
                        company_name=company_name,
                        sentiment_score=self._calculate_sentiment(article_data.get('description', ''))
                    )
                    articles.append(article)
                except Exception as e:
                    logger.warning(f"Error parsing news article: {e}")
                    continue
        except Exception as e:
            logger.error(f"Error parsing news response: {e}")
        
        return articles
    
    def _calculate_sentiment(self, text: str) -> Optional[float]:
        """Simple sentiment analysis (can be replaced with more sophisticated model)"""
        if not text:
            return None
        
        # Simple keyword-based sentiment
        positive_words = ['good', 'great', 'excellent', 'positive', 'growth', 'profit', 'success']
        negative_words = ['bad', 'poor', 'negative', 'loss', 'decline', 'failure', 'crisis']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total_words = len(text.split())
        if total_words == 0:
            return None
        
        sentiment = (positive_count - negative_count) / total_words
        return max(-1, min(1, sentiment))  # Clamp between -1 and 1

class GlassdoorScraper:
    """Glassdoor reviews scraper (limited due to anti-bot measures)"""
    
    def __init__(self, session: aiohttp.ClientSession):
        self.session = session
        self.base_url = "https://www.glassdoor.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
    
    async def get_company_reviews(self, company_name: str) -> List[EmployeeReview]:
        """Get employee reviews for a company (limited functionality)"""
        # Note: Glassdoor has strong anti-bot measures
        # This is a simplified implementation that may not work reliably
        logger.warning("Glassdoor scraping is limited due to anti-bot measures")
        
        await rate_limiters['glassdoor'].wait_if_needed()
        
        # Search for company reviews page
        search_url = f"{self.base_url}/Reviews/{company_name.replace(' ', '-')}-Reviews"
        
        try:
            async with self.session.get(
                search_url,
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    content = await response.text()
                    return self._parse_reviews_page(content, company_name)
                else:
                    logger.warning(f"Glassdoor request failed: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching Glassdoor reviews: {e}")
            return []
    
    def _parse_reviews_page(self, content: str, company_name: str) -> List[EmployeeReview]:
        """Parse Glassdoor reviews page"""
        reviews = []
        
        try:
            soup = BeautifulSoup(content, 'html.parser')
            
            # Look for review elements (structure may change)
            review_elements = soup.find_all('div', class_=re.compile(r'review|Review'))
            
            for element in review_elements:
                try:
                    # Extract rating
                    rating_element = element.find('span', class_=re.compile(r'rating|Rating'))
                    rating = 3.0  # Default rating
                    if rating_element:
                        rating_text = rating_element.get_text()
                        rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                        if rating_match:
                            rating = float(rating_match.group(1))
                    
                    # Extract review text
                    review_text = ""
                    text_element = element.find('div', class_=re.compile(r'text|content|reviewText'))
                    if text_element:
                        review_text = text_element.get_text().strip()
                    
                    # Extract job title
                    job_title = ""
                    job_element = element.find('span', class_=re.compile(r'job|title|position'))
                    if job_element:
                        job_title = job_element.get_text().strip()
                    
                    # Extract location
                    location = ""
                    location_element = element.find('span', class_=re.compile(r'location|Location'))
                    if location_element:
                        location = location_element.get_text().strip()
                    
                    if review_text:  # Only add if we have review text
                        review = EmployeeReview(
                            company_name=company_name,
                            rating=rating,
                            review_text=review_text,
                            job_title=job_title if job_title else None,
                            location=location if location else None,
                            review_date=datetime.now().date()
                        )
                        reviews.append(review)
                
                except Exception as e:
                    logger.warning(f"Error parsing individual review: {e}")
                    continue
        
        except Exception as e:
            logger.error(f"Error parsing Glassdoor reviews page: {e}")
        
        return reviews

class CompanyDataScraper:
    """Main scraper class that coordinates all scraping activities"""
    
    def __init__(self):
        self.session = None
        self.db_manager = DatabaseManager()
        self.sec_scraper = None
        self.news_scraper = None
        self.glassdoor_scraper = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            connector=aiohttp.TCPConnector(limit=100, limit_per_host=30),
            timeout=aiohttp.ClientTimeout(total=300)
        )
        
        self.sec_scraper = SECEdgarScraper(self.session)
        self.news_scraper = GoogleNewsScraper(self.session)
        self.glassdoor_scraper = GlassdoorScraper(self.session)
        
        await self.db_manager.create_pool()
        await self.db_manager.create_tables()
        
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
        await self.db_manager.close_pool()
    
    async def scrape_company_data(self, company_name: str, cik: str, 
                                 ticker: str = None, industry: str = None, 
                                 sector: str = None) -> CompanyData:
        """Scrape comprehensive data for a company"""
        logger.info(f"Starting data collection for {company_name} (CIK: {cik})")
        
        company_data = CompanyData(
            company_name=company_name,
            cik=cik,
            ticker=ticker,
            industry=industry,
            sector=sector
        )
        
        try:
            # Scrape SEC EDGAR filings
            logger.info("Scraping SEC EDGAR filings...")
            filings = await self.sec_scraper.get_company_filings(cik)
            
            for filing in filings[:5]:  # Limit to 5 most recent filings
                filing_content = await self.sec_scraper.get_filing_content(filing['link'])
                if filing_content:
                    metrics = self.sec_scraper.extract_financial_metrics(
                        filing_content, filing['updated'][:10]
                    )
                    for metric in metrics:
                        metric.company_cik = cik
                    company_data.financial_metrics.extend(metrics)
            
            # Scrape news articles
            logger.info("Scraping news articles...")
            news_articles = await self.news_scraper.get_company_news(company_name)
            company_data.news_articles.extend(news_articles)
            
            # Scrape employee reviews (limited)
            logger.info("Scraping employee reviews...")
            reviews = await self.glassdoor_scraper.get_company_reviews(company_name)
            company_data.employee_reviews.extend(reviews)
            
            # Save to database
            await self.db_manager.save_company_data(company_data)
            
            logger.info(f"Successfully collected data for {company_name}")
            return company_data
            
        except Exception as e:
            logger.error(f"Error scraping data for {company_name}: {e}")
            raise
    
    async def scrape_multiple_companies(self, companies: List[Dict]) -> List[CompanyData]:
        """Scrape data for multiple companies concurrently"""
        tasks = []
        
        for company in companies:
            task = self.scrape_company_data(
                company_name=company['name'],
                cik=company['cik'],
                ticker=company.get('ticker'),
                industry=company.get('industry'),
                sector=company.get('sector')
            )
            tasks.append(task)
        
        # Limit concurrent requests to avoid overwhelming servers
        semaphore = asyncio.Semaphore(3)
        
        async def limited_scrape(task):
            async with semaphore:
                return await task
        
        results = await asyncio.gather(*[limited_scrape(task) for task in tasks], return_exceptions=True)
        
        # Filter out exceptions and log errors
        successful_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Failed to scrape company {companies[i]['name']}: {result}")
            else:
                successful_results.append(result)
        
        return successful_results

class MonitoringSystem:
    """Monitoring and alerting system"""
    
    def __init__(self):
        self.metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'rate_limit_hits': 0,
            'data_points_collected': 0,
            'start_time': time.time()
        }
    
    def record_request(self, success: bool):
        """Record a request attempt"""
        self.metrics['total_requests'] += 1
        if success:
            self.metrics['successful_requests'] += 1
        else:
            self.metrics['failed_requests'] += 1
    
    def record_rate_limit(self):
        """Record a rate limit hit"""
        self.metrics['rate_limit_hits'] += 1
    
    def record_data_points(self, count: int):
        """Record data points collected"""
        self.metrics['data_points_collected'] += count
    
    def get_metrics(self) -> Dict:
        """Get current metrics"""
        current_time = time.time()
        runtime = current_time - self.metrics['start_time']
        
        return {
            **self.metrics,
            'runtime_seconds': runtime,
            'requests_per_second': self.metrics['total_requests'] / runtime if runtime > 0 else 0,
            'success_rate': self.metrics['successful_requests'] / self.metrics['total_requests'] if self.metrics['total_requests'] > 0 else 0
        }
    
    def log_metrics(self):
        """Log current metrics"""
        metrics = self.get_metrics()
        logger.info(f"Monitoring Metrics: {json.dumps(metrics, indent=2)}")

# Example usage and main function
async def main():
    """Main function to demonstrate usage"""
    
    # Example companies to scrape
    companies = [
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
        }
    ]
    
    monitoring = MonitoringSystem()
    
    async with CompanyDataScraper() as scraper:
        try:
            # Scrape data for multiple companies
            results = await scraper.scrape_multiple_companies(companies)
            
            # Log results
            for result in results:
                logger.info(f"Collected {len(result.financial_metrics)} financial metrics, "
                           f"{len(result.news_articles)} news articles, "
                           f"{len(result.employee_reviews)} employee reviews for {result.company_name}")
            
            # Log monitoring metrics
            monitoring.log_metrics()
            
        except Exception as e:
            logger.error(f"Error in main scraping process: {e}")
            raise

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    logger.info("Received shutdown signal, cleaning up...")
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Run the scraper
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

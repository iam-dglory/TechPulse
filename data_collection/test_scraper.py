#!/usr/bin/env python3
"""
Test suite for the company data scraper
"""

import pytest
import asyncio
import aiohttp
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta
import json

from scraper import (
    CompanyDataScraper,
    SECEdgarScraper,
    GoogleNewsScraper,
    GlassdoorScraper,
    DatabaseManager,
    FinancialMetrics,
    NewsArticle,
    EmployeeReview,
    CompanyData,
    RateLimiter,
    MonitoringSystem
)
from config import DEFAULT_COMPANIES

class TestRateLimiter:
    """Test rate limiter functionality"""
    
    def test_rate_limiter_initialization(self):
        """Test rate limiter initialization"""
        limiter = RateLimiter(10.0)
        assert limiter.requests_per_second == 10.0
        assert limiter.last_request_time == 0.0
    
    @pytest.mark.asyncio
    async def test_rate_limiter_wait(self):
        """Test rate limiter wait functionality"""
        limiter = RateLimiter(10.0)  # 10 requests per second
        
        start_time = asyncio.get_event_loop().time()
        await limiter.wait_if_needed()
        await limiter.wait_if_needed()
        end_time = asyncio.get_event_loop().time()
        
        # Should have waited at least 0.1 seconds (1/10)
        assert end_time - start_time >= 0.1

class TestDataValidation:
    """Test data validation models"""
    
    def test_financial_metrics_validation(self):
        """Test financial metrics validation"""
        # Valid data
        metric = FinancialMetrics(
            revenue=1000000.0,
            net_income=100000.0,
            filing_date=datetime.now(),
            period_end_date=datetime.now(),
            company_cik="0000320193"
        )
        assert metric.revenue == 1000000.0
        assert metric.company_cik == "0000320193"
        
        # Invalid CIK
        with pytest.raises(ValueError):
            FinancialMetrics(
                filing_date=datetime.now(),
                period_end_date=datetime.now(),
                company_cik="invalid"
            )
    
    def test_news_article_validation(self):
        """Test news article validation"""
        # Valid article
        article = NewsArticle(
            title="Test Article",
            url="https://example.com/article",
            published_date=datetime.now(),
            source="Test Source",
            company_name="Test Company"
        )
        assert article.title == "Test Article"
        
        # Invalid URL
        with pytest.raises(ValueError):
            NewsArticle(
                title="Test Article",
                url="invalid-url",
                published_date=datetime.now(),
                source="Test Source",
                company_name="Test Company"
            )
    
    def test_employee_review_validation(self):
        """Test employee review validation"""
        # Valid review
        review = EmployeeReview(
            company_name="Test Company",
            rating=4.5
        )
        assert review.rating == 4.5
        
        # Invalid rating
        with pytest.raises(ValueError):
            EmployeeReview(
                company_name="Test Company",
                rating=6.0  # Invalid rating > 5
            )

class TestSECEdgarScraper:
    """Test SEC EDGAR scraper"""
    
    @pytest.fixture
    def mock_session(self):
        """Mock aiohttp session"""
        session = AsyncMock()
        return session
    
    @pytest.fixture
    def sec_scraper(self, mock_session):
        """Create SEC scraper with mock session"""
        return SECEdgarScraper(mock_session)
    
    def test_sec_scraper_initialization(self, sec_scraper):
        """Test SEC scraper initialization"""
        assert sec_scraper.base_url == "https://www.sec.gov"
        assert "User-Agent" in sec_scraper.headers
    
    def test_extract_numeric_value(self, sec_scraper):
        """Test numeric value extraction"""
        # Test various formats
        assert sec_scraper._extract_numeric_value("$1,000,000") == 1000000.0
        assert sec_scraper._extract_numeric_value("(500,000)") == -500000.0
        assert sec_scraper._extract_numeric_value("1.5 million") == 1.5
        assert sec_scraper._extract_numeric_value("No number here") is None
    
    def test_extract_period_end_date(self, sec_scraper):
        """Test period end date extraction"""
        from bs4 import BeautifulSoup
        
        # Test with period ended text
        html = "<div>For the period ended December 31, 2023</div>"
        soup = BeautifulSoup(html, 'html.parser')
        filing_date = datetime(2024, 1, 15)
        
        result = sec_scraper._extract_period_end_date(soup, filing_date)
        assert result.year == 2023
        assert result.month == 12
        assert result.day == 31

class TestGoogleNewsScraper:
    """Test Google News scraper"""
    
    @pytest.fixture
    def mock_session(self):
        """Mock aiohttp session"""
        session = AsyncMock()
        return session
    
    @pytest.fixture
    def news_scraper(self, mock_session):
        """Create news scraper with mock session"""
        return GoogleNewsScraper(mock_session)
    
    def test_sentiment_calculation(self, news_scraper):
        """Test sentiment calculation"""
        # Positive sentiment
        positive_text = "This is a great company with excellent growth prospects"
        sentiment = news_scraper._calculate_sentiment(positive_text)
        assert sentiment > 0
        
        # Negative sentiment
        negative_text = "This is a bad company with poor performance and losses"
        sentiment = news_scraper._calculate_sentiment(negative_text)
        assert sentiment < 0
        
        # Neutral sentiment
        neutral_text = "The company reported quarterly results"
        sentiment = news_scraper._calculate_sentiment(neutral_text)
        assert sentiment is not None
    
    def test_parse_news_response(self, news_scraper):
        """Test news response parsing"""
        mock_response = {
            'articles': [
                {
                    'title': 'Test Article',
                    'url': 'https://example.com/article',
                    'publishedAt': '2023-12-01T10:00:00Z',
                    'source': {'name': 'Test Source'},
                    'content': 'Test content',
                    'description': 'Test description'
                }
            ]
        }
        
        articles = news_scraper._parse_news_response(mock_response, "Test Company")
        assert len(articles) == 1
        assert articles[0].title == "Test Article"
        assert articles[0].company_name == "Test Company"

class TestMonitoringSystem:
    """Test monitoring system"""
    
    def test_monitoring_initialization(self):
        """Test monitoring system initialization"""
        monitoring = MonitoringSystem()
        assert monitoring.metrics['total_requests'] == 0
        assert monitoring.metrics['successful_requests'] == 0
        assert monitoring.metrics['failed_requests'] == 0
    
    def test_record_request(self):
        """Test request recording"""
        monitoring = MonitoringSystem()
        
        monitoring.record_request(success=True)
        monitoring.record_request(success=False)
        
        assert monitoring.metrics['total_requests'] == 2
        assert monitoring.metrics['successful_requests'] == 1
        assert monitoring.metrics['failed_requests'] == 1
    
    def test_record_data_points(self):
        """Test data points recording"""
        monitoring = MonitoringSystem()
        
        monitoring.record_data_points(10)
        monitoring.record_data_points(5)
        
        assert monitoring.metrics['data_points_collected'] == 15
    
    def test_get_metrics(self):
        """Test metrics retrieval"""
        monitoring = MonitoringSystem()
        monitoring.record_request(success=True)
        monitoring.record_request(success=False)
        
        metrics = monitoring.get_metrics()
        
        assert 'runtime_seconds' in metrics
        assert 'requests_per_second' in metrics
        assert 'success_rate' in metrics
        assert metrics['success_rate'] == 0.5

class TestDatabaseManager:
    """Test database manager"""
    
    @pytest.fixture
    def db_manager(self):
        """Create database manager"""
        return DatabaseManager()
    
    @pytest.mark.asyncio
    async def test_database_operations(self, db_manager):
        """Test database operations with mock"""
        with patch('asyncpg.create_pool') as mock_create_pool:
            mock_pool = AsyncMock()
            mock_create_pool.return_value = mock_pool
            
            await db_manager.create_pool()
            assert db_manager.pool == mock_pool
            
            await db_manager.close_pool()
            mock_pool.close.assert_called_once()

class TestIntegration:
    """Integration tests"""
    
    @pytest.mark.asyncio
    async def test_company_data_scraper_context_manager(self):
        """Test scraper context manager"""
        with patch('aiohttp.ClientSession') as mock_session_class:
            with patch('asyncpg.create_pool') as mock_create_pool:
                mock_session = AsyncMock()
                mock_session_class.return_value = mock_session
                mock_pool = AsyncMock()
                mock_create_pool.return_value = mock_pool
                
                async with CompanyDataScraper() as scraper:
                    assert scraper.session == mock_session
                    assert scraper.db_manager.pool == mock_pool
                
                mock_session.close.assert_called_once()
                mock_pool.close.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_scrape_company_data_mock(self):
        """Test company data scraping with mocks"""
        with patch('aiohttp.ClientSession') as mock_session_class:
            with patch('asyncpg.create_pool') as mock_create_pool:
                mock_session = AsyncMock()
                mock_session_class.return_value = mock_session
                mock_pool = AsyncMock()
                mock_create_pool.return_value = mock_pool
                
                # Mock the scrapers
                with patch.object(SECEdgarScraper, 'get_company_filings', return_value=[]):
                    with patch.object(GoogleNewsScraper, 'get_company_news', return_value=[]):
                        with patch.object(GlassdoorScraper, 'get_company_reviews', return_value=[]):
                            with patch.object(DatabaseManager, 'save_company_data'):
                                async with CompanyDataScraper() as scraper:
                                    result = await scraper.scrape_company_data(
                                        "Test Company",
                                        "0000000001",
                                        "TEST",
                                        "Technology",
                                        "Software"
                                    )
                                    
                                    assert result.company_name == "Test Company"
                                    assert result.cik == "0000000001"

# Performance tests
class TestPerformance:
    """Performance tests"""
    
    @pytest.mark.asyncio
    async def test_concurrent_scraping(self):
        """Test concurrent scraping performance"""
        with patch('aiohttp.ClientSession') as mock_session_class:
            with patch('asyncpg.create_pool') as mock_create_pool:
                mock_session = AsyncMock()
                mock_session_class.return_value = mock_session
                mock_pool = AsyncMock()
                mock_create_pool.return_value = mock_pool
                
                companies = [
                    {"name": f"Company {i}", "cik": f"000000000{i}"}
                    for i in range(5)
                ]
                
                with patch.object(SECEdgarScraper, 'get_company_filings', return_value=[]):
                    with patch.object(GoogleNewsScraper, 'get_company_news', return_value=[]):
                        with patch.object(GlassdoorScraper, 'get_company_reviews', return_value=[]):
                            with patch.object(DatabaseManager, 'save_company_data'):
                                async with CompanyDataScraper() as scraper:
                                    start_time = asyncio.get_event_loop().time()
                                    results = await scraper.scrape_multiple_companies(companies)
                                    end_time = asyncio.get_event_loop().time()
                                    
                                    assert len(results) == 5
                                    # Should complete in reasonable time (mocked)
                                    assert end_time - start_time < 10.0

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])

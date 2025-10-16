#!/usr/bin/env python3
"""
Main script to run the company data scraper
"""

import asyncio
import argparse
import sys
import signal
import logging
from pathlib import Path
from typing import List, Dict

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

from scraper import CompanyDataScraper, MonitoringSystem
from config import DEFAULT_COMPANIES

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

class ScraperRunner:
    """Main scraper runner class"""
    
    def __init__(self):
        self.monitoring = MonitoringSystem()
        self.running = True
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info("Received shutdown signal, stopping scraper...")
        self.running = False
    
    def load_companies_from_file(self, file_path: str) -> List[Dict]:
        """Load companies from a JSON file"""
        import json
        
        try:
            with open(file_path, 'r') as f:
                companies = json.load(f)
            logger.info(f"Loaded {len(companies)} companies from {file_path}")
            return companies
        except Exception as e:
            logger.error(f"Error loading companies from {file_path}: {e}")
            return []
    
    def load_companies_from_csv(self, file_path: str) -> List[Dict]:
        """Load companies from a CSV file"""
        import pandas as pd
        
        try:
            df = pd.read_csv(file_path)
            companies = []
            
            for _, row in df.iterrows():
                company = {
                    'name': row.get('company_name', ''),
                    'cik': str(row.get('cik', '')).zfill(10),
                    'ticker': row.get('ticker', ''),
                    'industry': row.get('industry', ''),
                    'sector': row.get('sector', '')
                }
                companies.append(company)
            
            logger.info(f"Loaded {len(companies)} companies from {file_path}")
            return companies
        except Exception as e:
            logger.error(f"Error loading companies from {file_path}: {e}")
            return []
    
    async def run_scraper(self, companies: List[Dict], max_companies: int = None):
        """Run the scraper for the given companies"""
        if max_companies:
            companies = companies[:max_companies]
        
        logger.info(f"Starting scraper for {len(companies)} companies")
        
        async with CompanyDataScraper() as scraper:
            try:
                # Scrape data for all companies
                results = await scraper.scrape_multiple_companies(companies)
                
                # Log results
                total_financial_metrics = sum(len(r.financial_metrics) for r in results)
                total_news_articles = sum(len(r.news_articles) for r in results)
                total_reviews = sum(len(r.employee_reviews) for r in results)
                
                logger.info(f"Scraping completed successfully!")
                logger.info(f"Companies processed: {len(results)}")
                logger.info(f"Financial metrics collected: {total_financial_metrics}")
                logger.info(f"News articles collected: {total_news_articles}")
                logger.info(f"Employee reviews collected: {total_reviews}")
                
                # Log detailed results for each company
                for result in results:
                    logger.info(f"  {result.company_name}: "
                               f"{len(result.financial_metrics)} metrics, "
                               f"{len(result.news_articles)} articles, "
                               f"{len(result.employee_reviews)} reviews")
                
                # Log monitoring metrics
                self.monitoring.log_metrics()
                
            except Exception as e:
                logger.error(f"Error during scraping: {e}")
                raise
    
    async def run_continuous_scraper(self, companies: List[Dict], interval_hours: int = 24):
        """Run the scraper continuously at specified intervals"""
        logger.info(f"Starting continuous scraper (interval: {interval_hours} hours)")
        
        while self.running:
            try:
                await self.run_scraper(companies)
                
                if self.running:
                    logger.info(f"Waiting {interval_hours} hours until next run...")
                    await asyncio.sleep(interval_hours * 3600)
            
            except Exception as e:
                logger.error(f"Error in continuous scraper: {e}")
                if self.running:
                    logger.info("Waiting 1 hour before retry...")
                    await asyncio.sleep(3600)

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Company Data Scraper')
    parser.add_argument('--companies', '-c', type=str, 
                       help='Path to companies file (JSON or CSV)')
    parser.add_argument('--max-companies', '-m', type=int,
                       help='Maximum number of companies to process')
    parser.add_argument('--continuous', action='store_true',
                       help='Run scraper continuously')
    parser.add_argument('--interval', '-i', type=int, default=24,
                       help='Interval in hours for continuous mode (default: 24)')
    parser.add_argument('--default', action='store_true',
                       help='Use default companies list')
    
    args = parser.parse_args()
    
    # Set up signal handlers
    runner = ScraperRunner()
    signal.signal(signal.SIGINT, runner.signal_handler)
    signal.signal(signal.SIGTERM, runner.signal_handler)
    
    # Load companies
    companies = []
    
    if args.companies:
        file_path = args.companies
        if file_path.endswith('.csv'):
            companies = runner.load_companies_from_csv(file_path)
        elif file_path.endswith('.json'):
            companies = runner.load_companies_from_file(file_path)
        else:
            logger.error("Unsupported file format. Use CSV or JSON.")
            sys.exit(1)
    elif args.default:
        companies = DEFAULT_COMPANIES
        logger.info(f"Using default companies list ({len(companies)} companies)")
    else:
        logger.error("No companies specified. Use --companies, --default, or provide a file.")
        sys.exit(1)
    
    if not companies:
        logger.error("No companies to process")
        sys.exit(1)
    
    # Run scraper
    try:
        if args.continuous:
            asyncio.run(runner.run_continuous_scraper(companies, args.interval))
        else:
            asyncio.run(runner.run_scraper(companies, args.max_companies))
    
    except KeyboardInterrupt:
        logger.info("Scraper interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

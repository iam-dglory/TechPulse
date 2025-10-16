#!/usr/bin/env python3
"""
Database setup script for the company data scraper
"""

import asyncio
import asyncpg
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

from config import DatabaseConfig

async def create_database():
    """Create the database if it doesn't exist"""
    config = DatabaseConfig()
    
    # Connect to postgres database to create our target database
    conn = await asyncpg.connect(
        host=config.host,
        port=config.port,
        database='postgres',  # Connect to default postgres database
        user=config.user,
        password=config.password
    )
    
    try:
        # Check if database exists
        result = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", 
            config.database
        )
        
        if not result:
            # Create database
            await conn.execute(f'CREATE DATABASE "{config.database}"')
            print(f"✅ Database '{config.database}' created successfully")
        else:
            print(f"✅ Database '{config.database}' already exists")
    
    finally:
        await conn.close()

async def create_tables():
    """Create all necessary tables"""
    config = DatabaseConfig()
    
    conn = await asyncpg.connect(
        host=config.host,
        port=config.port,
        database=config.database,
        user=config.user,
        password=config.password
    )
    
    try:
        # Read and execute the table creation SQL
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
        
        await conn.execute(create_tables_sql)
        print("✅ Database tables created successfully")
        
        # Verify tables were created
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        print("\n📋 Created tables:")
        for table in tables:
            print(f"  - {table['table_name']}")
    
    finally:
        await conn.close()

async def insert_sample_data():
    """Insert sample data for testing"""
    config = DatabaseConfig()
    
    conn = await asyncpg.connect(
        host=config.host,
        port=config.port,
        database=config.database,
        user=config.user,
        password=config.password
    )
    
    try:
        # Check if sample data already exists
        count = await conn.fetchval("SELECT COUNT(*) FROM companies")
        
        if count > 0:
            print("✅ Sample data already exists")
            return
        
        # Insert sample companies
        sample_companies = [
            ('Apple Inc.', '0000320193', 'AAPL', 'Technology', 'Consumer Electronics'),
            ('Microsoft Corporation', '0000789019', 'MSFT', 'Technology', 'Software'),
            ('Amazon.com Inc.', '0001018724', 'AMZN', 'Technology', 'E-commerce'),
        ]
        
        for company in sample_companies:
            await conn.execute("""
                INSERT INTO companies (company_name, cik, ticker, industry, sector)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (cik) DO NOTHING
            """, *company)
        
        print("✅ Sample data inserted successfully")
    
    finally:
        await conn.close()

async def verify_setup():
    """Verify the database setup"""
    config = DatabaseConfig()
    
    try:
        conn = await asyncpg.connect(
            host=config.host,
            port=config.port,
            database=config.database,
            user=config.user,
            password=config.password
        )
        
        # Test basic queries
        company_count = await conn.fetchval("SELECT COUNT(*) FROM companies")
        print(f"✅ Database connection successful")
        print(f"✅ Found {company_count} companies in database")
        
        # Test table structure
        tables = await conn.fetch("""
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
        """)
        
        print(f"\n📊 Database schema:")
        current_table = None
        for row in tables:
            if row['table_name'] != current_table:
                current_table = row['table_name']
                print(f"\n  {current_table}:")
            print(f"    - {row['column_name']} ({row['data_type']})")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Database verification failed: {e}")
        raise

async def main():
    """Main setup function"""
    print("🚀 Setting up database for company data scraper...\n")
    
    try:
        # Step 1: Create database
        print("1. Creating database...")
        await create_database()
        
        # Step 2: Create tables
        print("\n2. Creating tables...")
        await create_tables()
        
        # Step 3: Insert sample data
        print("\n3. Inserting sample data...")
        await insert_sample_data()
        
        # Step 4: Verify setup
        print("\n4. Verifying setup...")
        await verify_setup()
        
        print("\n🎉 Database setup completed successfully!")
        print("\nNext steps:")
        print("1. Set up your environment variables (copy env.example to .env)")
        print("2. Configure your API keys (Google News API, etc.)")
        print("3. Run the scraper: python scraper.py")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

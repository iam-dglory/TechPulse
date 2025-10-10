-- Initialize Tech News Database
-- This script runs when the MySQL container starts for the first time

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tech_news;
USE tech_news;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    url VARCHAR(1000) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    published_at DATETIME,
    image_url VARCHAR(1000),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_published_at (published_at),
    INDEX idx_source (source),
    INDEX idx_created_at (created_at),
    FULLTEXT(title, description, content)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_article (user_id, article_id),
    INDEX idx_user_id (user_id),
    INDEX idx_article_id (article_id)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    categories JSON,
    notification_settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id),
    INDEX idx_user_id (user_id)
);

-- Insert sample categories for reference
INSERT IGNORE INTO articles (title, description, url, source, category, published_at, image_url) VALUES
('Welcome to Tech News', 'Your premier source for the latest technology news and updates', 'https://technews.com/welcome', 'Tech News', 'Tech News', NOW(), 'https://example.com/tech-news.jpg'),
('AI Revolution', 'How artificial intelligence is transforming industries', 'https://technews.com/ai-revolution', 'AI Weekly', 'AI', NOW(), 'https://example.com/ai-revolution.jpg'),
('Latest Gadgets', 'Review of the newest gadgets hitting the market', 'https://technews.com/latest-gadgets', 'Gadget Review', 'Gadgets', NOW(), 'https://example.com/gadgets.jpg'),
('Software Development Trends', 'Latest trends in software development and programming', 'https://technews.com/software-trends', 'Dev Weekly', 'Software', NOW(), 'https://example.com/software.jpg');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category_published ON articles(category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Set up MySQL configuration for better performance
SET GLOBAL innodb_buffer_pool_size = 268435456; -- 256MB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL query_cache_type = 1;

-- Create a user for the application (optional, for better security)
-- CREATE USER IF NOT EXISTS 'technews_user'@'%' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tech_news.* TO 'technews_user'@'%';
-- FLUSH PRIVILEGES;

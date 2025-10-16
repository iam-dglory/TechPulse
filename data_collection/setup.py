#!/usr/bin/env python3
"""
Setup script for the company data scraper
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install required dependencies"""
    return run_command("pip install -r requirements.txt", "Installing Python dependencies")

def setup_environment():
    """Set up environment file"""
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if not env_file.exists() and env_example.exists():
        print("🔄 Creating .env file from template...")
        try:
            with open(env_example, 'r') as f:
                content = f.read()
            with open(env_file, 'w') as f:
                f.write(content)
            print("✅ .env file created. Please edit it with your configuration.")
            return True
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")
            return False
    else:
        print("✅ .env file already exists")
        return True

def check_postgresql():
    """Check if PostgreSQL is available"""
    try:
        result = subprocess.run("psql --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ PostgreSQL found: {result.stdout.strip()}")
            return True
        else:
            print("❌ PostgreSQL not found. Please install PostgreSQL.")
            return False
    except Exception:
        print("❌ PostgreSQL not found. Please install PostgreSQL.")
        return False

def create_directories():
    """Create necessary directories"""
    directories = ['logs', 'data']
    
    for directory in directories:
        dir_path = Path(directory)
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created directory: {directory}")
        else:
            print(f"✅ Directory exists: {directory}")
    
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up Company Data Scraper...\n")
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create directories
    print("\n📁 Creating directories...")
    create_directories()
    
    # Install dependencies
    print("\n📦 Installing dependencies...")
    if not install_dependencies():
        print("❌ Failed to install dependencies. Please check the error messages above.")
        sys.exit(1)
    
    # Set up environment
    print("\n⚙️ Setting up environment...")
    setup_environment()
    
    # Check PostgreSQL
    print("\n🗄️ Checking PostgreSQL...")
    postgres_available = check_postgresql()
    
    print("\n🎉 Setup completed!")
    print("\nNext steps:")
    print("1. Edit the .env file with your database credentials and API keys")
    print("2. Set up PostgreSQL database:")
    print("   python setup_database.py")
    print("3. Run the scraper:")
    print("   python run_scraper.py --default")
    print("\nFor more options, run:")
    print("   python run_scraper.py --help")
    
    if not postgres_available:
        print("\n⚠️  Note: PostgreSQL is not installed. Please install it before running the scraper.")

if __name__ == "__main__":
    main()

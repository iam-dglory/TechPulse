# TechPulse Ethics Evaluator

A comprehensive platform for evaluating company ethics, credibility, and social responsibility. Built with Next.js (App Router) + TypeScript frontend and FastAPI backend.

## Features

- **Comprehensive Ethics Evaluation**: Assess companies across three key dimensions:
  - Ethical Practices (40% weight)
  - Credibility (30% weight) 
  - Social Responsibility (30% weight)

- **Data-Driven Scoring**: Objective metrics and industry best practices
- **Actionable Insights**: Specific, prioritized recommendations for improvement
- **Modern UI**: Beautiful, responsive interface built with TailwindCSS
- **REST API**: FastAPI backend with comprehensive endpoints

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Lucide React** for icons
- **Custom UI Components** with shadcn/ui patterns

### Backend
- **FastAPI** for high-performance API
- **Pydantic** for data validation
- **Python 3.8+** for backend logic
- **Uvicorn** for ASGI server

## Project Structure

```
techpulse-evaluator/
├── src/                    # Next.js frontend
│   ├── app/               # App Router pages
│   │   ├── page.tsx       # Home page
│   │   ├── evaluate/      # Evaluation page
│   │   └── about/         # About page
│   └── components/        # React components
├── components/            # Shared UI components
│   └── ui/               # Base UI components
├── lib/                  # Shared utilities and types
│   ├── types.ts         # TypeScript type definitions
│   ├── api.ts           # API client
│   ├── utils.ts         # Utility functions
│   └── constants.ts     # App constants
├── api/                 # FastAPI backend
│   ├── main.py         # FastAPI app and routes
│   ├── models.py       # Pydantic models
│   ├── evaluator.py    # Ethics evaluation logic
│   └── requirements.txt # Python dependencies
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd techpulse-evaluator
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd api
   pip install -r requirements.txt
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

### Running the Application

1. **Start the FastAPI backend**
   ```bash
   cd api
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Next.js frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## API Endpoints

### Core Endpoints

- `GET /` - API health check
- `GET /health` - Detailed health status
- `POST /evaluate` - Evaluate company ethics
- `GET /evaluation-criteria` - Get evaluation criteria

### Example API Usage

```bash
# Evaluate a company
curl -X POST "http://localhost:8000/evaluate" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Example Corp",
    "company_data": {
      "company_name": "Example Corp",
      "industry": "Technology",
      "size": "Large (201-1000 employees)",
      "has_code_of_conduct": true,
      "whistleblower_protection": true,
      "anti_corruption_measures": true,
      "transparency_score": 8.5,
      "financial_transparency": 7.0,
      "regulatory_compliance": 9.0,
      "customer_satisfaction": 8.0,
      "media_reputation": 7.5,
      "environmental_sustainability": 6.0,
      "community_engagement": 7.0,
      "employee_welfare": 8.5,
      "diversity_inclusion": 7.0,
      "recent_controversies": [],
      "certifications": ["ISO 9001"],
      "awards": ["Best Place to Work"]
    }
  }'
```

## Evaluation Methodology

### Scoring Categories

1. **Ethical Practices (40%)**
   - Code of conduct implementation
   - Whistleblower protection
   - Anti-corruption measures
   - Transparency in operations

2. **Credibility (30%)**
   - Financial transparency
   - Regulatory compliance
   - Customer satisfaction
   - Media reputation

3. **Social Responsibility (30%)**
   - Environmental sustainability
   - Community engagement
   - Employee welfare
   - Diversity and inclusion

### Scoring Scale

- **90-100**: Excellent (Grade A+ / A)
- **80-89**: Good (Grade B+ / B)
- **70-79**: Fair (Grade C+ / C)
- **0-69**: Needs Improvement (Grade D / F)

## Development

### Frontend Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Backend Development

```bash
# Run with auto-reload
cd api
python -m uvicorn main:app --reload

# Run tests (when implemented)
python -m pytest

# Format code
black .
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] Database integration for storing evaluations
- [ ] User authentication and accounts
- [ ] Evaluation history and tracking
- [ ] Advanced analytics and reporting
- [ ] API rate limiting and security
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] Unit and integration tests
- [ ] Performance optimization
- [ ] Mobile app development
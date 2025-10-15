import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TexhPulzeInvestorLanding = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const revenueData = [
    { month: 'Q1 2025', revenue: 125000, users: 2500 },
    { month: 'Q2 2025', revenue: 275000, users: 8500 },
    { month: 'Q3 2025', revenue: 450000, users: 15000 },
    { month: 'Q4 2025', revenue: 680000, users: 25000 },
    { month: 'Q1 2026', revenue: 950000, users: 40000 },
    { month: 'Q2 2026', revenue: 1250000, users: 60000 },
  ];

  const roadmapData = [
    { quarter: 'Q1 2025', milestone: 'Platform Launch', status: 'completed', description: 'Core grievance & news platform' },
    { quarter: 'Q2 2025', milestone: 'AI Integration', status: 'in-progress', description: 'Smart content moderation & insights' },
    { quarter: 'Q3 2025', milestone: 'Enterprise API', status: 'pending', description: 'B2B solutions & partnerships' },
    { quarter: 'Q4 2025', milestone: 'Global Expansion', status: 'pending', description: 'Multi-language & regional support' },
  ];

  const businessModels = [
    {
      title: 'Premium Subscriptions',
      icon: '💎',
      description: 'Advanced analytics, priority support, and exclusive content',
      revenue: '$2.4M ARR projected'
    },
    {
      title: 'Enterprise API',
      icon: '🔌',
      description: 'B2B solutions for companies to monitor tech sentiment',
      revenue: '$1.8M ARR projected'
    },
    {
      title: 'Strategic Partnerships',
      icon: '🤝',
      description: 'Collaborations with tech companies and legal firms',
      revenue: '$1.2M ARR projected'
    },
    {
      title: 'Sponsored Content',
      icon: '📢',
      description: 'Ethical advertising from verified tech companies',
      revenue: '$800K ARR projected'
    },
    {
      title: 'Education Programs',
      icon: '🎓',
      description: 'Tech ethics courses and certification programs',
      revenue: '$600K ARR projected'
    }
  ];

  const problems = [
    {
      icon: '⚡',
      title: 'Rapid Innovation vs Ethics',
      description: 'Technology advances faster than regulatory frameworks can adapt, creating ethical blind spots'
    },
    {
      icon: '🤖',
      title: 'AI Bias & Discrimination',
      description: 'Algorithmic decisions perpetuate bias without transparent oversight or accountability'
    },
    {
      icon: '🔍',
      title: 'Lack of Tech Transparency',
      description: 'Users have no centralized platform to voice concerns about technology products and services'
    }
  ];

  const features = [
    {
      title: 'Grievance Platform',
      icon: '⚖️',
      description: 'Structured reporting system for technology-related concerns with legal framework integration'
    },
    {
      title: 'Real-time Tech News',
      icon: '📡',
      description: 'AI-powered news aggregation delivering tech updates within 60 seconds of publication'
    },
    {
      title: 'Community Discussion',
      icon: '💬',
      description: 'Collaborative platform for users to discuss, vote, and resolve technology ethics issues'
    }
  ];

  const marketStats = [
    { label: 'Global Tech Market', value: '$5.2T', description: 'Total addressable market' },
    { label: 'Ethics Tech Segment', value: '$12B', description: 'Growing 40% annually' },
    { label: 'Target Users', value: '2.8B', description: 'Global internet users' },
    { label: 'Market Penetration', value: '0.1%', description: 'Current opportunity' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-2000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-blue-600/20"></div>
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 font-['Montserrat'] leading-tight">
            Building the World's First
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
              Courtroom for Technology
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-['Nunito_Sans'] max-w-3xl mx-auto leading-relaxed">
            TexhPulze – The Technology Grievance Platform
          </p>
          <button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg">
            Download Investor Deck
          </button>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-['Montserrat']">
              Technology moves fast.
              <span className="block text-teal-600">Ethics struggles to keep up.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-6xl mb-6">{problem.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-['Montserrat']">{problem.title}</h3>
                <p className="text-gray-600 leading-relaxed font-['Nunito_Sans']">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-['Montserrat']">
              The Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-['Nunito_Sans'] leading-relaxed">
              TexhPulze creates the world's first dedicated platform for technology grievances, 
              combining real-time tech news with community-driven ethical oversight.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-['Montserrat']">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-['Nunito_Sans']">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-['Montserrat']">
              Business Model
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-['Nunito_Sans']">
              Multiple revenue streams targeting the $12B ethics tech market
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {businessModels.map((model, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <div className="text-4xl mb-4">{model.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 font-['Montserrat']">{model.title}</h3>
                <p className="text-gray-300 mb-4 font-['Nunito_Sans'] text-sm leading-relaxed">{model.description}</p>
                <div className="text-teal-400 font-semibold text-sm">{model.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Chart Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-['Montserrat']">
              Revenue Projections (2025-2026)
            </h2>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0891b2" 
                  strokeWidth={4}
                  dot={{ fill: '#0891b2', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#0891b2', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-teal-600">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-['Montserrat']">
              Market Opportunity
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {marketStats.map((stat, index) => (
              <div key={index} className="text-center bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="text-3xl font-bold text-white mb-2 font-['Montserrat']">{stat.value}</div>
                <div className="text-lg text-blue-100 mb-2 font-['Montserrat']">{stat.label}</div>
                <div className="text-sm text-blue-200 font-['Nunito_Sans']">{stat.description}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-4 font-['Montserrat'] text-center">Global Reach Potential</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-teal-200 mb-2">180+</div>
                <div className="text-white font-['Nunito_Sans']">Countries</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-200 mb-2">50+</div>
                <div className="text-white font-['Nunito_Sans']">Languages</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-200 mb-2">24/7</div>
                <div className="text-white font-['Nunito_Sans']">Global Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-['Montserrat']">
              Roadmap Timeline
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-teal-500 to-blue-500 rounded-full"></div>
            <div className="space-y-12">
              {roadmapData.map((item, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8 text-right' : 'md:pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.quarter}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 font-['Montserrat']">{item.milestone}</h3>
                      <p className="text-gray-600 font-['Nunito_Sans']">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-teal-500 rounded-full z-10"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Quote Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 via-blue-900 to-teal-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm p-12 rounded-2xl border border-white/10">
            <blockquote className="text-3xl md:text-4xl font-bold text-white mb-8 font-['Montserrat'] leading-relaxed">
              "A future where technology serves humanity — transparently, ethically, and democratically."
            </blockquote>
            <button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg">
              Join the Movement
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 border-t border-gray-700">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-bold text-white mb-4 font-['Montserrat']">TexhPulze</div>
          <p className="text-gray-400 font-['Nunito_Sans']">Building the World's First Courtroom for Technology</p>
          <div className="mt-8 pt-8 border-t border-gray-700 text-gray-500 text-sm">
            © 2025 TexhPulze. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TexhPulzeInvestorLanding;

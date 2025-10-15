import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            TechPulze
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Track tech companies and their ethical impact. Stay informed about the latest developments 
            in AI, EV, IoT, and HealthTech with our comprehensive ethical scoring system.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/companies"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Browse Companies
            </Link>
            <Link
              href="/news"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Latest News
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Company Database
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive profiles of tech companies with ethical policies, funding stages, 
              and impact scores.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Ethical News
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated with tech news that includes ethical impact analysis and 
              community discussions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Community Reviews
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Share your experiences and read verified reviews from the tech community 
              about companies and products.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join our community of tech professionals who care about ethical innovation.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🚀 Setup Required
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              To get started, you need to set up your Supabase project and configure the environment variables. 
              Check the README.md file for detailed setup instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

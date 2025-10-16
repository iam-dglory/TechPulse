import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface NewsletterFormData {
  email: string;
  interests: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
}

interface NewsletterSignupProps {
  onSubscribe?: (data: NewsletterFormData) => void;
}

const INTEREST_OPTIONS = [
  { id: 'ai', label: 'AI & Machine Learning', icon: '🤖' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔒' },
  { id: 'climate-tech', label: 'Climate Tech', icon: '🌱' },
  { id: 'fintech', label: 'Fintech', icon: '💳' },
  { id: 'healthtech', label: 'Health Tech', icon: '🏥' },
  { id: 'privacy', label: 'Privacy', icon: '🕵️' },
];

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ onSubscribe }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<NewsletterFormData>();

  const toggleInterest = (interestId: string) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : [...selectedInterests, interestId];
    
    setSelectedInterests(newInterests);
    setValue('interests', newInterests);
  };

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    
    try {
      // Add selected interests to form data
      const formData = {
        ...data,
        interests: selectedInterests
      };

      // Call API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        onSubscribe?.(formData);
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Welcome to TexhPulze!
        </h3>
        <p className="text-green-700">
          Check your email to confirm your subscription and get your first weekly tech accountability report.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Stay Accountable
        </h2>
        <p className="text-gray-600">
          Get weekly reports on technology promises vs. reality
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <div>
          <input
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Interest Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What interests you? (Optional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedInterests.includes(interest.id)
                    ? 'bg-teal-50 border-teal-300 text-teal-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{interest.icon}</span>
                <span>{interest.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How often?
          </label>
          <select
            {...register('frequency', { required: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            defaultValue="weekly"
          >
            <option value="weekly">Weekly (Recommended)</option>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Subscribing...' : 'Get Tech Accountability Reports'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Join 10,000+ professionals tracking technology promises
        </p>
      </form>
    </div>
  );
};

export default NewsletterSignup;

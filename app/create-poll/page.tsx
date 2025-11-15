'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function CreatePollPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    endsAt: '',
    options: ['', '']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          endsAt: new Date(formData.endsAt).toISOString(),
          options: formData.options.filter(option => option.trim() !== '')
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }
      
      if (!result.data?.code) {
        throw new Error('Failed to get poll code from server');
      }
      
      // Redirect to the poll page on success
      router.push(`/poll/${result.data.code}`);
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeftOutlined className="mr-2" />
          Back
        </button>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Create Your Poll</h1>
          <p className="mt-3 text-base text-gray-600 max-w-lg mx-auto">
            Create an engaging poll in seconds. Get instant feedback from your audience.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Poll Question */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Poll Question *
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.title.length}/100
                  </span>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    placeholder="E.g., What's your favorite programming language?"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.description.length}/250
                  </span>
                </div>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength={250}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Add context or additional information about your poll..."
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700">
                  End Date & Time *
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    id="endsAt"
                    name="endsAt"
                    value={formData.endsAt}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  When should this poll close? (Minimum 1 hour from now)
                </p>
              </div>

              {/* Poll Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Options * (2-10)
                  </label>
                  {formData.options.length < 10 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Option
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`Option ${index + 1}`}
                          required
                          minLength={1}
                          maxLength={80}
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = [...formData.options];
                              newOptions.splice(index, 1);
                              setFormData(prev => ({ ...prev, options: newOptions }));
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                            aria-label="Remove option"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  {formData.options.length} of 10 options added
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || formData.options.some(opt => !opt.trim())}
                  className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Poll'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Help Text */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
            <p className="text-xs text-gray-500 text-center">
              Your poll will be public and anyone with the link can vote. Polls cannot be edited after creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { usePollUpdates } from '@/hooks/usePollUpdates';
import { Button, Card, Progress, Statistic, Typography, App } from 'antd';
const { Title, Text } = Typography;

interface Poll {
  id: string;
  title: string;
  description: string | null;
  code: string;
  created_at: string;
  ends_at: string;
  is_active: boolean;
  options: {
    id: string;
    text: string;
  }[];
  time_remaining: number;
}

function PollPageContent() {
  const { message } = App.useApp();
  const params = useParams();
  const code = params?.code as string;
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [voterId, setVoterId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isResultsView, setIsResultsView] = useState(false);
  const [results, setResults] = useState<{
    question: string;
    totalVotes: number;
    results: {
      id: string;
      text: string;
      votes: number;
      percentage: number;
    }[];
    isActive: boolean;
  } | null>(null);

  const fetchPoll = useCallback(async () => {
    if (!code) return;
    
    try {
      console.log('Fetching poll data for code:', code);
      const response = await fetch(`/api/polls/${code}`);
      if (!response.ok) {
        throw new Error('Failed to fetch poll');
      }
      const data = await response.json();
      setPoll(data.data);
      console.log('Poll data loaded:', data.data);

      // Check if user has already voted
      if (voterId) {
        await checkVoteStatus(data.data.id, voterId);
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      setError('Failed to load poll');
    }
  }, [code, voterId]);

  const fetchResults = useCallback(async () => {
    if (!code) return null;
    try {
      console.log('Fetching results for poll:', code);
      const response = await fetch(`/api/polls/${code}/results`);
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      setResults(data.data);
      console.log('Poll results loaded:', data.data);
      
      // Check if current user has voted
      if (voterId) {
        const hasVoted = data.data.votes?.some((vote: any) => vote.voter_id === voterId) || false;
        if (hasVoted) {
          console.log('User has already voted, showing results');
          setIsResultsView(true);
        }
      }
      return data.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load poll results');
      return null;
    }
  }, [code, voterId]);

  const checkVoteStatus = useCallback(async (pollId: string, currentVoterId: string) => {
    if (!pollId || !currentVoterId) return;
    
    try {
      console.log('Checking vote status for voter:', currentVoterId);
      const currentResults = await fetchResults();
      if (currentResults && currentVoterId) {
        const hasVoted = currentResults.votes?.some((vote: any) => vote.voter_id === currentVoterId) || false;
        console.log('Vote status - hasVoted:', hasVoted);
        if (hasVoted) {
          setIsResultsView(true);
        }
      }
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  }, [fetchResults]);

  // Handle real-time updates - optimized for NILEDB
  const handleUpdate = useCallback(() => {
    console.log('Received update for poll:', code);
    // No artificial delay for NILEDB - it's fast enough
    Promise.all([fetchPoll(), fetchResults()])
      .then(() => {
        message.info('Poll updated!');
      })
      .catch((error) => {
        console.error('Error updating poll data:', error);
      });
  }, [code, fetchPoll, fetchResults]);

  // Set up real-time updates
  usePollUpdates(code, handleUpdate);

  // Initialize voter ID and load initial data
  useEffect(() => {
    const storedVoterId = localStorage.getItem('voterId');
    if (!storedVoterId) {
      const newVoterId = `voter_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('voterId', newVoterId);
      setVoterId(newVoterId);
    } else {
      setVoterId(storedVoterId);
    }

    // Initial data load
    if (code) {
      console.log('Initial data load for poll:', code);
      const loadData = async () => {
        await fetchPoll();
        await fetchResults();
      };
      loadData();
    }
  }, [code]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/polls/${params.code}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionId: selectedOption,
          voterId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      // Refresh the results after voting
      await fetchResults();
      setIsResultsView(true);
      message.success('Your vote has been recorded!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit vote';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  const timeRemaining = Math.max(0, new Date(poll.ends_at).getTime() - new Date().getTime());
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to home
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{poll.title}</h1>
            {poll.description && (
              <p className="mt-1 text-gray-600">{poll.description}</p>
            )}
            
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="inline-flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeRemaining > 0 ? (
                  <span>Closes in {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m</span>
                ) : (
                  <span className="text-red-600">Voting closed</span>
                )}
              </span>
              <span className="mx-2">•</span>
              <span>Poll ID: {poll.code}</span>
            </div>
          </div>

          <div className="px-6 py-5">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {isResultsView || !poll.is_active ? (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Poll Results</h2>
                {results ? (
                  <>
                    <div className="space-y-4">
                      {results.results.map((result) => (
                        <div key={result.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{result.text}</span>
                            <span className="text-gray-500">{result.percentage}% ({result.votes} vote{result.votes !== 1 ? 's' : ''})</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${result.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-sm text-gray-500 text-center">
                      {results.totalVotes} total vote{results.totalVotes !== 1 ? 's' : ''}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading results...</p>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsResultsView(false)}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={!poll.is_active}
                  >
                    Back to Poll
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVote} className="space-y-6">
                <fieldset>
                  <legend className="sr-only">Poll options</legend>
                  <div className="space-y-4">
                    {poll.options.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          id={`option-${option.id}`}
                          name="poll-option"
                          type="radio"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={selectedOption === option.id}
                          onChange={() => setSelectedOption(option.id)}
                        />
                        <label
                          htmlFor={`option-${option.id}`}
                          className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {option.text}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      fetchResults();
                      setIsResultsView(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Results
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedOption}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Vote'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Share this poll with others using the code: <span className="font-mono font-bold">{poll.code}</span></p>
          <p className="mt-1">Or share this link: <span className="text-blue-600 break-all">{typeof window !== 'undefined' ? window.location.href : ''}</span></p>
        </div>
      </div>
    </div>
  );
}

export default function PollPage() {
  return (
    <App>
      <PollPageContent />
    </App>
  );
}

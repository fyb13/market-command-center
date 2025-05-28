import React from 'react';

interface TweetsModuleProps {
  data: any;
  loading: boolean;
}

const TweetsModule: React.FC<TweetsModuleProps> = ({ data, loading }) => {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Top Tweets</h2>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-dark-300 rounded w-3/4 mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-dark-300 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-dark-300 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-dark-300 rounded mb-4"></div>
        </div>
      ) : data?.error ? (
        <div className="p-4 bg-secondary bg-opacity-20 border border-secondary rounded-lg">
          <p className="text-secondary">{data.error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(data) && data.length > 0 ? (
            data.map((tweet, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-dark-300 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-primary">@{tweet.author}</h3>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {tweet.like_count.toLocaleString()}
                  </div>
                </div>
                <p className="text-sm mt-1">{tweet.text}</p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                  <span className="font-medium">Summary:</span> {tweet.summary}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(tweet.created_at).toLocaleString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              No recent tweets available
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TweetsModule;

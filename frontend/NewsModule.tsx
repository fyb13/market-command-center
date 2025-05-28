import React from 'react';

interface NewsModuleProps {
  data: any;
  loading: boolean;
}

const NewsModule: React.FC<NewsModuleProps> = ({ data, loading }) => {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Top News</h2>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-dark-300 rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-dark-300 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-dark-300 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-dark-300 rounded mb-4"></div>
        </div>
      ) : data?.error ? (
        <div className="p-4 bg-secondary bg-opacity-20 border border-secondary rounded-lg">
          <p className="text-secondary">{data.error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(data) && data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-dark-300 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {item.title}
                    </a>
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                    {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {item.source}
                </p>
                {item.weight > 0 && (
                  <div className="flex mt-2">
                    {Array.from({ length: item.weight }).map((_, i) => (
                      <span 
                        key={i} 
                        className="inline-block w-2 h-2 rounded-full bg-primary mr-1"
                        title={`Relevance: ${item.weight}/5`}
                      ></span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              No recent news available
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsModule;

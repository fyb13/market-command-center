import React from 'react';

interface PortfolioModuleProps {
  data: any;
  loading: boolean;
}

const PortfolioModule: React.FC<PortfolioModuleProps> = ({ data, loading }) => {
  // Calculate total portfolio value
  const calculateTotal = () => {
    if (!data?.holdings) return 0;
    
    return Object.values(data.holdings).reduce((total: number, holding: any) => {
      return total + (holding.value || 0);
    }, 0);
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Portfolio</h2>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-dark-300 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-dark-300 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-dark-300 rounded"></div>
        </div>
      ) : data?.error ? (
        <div className="p-4 bg-secondary bg-opacity-20 border border-secondary rounded-lg">
          <p className="text-secondary">{data.error}</p>
        </div>
      ) : (
        <>
          {/* Portfolio Summary Banner */}
          <div className="bg-gray-100 dark:bg-dark-300 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Total Value</h3>
                <p className="text-2xl font-bold">
                  ${data?.total?.value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold">Daily P&L</h3>
                <p className={`text-2xl font-bold ${(data?.total?.dayChange || 0) >= 0 ? 'text-primary' : 'text-secondary'}`}>
                  {data?.total?.dayChange ? (
                    <>
                      {data.total.dayChange >= 0 ? '+' : ''}
                      {data.total.dayChange.toFixed(2)}%
                    </>
                  ) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Holdings Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-300">
                  <th className="text-left py-2">Holding</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Day %</th>
                  <th className="text-right py-2">YTD %</th>
                  <th className="text-right py-2">Drawdown</th>
                  <th className="text-right py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {data?.holdings ? (
                  Object.entries(data.holdings).map(([symbol, holding]: [string, any]) => (
                    <tr key={symbol} className="border-b border-gray-200 dark:border-dark-300">
                      <td className="py-3 font-medium">{symbol}</td>
                      <td className="py-3 text-right">
                        {holding.error ? (
                          <span className="text-secondary text-xs px-2 py-1 rounded bg-secondary bg-opacity-10">
                            Data unavailable
                          </span>
                        ) : (
                          <span>${holding.price?.toFixed(2) || 'N/A'}</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {holding.error ? (
                          <span>-</span>
                        ) : (
                          <span className={holding.dayChange >= 0 ? 'text-primary' : 'text-secondary'}>
                            {holding.dayChange >= 0 ? '+' : ''}
                            {holding.dayChange?.toFixed(2) || 0}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {holding.error ? (
                          <span>-</span>
                        ) : (
                          <span className={holding.ytdChange >= 0 ? 'text-primary' : 'text-secondary'}>
                            {holding.ytdChange >= 0 ? '+' : ''}
                            {holding.ytdChange?.toFixed(2) || 0}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {holding.error ? (
                          <span>-</span>
                        ) : (
                          <span className="text-secondary">
                            {holding.drawdown?.toFixed(2) || 0}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {holding.error ? (
                          <span>-</span>
                        ) : (
                          <span>${holding.value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 'N/A'}</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-3 text-center">
                      No holdings data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioModule;

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MacroModuleProps {
  data: any;
  loading: boolean;
}

const MacroModule: React.FC<MacroModuleProps> = ({ data, loading }) => {
  // Function to create sparkline chart options
  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
      elements: {
        point: {
          radius: 0,
        },
        line: {
          tension: 0.4,
        },
      },
    };
  };

  // Function to create sparkline chart data
  const getChartData = (sparklineData: number[], isPositive: boolean) => {
    return {
      labels: Array(sparklineData.length).fill(''),
      datasets: [
        {
          data: sparklineData,
          borderColor: isPositive ? '#5cc37c' : '#ff6361',
          backgroundColor: isPositive ? 'rgba(92, 195, 124, 0.1)' : 'rgba(255, 99, 97, 0.1)',
          fill: true,
        },
      ],
    };
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Macro-5 Indicators</h2>
      
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
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-300">
                <th className="text-left py-2">Indicator</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">4h %</th>
                <th className="text-right py-2">24h Trend</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) ? (
                data.map((indicator, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-dark-300">
                    <td className="py-3 text-sm">{indicator.name}</td>
                    <td className="py-3 text-right">
                      {indicator.error ? (
                        <span className="text-secondary text-xs px-2 py-1 rounded bg-secondary bg-opacity-10">
                          Data unavailable
                        </span>
                      ) : (
                        <span>{indicator.price?.toFixed(2) || 'N/A'}</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {indicator.error ? (
                        <span>-</span>
                      ) : (
                        <span className={indicator.change4h >= 0 ? 'text-primary' : 'text-secondary'}>
                          {indicator.change4h?.toFixed(2) || 0}%
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {indicator.error ? (
                        <div className="h-10 flex items-center justify-end">-</div>
                      ) : (
                        <div className="h-10">
                          <Line
                            options={getChartOptions()}
                            data={getChartData(
                              indicator.sparkline || [0, 0],
                              (indicator.change4h || 0) >= 0
                            )}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-3 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MacroModule;

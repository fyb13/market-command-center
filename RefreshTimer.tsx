import React, { useState, useEffect } from 'react';
import moment from 'moment';

interface RefreshTimerProps {
  nextUpdate: Date | null;
  onRefresh: () => void;
}

const RefreshTimer: React.FC<RefreshTimerProps> = ({ nextUpdate, onRefresh }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (!nextUpdate) {
      setTimeRemaining('--:--:--');
      setProgress(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const nextUpdateTime = new Date(nextUpdate);
      
      if (now >= nextUpdateTime) {
        setTimeRemaining('Refreshing...');
        setProgress(100);
        onRefresh();
        return;
      }
      
      const diff = nextUpdateTime.getTime() - now.getTime();
      const duration = moment.duration(diff);
      
      // Format as HH:MM:SS
      const hours = String(Math.floor(duration.asHours())).padStart(2, '0');
      const minutes = String(duration.minutes()).padStart(2, '0');
      const seconds = String(duration.seconds()).padStart(2, '0');
      
      setTimeRemaining(`${hours}:${minutes}:${seconds}`);
      
      // Calculate progress for the progress bar
      // Assuming 4-hour intervals (14400000 ms)
      const totalInterval = 4 * 60 * 60 * 1000;
      const elapsed = totalInterval - diff;
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalInterval) * 100));
      
      setProgress(progressPercent);
    };
    
    // Update immediately
    updateTimer();
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [nextUpdate, onRefresh]);

  return (
    <div className="flex items-center">
      <div className="mr-2 text-sm text-gray-500 dark:text-gray-400">
        Next update in: <span className="font-mono">{timeRemaining}</span>
      </div>
      <div className="w-24 h-2 bg-gray-200 dark:bg-dark-300 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default RefreshTimer;

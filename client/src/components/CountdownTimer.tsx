import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: string; // Format: YYYY-MM-DD
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, className }) => {
  const { t: translate } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isCountingDown, setIsCountingDown] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Convert target date to midnight of that day in the user's local timezone
      const target = new Date(targetDate);
      target.setHours(0, 0, 0, 0);
      
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      if (difference <= 0) {
        // Target date is in the past or today
        setIsCountingDown(false);
        return;
      }
      
      // Calculate remaining time
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately 
    calculateTimeLeft();
    
    // Then update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  // If it's already released
  if (!isCountingDown) {
    return (
      <Badge className="bg-emerald-900/40 text-emerald-400 py-2 px-3">
        {translate('product.availableSoon')}
      </Badge>
    );
  }

  return (
    <motion.div 
      className={`flex flex-col space-y-2 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-gray-400 text-sm">{translate('product.releasingIn')}:</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-[#0a0f1a]/80 p-2 rounded-md border border-[#1e3a5f]">
          <span className="text-2xl font-bold text-primary">{timeLeft.days}</span>
          <p className="text-xs text-gray-400">{translate('product.countdown.days')}</p>
        </div>
        <div className="bg-[#0a0f1a]/80 p-2 rounded-md border border-[#1e3a5f]">
          <span className="text-2xl font-bold text-primary">{timeLeft.hours}</span>
          <p className="text-xs text-gray-400">{translate('product.countdown.hours')}</p>
        </div>
        <div className="bg-[#0a0f1a]/80 p-2 rounded-md border border-[#1e3a5f]">
          <span className="text-2xl font-bold text-primary">{timeLeft.minutes}</span>
          <p className="text-xs text-gray-400">{translate('product.countdown.minutes')}</p>
        </div>
        <div className="bg-[#0a0f1a]/80 p-2 rounded-md border border-[#1e3a5f]">
          <span className="text-2xl font-bold text-primary">{timeLeft.seconds}</span>
          <p className="text-xs text-gray-400">{translate('product.countdown.seconds')}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CountdownTimer;
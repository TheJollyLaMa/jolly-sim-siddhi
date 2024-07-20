import React, { useEffect, useState } from 'react';
import '../styles/TipPopup.css';

const TipPopup = ({ onClose }) => {
  const [tip, setTip] = useState('');

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const response = await fetch('/assets/tips.json');
        const tips = await response.json();
        const randomIndex = Math.floor(Math.random() * tips.length);
        setTip(tips[randomIndex]);
      } catch (error) {
        console.error('Error fetching tips:', error);
      }
    };

    fetchTip();
  }, []);

  return (
    <div className="tip-popup">
      <div className="tip-popup-content">
        <h2>🏡 Decent Smart Home Tip 🧞‍♂️</h2>
        <p>{tip}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default TipPopup;
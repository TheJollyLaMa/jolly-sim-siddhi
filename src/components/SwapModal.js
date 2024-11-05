import React, { useState } from 'react';
import '../styles/SwapModal.css';

const SwapModal = ({ onClose, token }) => {
  const [amount, setAmount] = useState("");

  const handleSwap = () => {
    // Placeholder for swap logic, to integrate with LP tokens or blockchain functions
    console.log(`Swapping ${amount} SHT for ${token}`);
    // Close the modal after swap
    onClose();
  };

  return (
    <div className="modal">
      <div className="modalContent">
        <h2>Swap SHT for {token}</h2>
        <input 
          type="number" 
          placeholder="Enter amount of SHT" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />
        <button onClick={handleSwap}>Confirm Swap</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default SwapModal;
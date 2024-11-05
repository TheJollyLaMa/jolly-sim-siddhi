import React, { useState } from 'react';
import '../styles/RightToolbar.css';

function RightToolbar({ onSwapToUSDC, onSwapToPOL, onSendPOL, onSwapToSHT }) {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showSHTSwapModal, setShowSHTSwapModal] = useState(false);
  const [showUSDCSwapModal, setShowUSDCSwapModal] = useState(false);
  const [showPOLSwapModal, setShowPOLSwapModal] = useState(false);
  const [showSHT_POL_LPModal, setShowSHT_POL_LPModal] = useState(false);
  const [showSHT_USDC_LPModal, setShowSHT_USDC_LPModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [swapAmount, setSwapAmount] = useState("");

  const handleSHT_POL_LPClick = () => {
    setShowSHT_POL_LPModal(true);
  };

  const handleSHT_POL_LPConfirm = () => {
    onSwapToSHT(swapAmount);
    setShowSHT_POL_LPModal(false);
    setSwapAmount("");
  };

  const handleSHT_USDC_LPClick = () => {
    setShowSHT_USDC_LPModal(true);
  };

  const handleSHT_USDC_LPConfirm = () => {
    onSwapToUSDC(swapAmount);
    setShowSHT_USDC_LPModal(false);
    setSwapAmount("");
  };

  const handleSendPOLClick = () => {
    setShowSendModal(true);
  };

  const handleSendPOLConfirm = () => {
    onSendPOL(recipientAddress);
    setShowSendModal(false);
    setRecipientAddress("");
  };

  const handleSHTSwapClick = () => {
    setShowSHTSwapModal(true);
  };

  const handleSHTSwapConfirm = () => {
    onSwapToSHT(swapAmount);
    setShowSHTSwapModal(false);
    setSwapAmount("");
  };

  const handleUSDCSwapClick = () => {
    setShowUSDCSwapModal(true);
  };

  const handleUSDCSwapConfirm = () => {
    onSwapToUSDC(swapAmount);
    setShowUSDCSwapModal(false);
    setSwapAmount("");
  };

  const handlePOLSwapClick = () => {
    setShowPOLSwapModal(true);
  };

  const handlePOLSwapConfirm = () => {
    onSwapToPOL(swapAmount);
    setShowPOLSwapModal(false);
    setSwapAmount("");
  };

  return (
    <div id="rightToolbar">
      {/* LP Buttons */}
      <div className="lp-buttons">
        {/* SHT/POL LP Button */}
        <button className="token-balance-right lp-icon" onClick={handleSHT_POL_LPClick}>
          <img id="sht-pol-lp" src="https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png" alt="Decent Smart Home Token" />
          <img id="sht-pol-lp" src="https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png" alt="Decent Smart Home Token" />
       </button>

        {/* SHT/USDC Button */}
        <button className="token-balance-right lp-icon" onClick={handleSHT_USDC_LPClick}>
        <img id="sht-usdc-lp" src="https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png" alt="Decent Smart Home Token" />
        <img id="sht-usdc-lp" src="https://bafybeiag2css4im6d7fdtcafwabw2qau46yrzhn4z23hwhsft2e3faa2fy.ipfs.w3s.link/USDC_of_the_future.png" alt="USDC" />
        </button>

      </div>

      {/* Right Navigation Double Arrow */}
      <div className="scene-change-button" onClick={() => window.location.href='rightPage.html'}>
        ➾
      </div>

      {/* Swap Buttons */}
      <div className="swap-buttons">
        {/* SHT Swap Button */}
        <button className="token-balance-right swap-icon" onClick={handleSHTSwapClick}>
          <img id="sht-swap" src="https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png" alt="Decent Smart Home Token" />
        </button>

        {/* USDC Swap Button */}
        <button className="token-balance-right swap-icon" onClick={handleUSDCSwapClick}>
          <img id="usdc-swap" src="https://bafybeiag2css4im6d7fdtcafwabw2qau46yrzhn4z23hwhsft2e3faa2fy.ipfs.w3s.link/USDC_of_the_future.png" alt="USDC" />
        </button>

        {/* POL Swap Button */}
        <button className="token-balance-right swap-icon" onClick={handlePOLSwapClick}>
          <img id="pol-swap" src="https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png" alt="POL" />
        </button>

        {/* Send POL Button */}
        <button className="token-balance-right swap-icon" onClick={handleSendPOLClick}>
          <img id="send-pol-to-mintme" src="https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png" alt="POL" />
        </button>
      </div>

      {/* Send POL Modal */}
      {showSendModal && (
        <div className="send-modal">
          <h4>Send POL(Matic) <img id="pol-swap" src="https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png" alt="POL" /> 
           to your MintMe Wallet <img id="send-pol-to-mintme" src="https://bafybeig67sj4te7xkz5ku67ksnhxdfzikblc77gsecv53owxe6b4z5aega.ipfs.w3s.link/MintMeLogo.png" alt="MM" />
          </h4>
          <p className="warning-text">Warning: Double-check the address. Mistakes are irreversible.</p>
          <p>Find your Polygon Wallet Address on MintMe here: <a href='https://www.mintme.com/wallet'>https://www.mintme.com/wallet</a></p>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Polygon wallet address on MintMe"
            className="address-input"
          />
          <button className="confirm-button" onClick={handleSendPOLConfirm}>Send</button>
          <button className="cancel-button" onClick={() => setShowSendModal(false)}>Cancel</button>
        </div>
      )}

      {/* SHT Swap Modal */}
      {showSHTSwapModal && (
        <div className="sht-swap-modal">
          <h4>Swap into SHT <img id="sht-swap" src="https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png" alt="Decent Smart Home Token" /></h4>
          <input
            type="text"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            placeholder="Amount to Swap"
            className="amount-input"
          />
          <button className="confirm-button" onClick={handleSHTSwapConfirm}>Confirm Swap</button>
          <button className="cancel-button" onClick={() => setShowSHTSwapModal(false)}>Cancel</button>
        </div>
      )}

      {/* USDC Swap Modal */}
      {showUSDCSwapModal && (
        <div className="usdc-swap-modal">
          <h4>Swap into USDC <img id="usdc-swap" src="https://bafybeiag2css4im6d7fdtcafwabw2qau46yrzhn4z23hwhsft2e3faa2fy.ipfs.w3s.link/USDC_of_the_future.png" alt="USDC" /></h4>
          <input
            type="text"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            placeholder="Amount to Swap"
            className="amount-input"
          />
          <button className="confirm-button" onClick={handleUSDCSwapConfirm}>Confirm Swap</button>
          <button className="cancel-button" onClick={() => setShowUSDCSwapModal(false)}>Cancel</button>
        </div>
      )}

      {/* POL Swap Modal */}
      {showPOLSwapModal && (
        <div className="pol-swap-modal">
          <h4>Swap into POL <img id="pol-swap" src="https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png" alt="POL" /></h4>
          <input
            type="text"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            placeholder="Amount to Swap"
            className="amount-input"
          />
          <button className="confirm-button" onClick={handlePOLSwapConfirm}>Confirm Swap</button>
          <button className="cancel-button" onClick={() => setShowPOLSwapModal(false)}>Cancel</button>
        </div>
      )}

      {/* SHT/POL LP Modal */}
      {showSHT_POL_LPModal && (
        <div className="sht-pol-lp-modal">
          <h4>Add Liquidity to SHT/POL pool <img id="sht-pol-lp" src="https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png" alt="POL" /></h4>
          <input
            type="text"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            placeholder="Amount to Add"
            className="amount-input"
          />
          <button className="confirm-button" onClick={handleSHT_POL_LPConfirm}>Confirm</button>
          <button className="cancel-button" onClick={() => setShowSHT_POL_LPModal(false)}>Cancel</button>
        </div>
      )}

      {/* SHT/USDC LP Modal */}
      {showSHT_USDC_LPModal && (
        <div className="sht-usdc-lp-modal">
          <h4>Add Liquidity to SHT/USDC pool <img id="sht-usdc-lp" src="https://bafybeiag2css4im6d7fdtcafwabw2qau46yrzhn4z23hwhsft2e3faa2fy.ipfs.w3s.link/USDC_of_the_future.png" alt="USDC" /></h4>
          <input
            type="text"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            placeholder="Amount to Add"
            className="amount-input"
          />
          <button className="confirm-button" onClick={handleSHT_USDC_LPConfirm}>Confirm</button>
          <button className="cancel-button" onClick={() => setShowSHT_USDC_LPModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default RightToolbar;
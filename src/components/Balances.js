import React, { useEffect } from 'react';

const Balances = ({ walletAddress, setMintMeBalance, setDshBalance, mintMeBalance, dshBalance }) => {

  const fetchBalances = async (address) => {
    try {
      const mintMeResponse = await fetch(`/api/get-mintme-balance?walletAddress=${address}`);
      const mintMeData = await mintMeResponse.json();
      setMintMeBalance(mintMeData.balance);

      const dshResponse = await fetch(`/api/get-dsh-balance?walletAddress=${address}`);
      const dshData = await dshResponse.json();
      setDshBalance(dshData.balance);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress);
    }
  }, [walletAddress]);

  return (
    <div className="token-balances">
      <div className="token-balance">
        <img src="https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png" alt="Decent Smart Home Token" className="token-icon" />
        <p>{dshBalance}</p>
      </div>
      <div className="token-balance">
        <img src="https://bafybeig67sj4te7xkz5ku67ksnhxdfzikblc77gsecv53owxe6b4z5aega.ipfs.w3s.link/MintMeLogo.png" alt="MintMe" className="token-icon" />
        <p>{mintMeBalance}</p>
      </div>
    </div>
  );
};

export default Balances;
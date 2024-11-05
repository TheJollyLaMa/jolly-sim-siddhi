import React, { useEffect } from 'react';

const Balances = ({ walletAddress, setLP1Balance, setLP2Balance, setLP3Balance, lp1Balance, lp2Balance, lp3Balance }) => {

  const fetchBalances = async (address) => {
    try {

      const lp1Response = await fetch(`/api/get-lp-ownership?walletAddress=${address}&tickLower=0.89763&tickUpper=1.2486&tokenId=131670`);
      const lp1Data = await lp1Response.json();
      setLP1Balance(lp1Data.balance);

      const lp2Response = await fetch(`/api/get-lp-ownership?walletAddress=${address}&tickLower=0.89763&tickUpper=1.2486&tokenId=131679`);
      const lp2Data = await lp2Response.json();
      setLP2Balance(lp2Data.balance);

      const lp3Response = await fetch(`/api/get-lp-ownership?walletAddress=${address}&tickLower=0.89763&tickUpper=1.2486&tokenId=135001`);
      const lp3Data = await lp3Response.json();
      setLP3Balance(lp3Data.balance);

    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress);
    }
  }, [walletAddress]);

  const formatBalance = (balance) => {
    // Convert balance to a number, fallback to 0 if balance is invalid or not a number
    
    return balance ? Number(balance).toFixed(2) : '0.0000';
  };

  return (
    <div className="token-balances-right">
      {/* LP1 Balances */}
      <div className="token-balance-right">
        <p>LP1</p>
        <img src="https://bafybeiazg54nubntzsrwqwiu6rfwy5yfhlo67ezeo36xrna7nmxa7ao5s4.ipfs.w3s.link/LP_131670.svg" alt="ID: 131670" className="token-icon-right" /> 
        <p>{formatBalance(lp1Balance)}</p>
      </div>

      <div className="token-balance-right">
        <p>LP2</p>
        <img src="https://bafybeidgqwpka6dsowtuwyr3cwzdxxbg24blgierxnxhhgxmagqvunsr5e.ipfs.w3s.link/LP_131679.svg" alt="ID: 131679" className="token-icon-right" /> 
        <p>{formatBalance(lp2Balance)}</p>
      </div>

      <div className="token-balance-right">
        <p>LP3</p>
        <img src="https://bafybeibamfofy5cupxb4kkcecpubv4eqwxjsvwrfvpjjdstl34sypax4ty.ipfs.w3s.link/LP_135001.svg" alt="ID: 135001" className="token-icon-right" /> 
        <p>{formatBalance(lp3Balance)}</p>
      </div>
    </div>
  );
};

export default Balances;
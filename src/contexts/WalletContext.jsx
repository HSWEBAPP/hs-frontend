import { createContext, useContext, useState, useEffect } from 'react';
import { getWalletBalance } from '../api/auth';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setBalance(0);
        return;
      }

      const res = await getWalletBalance(); // fetch from API
      console.log(res, 87878);
      
      setBalance(res.data.walletBalance);
    } catch (err) {
      console.error('Failed to fetch balance', err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <WalletContext.Provider value={{ balance, setBalance, fetchBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

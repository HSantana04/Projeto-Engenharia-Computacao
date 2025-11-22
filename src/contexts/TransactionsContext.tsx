import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import transactionService, { type Transaction } from "../services/transactionService";

type TransactionsContextType = {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  editTransaction: (id: string, t: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch("http://localhost:5217/api/Transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setTransactions(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar transações");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const addTransaction = async (t: Omit<Transaction, "id">) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:5217/api/Transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(t),
      });
      const newT = await res.json();
      setTransactions(prev => [newT, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const editTransaction = async (id: string, t: Omit<Transaction, "id">) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      await fetch(`http://localhost:5217/api/Transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(t),
      });
      setTransactions(prev => prev.map(tx => (tx.id === id ? { id, ...t } : tx)));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      await fetch(`http://localhost:5217/api/Transactions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TransactionsContext.Provider value={{ transactions, isLoading, error, addTransaction, editTransaction, deleteTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error("useTransactions must be used within TransactionsProvider");
  return context;
};

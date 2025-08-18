import { useEffect, useState } from "react";
import { fetchTransactions } from "../../api/transactionApi";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import DataTable from "../../components/Table";

export default function ManageTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await fetchTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error("Error loading transactions", err);
    }
  };

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "user", label: "User" },
    { key: "amount", label: "Amount" },
    { key: "type", label: "Type" },
    { key: "date", label: "Date" },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header title="Manage Transactions" />
        <div className="p-4">
          <DataTable data={transactions} columns={columns} />
        </div>
      </div>
    </div>
  );
}

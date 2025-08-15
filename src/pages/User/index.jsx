import { useEffect, useState } from "react";
import { fetchUsers, updateUserStatus } from "../../api/auth";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import DataTable from "../../components/Table";
import { useWallet } from "../../contexts/WalletContext";
export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const { balance } = useWallet();
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    fetchUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  const handleDelete = (user) => {
    alert(`Delete user: ${user.name}`);
  };

  const handleUpdate = (user) => {
    alert(`Update user: ${user.name}`);
  };

  const handleStatusChange = (id, newStatus) => {
    updateUserStatus(id, newStatus)
      .then(() => loadUsers())
      .catch((err) => console.error(err));
  };

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "mobile", label: "Mobile" },
    {
      key: "createdAt",
      label: "Registration Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    { key: "status", label: "Status" },
    {
      key: "rechargeHistory",
      label: "Recharge History",
      render: (_, row) => (
        <ul className="list-disc list-inside text-left">
          <li className="list-none">₹{balance} Free Credit</li>
        </ul>
      ),
    },
    {
      key: "transactionHistory",
      label: "Transaction History",
      render: (_, row) => (
        <ul className="list-disc list-inside text-left">
          {row.transactionHistory?.length > 0 ? (
            row.transactionHistory.map((t, i) => (
              <li className="list-none" key={i}>{`${t.type} - ${
                t.amount
              }₹ - ${new Date(t.date).toLocaleDateString()}`}</li>
            ))
          ) : (
            <li className="list-none">No Transactions</li>
          )}
        </ul>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4">
          <DataTable
            columns={columns}
            data={users}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Recharge from "./pages/Recharge";
import ForgotPassword from "./pages/ForgotPassword";
import PrivateRoute from "./PrivateRoute";
import { Toaster } from "react-hot-toast";
import User from "./pages/User"; // if you have one
import QrCode from "./pages/AddQRCode";
import Wallet from "./pages/Wallet";
import AdminWallet from "./pages/AdminWallet";
import RechargeUserHistory from "./pages/RechargeUserHistory";
import UserEdit from "./pages/User/UserEdit"
import Editor from "./pages/Editor"
import Transactions from "./pages/Transactions";

function App() {
  return (
    <>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <PrivateRoute>
              <Wallet />
            </PrivateRoute>
          }
        />
        <Route
          path="/recharge-history"
          element={
            <PrivateRoute>
              <RechargeUserHistory />
            </PrivateRoute>
          }
        />
         <Route
          path="/transaction-history"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />
           <Route
          path="/editor"
          element={
            <PrivateRoute>
              <Editor />
            </PrivateRoute>
          }
        />
        <Route
          path="/user"
          element={
            <PrivateRoute requiredRole="admin">
              <User />
            </PrivateRoute>
          }
        />
         <Route
          path="/user/:id"
          element={
            <PrivateRoute requiredRole="admin">
              <UserEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/QR"
          element={
            <PrivateRoute requiredRole="admin">
              <QrCode />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-wallet"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminWallet />
            </PrivateRoute>
          }
        />
        <Route
          path="/recharge"
          element={
            <PrivateRoute>
              <Recharge />
            </PrivateRoute>
          }
        />
      </Routes>

      {/* ✅ Toast container */}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;

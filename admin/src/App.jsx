import React, { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Add from "./pages/Add";
import List from "./pages/List";
import ProductList from "./pages/ProductList";
import ProductVariant from "./pages/ProductVariant";
import DiscountManager from "./pages/DiscountManager";
import ProductDiscountPage from "./pages/ProductDiscountPage";
import BulkDiscountPage from "./pages/BulkDiscountPage";
import Orders from "./pages/Orders";
import OrderCreate from "./pages/OrderCreate";
import Collections from "./pages/Category";
import CollectionManager from "./pages/CollectionManager";
import SubCategoryDetails from "./pages/SubCategoryDetails";
import SubCategoryManager from "./pages/SubCategoryManager";
import ProductDetails from "./pages/ProductDetails";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Login from "./components/layout/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authService from "./services/authService";

export const currency = "$";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  // Token validation on app load
  useEffect(() => {
    const validateTokenOnLoad = async () => {
      console.log("🚀 App starting, checking token...");
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        console.log("🔍 Token found, validating...");
        const isValid = await authService.validateToken(currentToken);
        if (!isValid) {
          console.log("❌ Token is invalid, attempting refresh...");
          const newToken = await authService.manualRefresh();
          if (newToken) {
            console.log("✅ Token refreshed successfully");
            setToken(newToken);
          } else {
            console.log("❌ Token refresh failed, will redirect to login");
          }
        } else {
          console.log("✅ Token is valid");
        }
      } else {
        console.log("⚠️ No token found");
      }
    };

    validateTokenOnLoad();
  }, []);

  // Make toast available globally for auth service
  useEffect(() => {
    window.showToast = (message, type = "error") => {
      if (type === "error") {
        toast.error(message);
      } else if (type === "success") {
        toast.success(message);
      } else if (type === "info") {
        toast.info(message);
      } else {
        toast(message);
      }
    };
    
    window.toast = {
      error: toast.error,
      success: toast.success,
      info: toast.info,
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <div className="flex w-full">
            <Sidebar />
            <main className="flex-1 max-w-[1400px] mx-auto p-6 text-gray-700 text-base">
              <Routes>
                <Route path="/" element={<Dashboard token={token} />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/products" element={<ProductList token={token} />} />
                <Route path="/products/:id" element={<ProductDetails token={token} />} />
                <Route path="/products/:productId/variants" element={<ProductVariant token={token} />} />
                <Route path="/products/:productId/discount" element={<ProductDiscountPage token={token} />} />
                <Route path="/discounts" element={<DiscountManager token={token} />} />
                <Route path="/bulk-discount" element={<BulkDiscountPage token={token} />} />
                <Route path="/sub-category" element={<SubCategoryManager token={token} />} />
                <Route
                  path="/collections"
                  element={<Collections token={token} backendUrl={backendUrl} />}
                />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/orders/create" element={<OrderCreate token={token} />} />
                <Route path="/users" element={<Users token={token} />} />
                <Route path="/settings" element={<Settings token={token} />} />
                <Route path="/category/view/:categoryId" element={<Collections token={token} backendUrl={backendUrl} />} />
                <Route path="/category/edit/:categoryId" element={<Collections token={token} backendUrl={backendUrl} />} />
                <Route path="/collection-manager" element={<CollectionManager token={token} />} />
                <Route path="/collection/view/:collectionId" element={<CollectionManager token={token} />} />
                <Route path="/collection/edit/:collectionId" element={<CollectionManager token={token} />} />
                {/* Dedicated details pages */}
                <Route path="/subcategories/:id" element={<SubCategoryDetails token={token} />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

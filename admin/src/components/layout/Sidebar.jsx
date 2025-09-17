import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2 border-gray-200 sticky top-14">
      <div className="flex flex-col gap-2 pt-4 pl-[14%] pr-2 text-[15px]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.dashboard_icon}
            alt="dashboard"
          />
          <p className="hidden sm:block">Dashboard</p>
        </NavLink>
        <NavLink
          to="/add"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.add_icon}
            alt="logo"
          />
          <p className="hidden sm:block">Add Items</p>
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.collection_icon}
            alt="logo"
          />
          <p className="hidden sm:block">Products</p>
        </NavLink>
        <NavLink
          to="/discounts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.discount_icon}
            alt="discount"
          />
          <p className="hidden sm:block">Discounts</p>
        </NavLink>
        
        <NavLink
          to="/bulk-discount"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.discount_icon}
            alt="bulk discount"
          />
          <p className="hidden sm:block">Bulk Discount</p>
        </NavLink>

        <NavLink
          to="/collections"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.collection_icon}
            alt="logo"
          />
          <p className="hidden sm:block">Categories</p>
        </NavLink>

        <NavLink
          to="/collection-manager"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.collection_icon}
            alt="collection"
          />
          <p className="hidden sm:block">Collections</p>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.order_icon}
            alt="logo"
          />
          <p className="hidden sm:block">Orders</p>
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.users_icon}
            alt="users"
          />
          <p className="hidden sm:block">Users</p>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-gray-900 border-gray-300" : "text-gray-700"
            }`
          }
        >
          <img
            className="w-5 h-5 sm:w-6 sm:h-6"
            src={assets.settings_icon}
            alt="settings"
          />
          <p className="hidden sm:block">Settings</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;

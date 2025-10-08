import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
<<<<<<< HEAD

const ProductItem = ({ id, image, name, price, finalPrice }) => {
  const { currency } = useContext(ShopContext);
  const originalPrice = price || 0;
  const effectivePrice = typeof finalPrice === "number" ? finalPrice : originalPrice;
  const hasDiscount = effectivePrice < originalPrice;
  const discountPercentage = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;
  return (
    <>
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="overflow-hidden relative">
          {hasDiscount && (
            <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wide bg-black text-white px-2 py-1 rounded-full">
              Sale{discountPercentage ? ` ${discountPercentage}%` : ""}
            </span>
          )}
          <img
            className="hover:scale-110 transition ease-in-out"
            src={image[0]}
            alt=""
          />
        </div>
=======
import WishlistButton from "./WishlistButton";

const ProductItem = ({ id, image, name, price, finalPrice, discountPrecentage, discountName }) => {
  const { currency } = useContext(ShopContext);
  const originalPrice = price || 0;
  const effectivePrice = typeof finalPrice === "number" ? finalPrice : originalPrice;
  
  // Use API discount percentage if available, otherwise calculate from price difference
  const apiDiscountPercentage = discountPrecentage || 0;
  const calculatedDiscountPercentage = originalPrice > 0 && effectivePrice < originalPrice
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;
  
  const discountPercentage = apiDiscountPercentage > 0 ? apiDiscountPercentage : calculatedDiscountPercentage;
  const hasDiscount = discountPercentage > 0;
  return (
    <>
      <div className="text-gray-700 cursor-pointer relative group">
        <Link to={`/product/${id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="overflow-hidden relative">
            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{discountPercentage}%
              </div>
            )}
            
            {/* Wishlist Button */}
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <WishlistButton 
                productId={id} 
                size="small"
                variant="default"
              />
            </div>
            
            <img
              className="hover:scale-110 transition ease-in-out"
              src={image[0]}
              alt=""
            />
          </div>
        </Link>
>>>>>>> f928bb6 (last update)
        <p className="pt-3 pb-1 text-sm">{name}</p>
        {hasDiscount ? (
          <div className="flex items-center gap-2">
            <span className="text-xs line-through text-gray-400">
              {currency}{originalPrice}
            </span>
<<<<<<< HEAD
            <span className="text-sm font-medium text-red-500">
=======
            <span className="text-sm font-bold text-red-500">
>>>>>>> f928bb6 (last update)
              {currency}{effectivePrice}
            </span>
          </div>
        ) : (
          <p className="text-sm font-medium">
            {currency}{originalPrice}
          </p>
        )}
<<<<<<< HEAD
      </Link>
=======
      </div>
>>>>>>> f928bb6 (last update)
    </>
  );
};

export default ProductItem;

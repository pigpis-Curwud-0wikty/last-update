import React from "react";
import { useParams } from "react-router-dom";
import ViewProduct from "../components/products/ViewProduct";

const ProductDetails = ({ token }) => {
  const { id } = useParams();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Product Details</h1>
      <ViewProduct token={token} productId={id} />
    </div>
  );
};

export default ProductDetails;

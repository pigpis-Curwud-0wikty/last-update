import { motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/frontend_assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { AnimatePresence } from "framer-motion";
import ScrollSectionProduct from "../components/ScrollSectionProduct";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import HeroBanner from "../components/HeroBanner";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
<<<<<<< HEAD
=======
import WishlistButton from "../components/WishlistButton";
>>>>>>> f928bb6 (last update)

const Product = () => {
  const { t } = useTranslation();
  const { productId } = useParams();
  const { products, loadingProducts, addToCart, backendUrl } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantImages, setVariantImages] = useState({});
  const [loadingVariants, setLoadingVariants] = useState(false); // eslint-disable-line no-unused-vars
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [localStock, setLocalStock] = useState({});
  // Intersection observer for ScrollSectionProduct
  const { ref: scrollSectionRef, inView: isScrollSectionInView } = useInView({
    threshold: 0.3,
  });

  // Function to update local stock when product is added to cart
  const updateLocalStock = (variantId, quantity) => {
    if (variantId) {
      setLocalStock(prev => ({
        ...prev,
        [variantId]: Math.max(0, (prev[variantId] || 0) - quantity)
      }));
    }
  };

  // Function to get current stock for a variant
  const getCurrentStock = (variant) => {
    if (!variant) return 10; // Default stock if no variant selected
    const localQuantity = localStock[variant.id] || 0;
    return Math.max(0, (variant.quantity || 10) - localQuantity); // Default to 10 if no quantity
  };

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find((item) => item._id === productId);
      if (found) {
        setProductData(found);
        setImage(found.image[0]);

        // optional: fetch discount info elsewhere if needed
      } else {
        setProductData(null);
      }
    }
  }, [products, productId]);

  // discount info removed

  // Fetch product variants
  useEffect(() => {
    const fetchVariants = async () => {
      if (!productId) return;

      setLoadingVariants(true);
      try {
        const response = await axios.get(
          `${backendUrl}/api/Products/${productId}/Variants`
        );
        if (response.data?.responseBody?.data) {
          const variantData = response.data.responseBody.data;
          setVariants(variantData);

          // Initialize variant images object
          const images = {};
          for (const variant of variantData) {
            if (variant.color) {
              // If we don't have images for this color yet, fetch them
              if (!images[variant.color]) {
                try {
                  // Fetch variant-specific images using the variant ID
                  const variantResponse = await axios.get(
                    `${backendUrl}/api/Products/${productId}/Variants/${variant.id}`
                  );
                  if (variantResponse.data?.responseBody?.data) {
                    // If the variant has images, use them
                    // Note: This assumes the API returns image URLs in the variant data
                    // If not, we'll fall back to product images
                    const variantData = variantResponse.data.responseBody.data;

                    // Check if the variant has an 'images' property
                    // If not, we'll check for 'image' property or other potential image fields
                    if (variantData.images && variantData.images.length > 0) {
                      images[variant.color] = variantData.images;
                    } else if (
                      variantData.image &&
                      variantData.image.length > 0
                    ) {
                      // Some APIs might use 'image' instead of 'images'
                      images[variant.color] = variantData.image;
                    } else if (
                      variantData.imageUrls &&
                      variantData.imageUrls.length > 0
                    ) {
                      // Some APIs might use 'imageUrls'
                      images[variant.color] = variantData.imageUrls;
                    } else {
                      // Fallback to product images if variant has no images
                      const productImages =
                        products.find((p) => p._id === productId)?.image || [];
                      images[variant.color] = productImages;
                    }
                  } else {
                    // Fallback to product images
                    const productImages =
                      products.find((p) => p._id === productId)?.image || [];
                    images[variant.color] = productImages;
                  }
                } catch (error) {
                  console.error(
                    `Error fetching variant ${variant.id} images:`,
                    error
                  );
                  // Fallback to product images on error
                  const productImages =
                    products.find((p) => p._id === productId)?.image || [];
                  images[variant.color] = productImages;
                }
              }
            }
          }
          setVariantImages(images);
        }
      } catch (error) {
        console.error("Error fetching variants:", error);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchVariants();
  }, [productId, backendUrl, products]);

  // Function to fetch a specific variant's details
  const fetchVariantDetails = async (variantId) => {
    if (!productId || !variantId) return null;

    try {
      const response = await axios.get(
        `${backendUrl}/api/Products/${productId}/Variants/${variantId}`
      );
      if (response.data?.responseBody?.data) {
        const variantData = response.data.responseBody.data;

        // Normalize image data to ensure consistent structure
        // This handles different API response formats for images
        if (!variantData.images) {
          if (variantData.image && Array.isArray(variantData.image)) {
            variantData.images = variantData.image;
          } else if (
            variantData.imageUrls &&
            Array.isArray(variantData.imageUrls)
          ) {
            variantData.images = variantData.imageUrls;
          } else if (
            variantData.image &&
            typeof variantData.image === "string"
          ) {
            // Handle case where image might be a single string
            variantData.images = [variantData.image];
          } else {
            // If no images found, use product images as fallback
            const productImages =
              products.find((p) => p._id === productId)?.image || [];
            variantData.images = productImages;
          }
        }

        return variantData;
      }
    } catch (error) {
      console.error(`Error fetching variant ${variantId} details:`, error);
    }
    return null;
  };

  // Helper to map numeric sizes to label sizes
  const mapSizeToLabel = (value) => {
    if (typeof value === "string") {
      const upper = value.toUpperCase();
      // normalize possible variations (e.g., xs -> S if needed)
      if (["S", "M", "L", "XL", "XXL"].includes(upper)) return upper;
      return upper;
    }
    if (typeof value === "number") {
      // Map numeric sizes to string labels
      if (value >= 30 && value <= 32) return "S";
      if (value >= 33 && value <= 35) return "M";
      if (value >= 36 && value <= 38) return "L";
      if (value >= 39 && value <= 41) return "XL";
      if (value >= 42 && value <= 44) return "XXL";
      // For other numbers, convert to string
      return String(value);
    }
    return String(value ?? "");
  };

  if (loadingProducts) return <div>Loading...</div>;
  if (productData === null) return <div>Product not found.</div>;
  if (!productData) return <div>Loading...</div>;

  return productData ? (
    <div className="mt-[80px] mb-5 px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw] border-t border-gray-200">
      {/* Breadcrumb */}
      <div className="text-[12px] text-gray-600 mt-6">
        <Link to="/" className="underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>{productData?.name}</span>
      </div>
      {/* Product Data */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="flex gap-12 sm:gap-12 flex-col sm:flex-row pt-2"
      >
        {/* Product Image */}
        <div className="flex-1/3 flex flex-col-reverse gap-3 sm:flex-row">
          {/* الصور الصغيرة (thumbnails) */}
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => {
              return (
                <img
                  onClick={() => setImage(item)}
                  src={item}
                  key={index}
                  alt="ProductImg"
                  className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer max-w-full"
                />
              );
            })}
          </div>

          {/* الصورة الكبيرة مع الأيقونة */}
          <div className="w-full bg-white sm:w-[80%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={image}
                className="relative group w-full max-w-full h-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* صورة المنتج */}
                <img
                  src={image}
                  alt="ProductImg"
                  className="w-full max-w-full h-auto"
                />

                {/* أيقونة التكبير */}
                <div
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer bg-white rounded-full p-2 shadow-md"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="10"
                      stroke="gray"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M8 11H14M11 8V14"
                      stroke="gray"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* مودال التكبير */}
          <AnimatePresence>
            {isZoomOpen && (
              <motion.div
                className="fixed inset-0 bg-white flex items-center justify-center z-50 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsZoomOpen(false)} // يقفل لما تدوس برة
              >
                <motion.div
                  className="relative w-[40%]"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()} // يمنع قفل المودال لو دوست على الصورة نفسها
                >
                  {/* Close Icon */}
                  <button
                    onClick={() => setIsZoomOpen(false)}
                    className="absolute -top-0 -right-100 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Close zoom modal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Zoomed Image */}
                  <img
                    src={image}
                    alt="ZoomedProduct"
                    className="w-full h-auto max-w-full max-h-full object-contain bg-white"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          {/* Brand Name */}
          <div className="uppercase text-sm text-gray-500 mb-2">
            {productData.brand} <p>R&S</p>
          </div>

<<<<<<< HEAD
          {/* Product Name */}
          <h1 className="text-2xl font-light uppercase">
            {productData.name}
          </h1>
=======
          {/* Product Name with Wishlist Button */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-light uppercase flex-1">
              {productData.name}
            </h1>
            <WishlistButton 
              productId={productData._id} 
              size="default"
              variant="minimal"
              showText={true}
            />
          </div>
>>>>>>> f928bb6 (last update)

          {/* Price */}
          <div className="mt-3 mb-4">
            {/* Calculate discount using same logic as ProductCard */}
            {(() => {
              // Get prices from product data (same logic as ProductCard)
              const originalPrice = selectedVariant?.price || productData.price || 0;
              const finalPrice = selectedVariant?.finalPrice || productData.finalPrice || originalPrice;
              const hasDiscount = finalPrice < originalPrice;
              // const discountPercentage = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

              return (
                <>
                  <div className="flex items-center gap-2">
                    {hasDiscount ? (
                      <div className="flex items-center gap-1">
                        <span className="text-lg text-gray-500">Price: </span>
                        <span className="text-xl font-light line-through text-gray-500">
                          {productData.currency || '$'}{originalPrice}
                        </span>
                        <span className="text-xl font-light text-red-500 mr-1">
                          {productData.currency || '$'}{finalPrice}
                        </span>
                        
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {productData.currency || '$'}{originalPrice}
                      </span>
                    )}
                    <div className="flex items-center">
                      {(() => {
                        // Get current stock after local updates
                        const currentStock = getCurrentStock(selectedVariant);
                        const isOutOfStock = currentStock <= 0;
                        
                        // If no variant selected yet, show in stock by default
                        if (!selectedVariant) {
                          if (hasDiscount) {
                            return (
                              <span className="text-white bg-black text-[10px] px-2 py-1 rounded-full text-sm font-medium">
                                {t("ON_SALE")}
                              </span>
                            );
                          }
                          return (
                            <span className="text-blue-600 text-[10px] font-medium">
                              {t("IN_STOCK")}
                            </span>
                          );
                        }
                        
                        // Check if there's not enough quantity in stock for this variant
                        if (isOutOfStock) {
                          return (
                            <span className="text-red-500 text-[10px] font-medium">
                              {t("OUT_OF_STOCK")}
                            </span>
                          );
                        }
                        
                        // Check if product has discount (final price is less than original price)
                        if (hasDiscount) {
                          return (
                            <span className="text-white bg-black text-[10px] px-2 py-1 rounded-full text-sm font-medium">
                              {t("ON_SALE")}
                            </span>
                          );
                        }
                        
                        // Product is in stock and has no discount
                        return (
                          <span className="text-blue-600 text-[10px] font-medium">
                            {t("IN_STOCK")}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Tax included.</span>
                  </div>
                </>
              );
            })()}

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Product Description */}
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-2">{productData.name} in Seven Colorways</p>
              <p className="text-sm text-gray-700">{productData.description}</p>
            </div>

            {/* Model Information */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">
                <p className="mb-1">
                  Female model wears: Size Small/Medium
                </p>
                <p>
                  Model's height: {selectedVariant?.height || "176cm"}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Oversized fit - shop accordingly
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Looking After Me Section */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2 uppercase">LOOKING AFTER ME</p>
              <p className="text-sm text-gray-600">
                Machine wash according to instructions on price tag
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* About Me Section */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2 uppercase">ABOUT ME</p>
              <p className="text-sm text-gray-600">
                Fabric made of 100% cotton
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Color Selection */}
            {variants.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">
                  {t("COLOR")}: {selectedVariant?.color || "Black"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(variants.map((v) => v.color)))
                    .filter(Boolean)
                    .map((color, index) => {
                      // Find all variants with this color
                      const colorVariants = variants.filter(
                        (v) => v.color === color
                      );
                      // Get available sizes for this color
                      const availableSizes = colorVariants
                        .map((v) => v.size)
                        .join(", ");
                      // Get price for this color (assuming same price for all sizes of same color)
                      const price =
                        colorVariants[0]?.price || productData.price;

                      return (
                        <div key={index} className="relative group">
                          <button
                            className={`w-8 h-8 rounded-full cursor-pointer ${selectedVariant?.color === color ? "ring-2 ring-black ring-offset-2" : "border border-gray-300"}`}
                            style={{
                              backgroundColor: color.toLowerCase(),
                            }}
                            onClick={async () => {
                              // Find first variant with this color
                              const variant = variants.find(
                                (v) => v.color === color
                              );
                              setSelectedVariant(variant);

                              // If we have images for this color, set the first one
                              if (
                                variantImages[color] &&
                                variantImages[color].length > 0
                              ) {
                                setImage(variantImages[color][0]);
                              }

                              // Fetch detailed variant information
                              if (variant) {
                                const variantDetail =
                                  await fetchVariantDetails(variant.id);
                                if (variantDetail) {
                                  // Update the selected variant with more details
                                  setSelectedVariant(variantDetail);

                                  // If the variant has images, update the image display
                                  if (
                                    variantDetail.images &&
                                    variantDetail.images.length > 0
                                  ) {
                                    setImage(variantDetail.images[0]);

                                    // Update variant images for this color
                                    setVariantImages((prev) => ({
                                      ...prev,
                                      [color]: variantDetail.images,
                                    }));
                                  }
                                }
                              }
                            }}
                          ></button>
                          {/* Tooltip with variant information */}
                          <div className="absolute z-10 left-0 mt-2 w-48 bg-white shadow-lg rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <p className="text-xs font-medium">{color}</p>
                            <p className="text-xs text-gray-600">
                              {t("AVAILABLE_SIZES")}: {availableSizes}
                            </p>
                            <p className="text-xs text-gray-600">
                              {t("PRICE")}:
                              {(() => {
                                // Use same logic as ProductCard for color variant pricing
                                const originalPrice = colorVariants[0]?.price || price || 0;
                                const finalPrice = colorVariants[0]?.finalPrice || originalPrice;
                                const hasDiscount = finalPrice < originalPrice;
                                const discountPercentage = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

                                return (
                                  <div className="flex items-center gap-1">
                                    {hasDiscount ? (
                                      <>
                                        <span className="text-sm font-medium">
                                          {productData.currency || '$'}{finalPrice}
                                        </span>
                                        <span className="text-xs line-through">
                                          {productData.currency || '$'}{originalPrice}
                                        </span>
                                        <span className="text-red-500 text-xs">
                                          ({discountPercentage}% OFF)
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-sm font-medium">
                                        {productData.currency || '$'}{originalPrice}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">
                {t("SIZE")}: {size ? mapSizeToLabel(size) : "S"}
              </p>
              <div className="mb-4">
                {
                  // Always show all available sizes
                  (() => {
                    // Get all unique sizes from variants
                    const rawSizes =
                      variants.length > 0
                        ? Array.from(new Set(variants.map((v) => v.size))).filter(Boolean)
                        : (productData.sizes || []);
                    // Map to labels and unique
                    const allSizes = Array.from(new Set(rawSizes.map((s) => mapSizeToLabel(s))));

                    return (
                      <div className="flex flex-wrap gap-2">
                        {allSizes.map((sizeItem, index) => {
                          // Find variant with this size and selected color (if any)
                          const matchingVariant = selectedVariant
                            ? variants.find(
                              (v) =>
                                mapSizeToLabel(v.size) === sizeItem &&
                                v.color === selectedVariant.color
                            )
                            : null;

                          // Get available colors for this size
                          const availableColors = variants
                            .filter((v) => mapSizeToLabel(v.size) === sizeItem)
                            .map((v) => v.color);
                          const labelSize = sizeItem;

                          return (
                            <div key={index} className="relative group">
                              <button
                                className={`w-12 h-12 flex items-center justify-center border ${size === labelSize ? "bg-black text-white" : "border-gray-300"} hover:border-gray-500 transition-colors duration-200 cursor-pointer`}
                                onClick={async () => {
                                  setSize(labelSize);

                                  // If we have a matching variant with the selected color, use it
                                  if (matchingVariant) {
                                    // Fetch detailed variant information
                                    const variantDetail =
                                      await fetchVariantDetails(
                                        matchingVariant.id
                                      );
                                    if (variantDetail) {
                                      setSelectedVariant(variantDetail);

                                      // If the variant has images, update the image display
                                      if (
                                        variantDetail.images &&
                                        variantDetail.images.length > 0
                                      ) {
                                        setImage(variantDetail.images[0]);

                                        // Update variant images for this color
                                        if (matchingVariant.color) {
                                          setVariantImages((prev) => ({
                                            ...prev,
                                            [matchingVariant.color]:
                                              variantDetail.images,
                                          }));
                                        }
                                      }
                                    } else {
                                      setSelectedVariant(matchingVariant);
                                    }
                                  }
                                }}
                              >
                                {labelSize}
                              </button>

                              {/* Tooltip showing available colors for this size */}
                              {availableColors.length > 0 && (
                                <div className="absolute z-10 left-0 mt-2 w-48 bg-white shadow-lg rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                  <p className="text-xs font-medium">
                                    {t("SIZE")}: {labelSize}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {t("AVAILABLE_COLORS")}:{" "}
                                    {availableColors.join(", ")}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                }
              </div>

            {/* Variants Table (color/size/waist/length/qty/id) */}
            {variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">{t("VARIANTS")}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-4">Color</th>
                        <th className="py-2 pr-4">Size</th>
                        <th className="py-2 pr-4">Waist</th>
                        <th className="py-2 pr-4">Length</th>
                        <th className="py-2 pr-4">Qty</th>
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...variants]
                        .sort((a,b) => String(a.color||"").localeCompare(String(b.color||"")) || (Number(a.size)||0)-(Number(b.size)||0))
                        .map(v => (
                        <tr key={v.id} className="border-t">
                          <td className="py-2 pr-4">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800">
                              {String(v.color || "-")}
                            </span>
                          </td>
                          <td className="py-2 pr-4">{mapSizeToLabel(v.size)}</td>
                          <td className="py-2 pr-4">{v.waist ?? "-"}</td>
                          <td className="py-2 pr-4">{v.length ?? "-"}</td>
                          <td className="py-2 pr-4">
                            <span className={Number(v.quantity) > 0 ? "" : "text-red-500"}>{v.quantity ?? 0}</span>
                          </td>
                          <td className="py-2 pr-4">{v.id}</td>
                          <td className="py-2 pr-4">
                            <button
                              className="text-xs border px-3 py-1 hover:bg-black hover:text-white transition"
                              onClick={async () => {
                                setSelectedVariant(v);
                                setSize(mapSizeToLabel(v.size));
                                const detail = await fetchVariantDetails(v.id);
                                if (detail?.images?.length) setImage(detail.images[0]);
                              }}
                            >
                              {t("SELECT")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

              {/* Sizing Guide */}
              <div className="flex items-center mb-4">
                <button
                  className="flex items-center text-sm text-gray-700 hover:text-black"
                  onClick={() => setShowSizeGuide(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {t("SIZING_GUIDE")}
                </button>
              </div>

              {/* Size Guide Modal */}
              {showSizeGuide && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        {t("SIZING_GUIDE")}
                      </h3>
                      <button
                        onClick={() => setShowSizeGuide(false)}
                        className="text-gray-500 hover:text-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            {t("EU_SIZE")}
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            {t("US_LABEL_SIZE")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">
                            30 – 32
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            S
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">
                            33 – 35
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            M
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">
                            36 – 38
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            L
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">
                            39 – 41
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            XL
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">
                            42 – 44
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            XXL
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button 
                  className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-sm font-medium min-w-[20px] text-center">{quantity}</span>
                <button 
                  className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  disabled={quantity >= 99}
                >
                  +
                </button>
              </div>
            </div>

            {/* Sold Out Message */}
            {selectedVariant && getCurrentStock(selectedVariant) <= 0 && (
              <div className="text-red-600 font-medium mb-4">
                {t("SOLD_OUT")}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                className={`relative overflow-hidden group cursor-pointer px-8 py-3 text-sm border border-black ${(!size || !selectedVariant?.color) && "opacity-50 cursor-not-allowed"}`}
                style={{
                  background: "white",
                  color: "black",
                  transition: "color 0.3s ease",
                }}
                onClick={() => {
                  if (!size) {
                    toast.warning("Please select a size", {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                    return;
                  }
                  if (!selectedVariant?.color) {
                    toast.warning("Please select a color", {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                    return;
                  }
                  if (getCurrentStock(selectedVariant) <= 0) {
                    toast.error("Not enough quantity in stock for this variant", {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                    return;
                  }
                  addToCart(productData._id, size, selectedVariant?.color, quantity);
                  // Update local stock
                  updateLocalStock(selectedVariant?.id, quantity);
                  toast.success("Product added to cart!", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                }}
                disabled={
                  !size || !selectedVariant?.color
                }
              >
                {/* Animated background */}
                <div
                  className="absolute inset-0 bg-black transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out origin-bottom"
                  style={{ zIndex: -1 }}
                />
                {/* Button text */}
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                {t("ADD_TO_CART")}
                </span>
              </button>
              <button
                className={`cursor-pointer border border-black text-black px-8 py-3 text-sm hover:bg-black hover:text-white transition-colors ${(!size || !selectedVariant?.color) && "opacity-50 cursor-not-allowed"}`}
                disabled={
                  !size || !selectedVariant?.color
                }
              >
                BUY IT NOW
              </button>
            </div>

            {/* Additional Links */}
            <div className="text-sm text-gray-600 space-y-1">
              <p className="underline cursor-pointer hover:text-black">Materials</p>
              <p className="underline cursor-pointer hover:text-black">Shipping & Returns</p>
              <p className="underline cursor-pointer hover:text-black">Care Guide</p>
            </div>

            {/* Variant Details */}
            {selectedVariant && (
              <div className="mt-4 p-4 border border-gray-200 rounded">
                <h3 className="font-medium mb-2">{t("VARIANT_DETAILS")}</h3>

                {/* Variant Images Gallery */}
                {variantImages[selectedVariant.color] &&
                  variantImages[selectedVariant.color].length > 1 && (
                    <div className="mb-4">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {variantImages[selectedVariant.color].map(
                          (img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${selectedVariant.color} variant ${idx + 1}`}
                              className={`w-16 h-16 object-cover cursor-pointer ${image === img ? "border-2 border-black" : "border border-gray-200"}`}
                              onClick={() => setImage(img)}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">{t("COLOR")}:</div>
                  <div>{selectedVariant.color || "-"}</div>

                  <div className="text-gray-600">{t("SIZE")}:</div>
                  <div>{selectedVariant.size || "-"}</div>

                  <div className="text-gray-600">{t("PRICE")}:</div>
                  <div>
                    {(() => {
                      // Use same logic as ProductCard for variant pricing
                      const originalPrice = selectedVariant.price || 0;
                      const finalPrice = selectedVariant.finalPrice || originalPrice;
                      const hasDiscount = finalPrice < originalPrice;
                      const discountPercentage = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

                      return (
                        <div className="flex items-center gap-1">
                          {hasDiscount ? (
                            <>
                              <span className="text-sm font-medium text-gray-900">
                                {productData.currency || '$'}{finalPrice}
                              </span>
                              <span className="text-xs text-gray-500 line-through">
                                {productData.currency || '$'}{originalPrice}
                              </span>
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                                {discountPercentage}% OFF
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">
                              {productData.currency || '$'}{originalPrice}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {selectedVariant.waist && (
                    <>
                      <div className="text-gray-600">{t("WAIST")}:</div>
                      <div>{selectedVariant.waist}</div>
                    </>
                  )}

                  {selectedVariant.length && (
                    <>
                      <div className="text-gray-600">{t("LENGTH")}:</div>
                      <div>{selectedVariant.length}</div>
                    </>
                  )}

                  <div className="text-gray-600">{t("IN_STOCK")}:</div>
                  <div>
                    {getCurrentStock(selectedVariant) > 0
                      ? `${getCurrentStock(selectedVariant)} ${t("ITEMS")}`
                      : t("OUT_OF_STOCK")}
                  </div>
                  
                  {/* Show original stock vs current stock */}
                  {selectedVariant.quantity > 0 && (
                    <>
                      <div className="text-gray-600">Original Stock:</div>
                      <div>{selectedVariant.quantity} {t("ITEMS")}</div>
                    </>
                  )}
                  
                  {/* Show items in cart */}
                  {localStock[selectedVariant.id] > 0 && (
                    <>
                      <div className="text-gray-600">In Cart:</div>
                      <div className="text-orange-600 font-medium">{localStock[selectedVariant.id]} {t("ITEMS")}</div>
                    </>
                  )}

                  {selectedVariant.id && (
                    <>
                      <div className="text-gray-600">{t("VARIANT_ID")}:</div>
                      <div>{selectedVariant.id}</div>
                    </>
                  )}
                </div>
              </div>
            )}
            <hr className="border-gray-200 mt-8 sm:w-4/5" />
            <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
              <p>{t("PRODUCT_ORIGINAL")}</p>
              <p>{t("PRODUCT_COD")}</p>
              <p>{t("PRODUCT_RETURN_POLICY")}</p>
            </div>
          </div>
        </div>

      </motion.div>
      {/* Description & Reviews Section */}
      <div className="mt-20">
        <div className="flex">
          <b className="border border-gray-200 px-5 py-3 text-sm">
            {t("DESCRIPTION")}
          </b>
          <p className="border border-gray-200 px-5 py-3 text-sm">
            {t("REVIEWS")} (122)
          </p>
        </div>
        <div className="flex flex-col gap-4 border border-gray-200 px-6 py-6 text-sm text-gray-500">
          <p>{t("PRODUCT_DESC_1")}</p>
          <p>{t("PRODUCT_DESC_2")}</p>
        </div>
      </div>

      {/* Product Video Section */}
      <div className="w-full flex justify-center items-center my-10">
        <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://player.vimeo.com/video/1039701935?background=1"
            title={t("PRODUCT_VIDEO")}
            frameBorder="0"
            allow="autoplay; encrypted-media;"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            tabIndex="-1"
          ></iframe>
        </div>
      </div>

      {/* Scroll Section */}
      <div
        ref={scrollSectionRef}
        className="-mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]"
      >
        <ScrollSectionProduct
          scroll1={assets.scroll1_max}
          scroll2={assets.scroll2_max}
        />
      </div>

      {/* HeroBanner full width */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <HeroBanner collectionId={2}/>
      </div>

      {/* Related Products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />

      {/* Sticky Animated Rectangle and Modal Dropdown */}
      <AnimatePresence>
        {isScrollSectionInView && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: "fixed",
              bottom: "80px",
              right: "40px",
              background: "white",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              padding: "20px",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: "16px",
              minWidth: "400px",
              maxWidth: "440px",
            }}
          >
            <img
              src={productData.image[0]}
              alt="Product"
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  marginBottom: 2,
                  letterSpacing: "0.02px",
                }}
              >
                {productData.name}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#222", fontWeight: "normal" }}>
                {productData.currency}
                {productData.price}
              </div>
              
              {/* Current Stock Display in Rectangle */}
              {selectedVariant && (
                <div style={{ fontSize: "0.75rem", color: "#666", marginTop: 4 }}>
                  Stock: {getCurrentStock(selectedVariant)} items
                  {localStock[selectedVariant.id] > 0 && (
                    <span style={{ color: "#f97316", marginLeft: 8 }}>
                      ({localStock[selectedVariant.id]} in cart)
                    </span>
                  )}
                </div>
              )}
              
              {/* Color and Size Selection in Rectangle */}
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {/* Color Selection */}
                {variants.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 500, marginBottom: 4, color: "#666" }}>
                      Color: {selectedVariant?.color || "Select"}
            </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {Array.from(new Set(variants.map((v) => v.color)))
                        .filter(Boolean)
                        .slice(0, 3) // Show only first 3 colors in rectangle
                        .map((color, index) => (
                          <button
                            key={index}
                            onClick={async () => {
                              const variant = variants.find((v) => v.color === color);
                              setSelectedVariant(variant);
                              if (variant) {
                                const variantDetail = await fetchVariantDetails(variant.id);
                                if (variantDetail) {
                                  setSelectedVariant(variantDetail);
                                  if (variantDetail.images && variantDetail.images.length > 0) {
                                    setImage(variantDetail.images[0]);
                                    setVariantImages((prev) => ({
                                      ...prev,
                                      [color]: variantDetail.images,
                                    }));
                                  }
                                }
                              }
                            }}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: selectedVariant?.color === color ? "2px solid #000" : "1px solid #ccc",
                              backgroundColor: color.toLowerCase(),
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          />
                        ))}
                      {variants.length > 3 && (
                        <span style={{ fontSize: "0.7rem", color: "#999", alignSelf: "center" }}>
                          +{variants.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 500, marginBottom: 4, color: "#666" }}>
                    Size: {size || "Select"}
                  </div>
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {(() => {
                      // Get all unique sizes from variants
                      const rawSizes =
                        variants.length > 0
                          ? Array.from(new Set(variants.map((v) => v.size))).filter(Boolean)
                          : (productData.sizes || []);
                      const allSizes = Array.from(new Set(rawSizes.map((s) => mapSizeToLabel(s))));

                      return allSizes.slice(0, 4).map((labelSize, index) => (
                        <button
                          key={index}
                          onClick={async () => {
                            setSize(labelSize);
                            // Find matching variant with selected color and size
                            const matchingVariant = selectedVariant?.color
                              ? variants.find(
                                  (v) =>
                                    mapSizeToLabel(v.size) === labelSize &&
                                    v.color === selectedVariant.color
                                )
                              : variants.find((v) => mapSizeToLabel(v.size) === labelSize);

                            if (matchingVariant) {
                              const variantDetail = await fetchVariantDetails(matchingVariant.id);
                              if (variantDetail) {
                                setSelectedVariant(variantDetail);
                                if (variantDetail.images && variantDetail.images.length > 0) {
                                  setImage(variantDetail.images[0]);
                                  if (matchingVariant.color) {
                                    setVariantImages((prev) => ({
                                      ...prev,
                                      [matchingVariant.color]: variantDetail.images,
                                    }));
                                  }
                                }
                              } else {
                                setSelectedVariant(matchingVariant);
                              }
                            }
                          }}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "2px",
                            border: size === labelSize ? "2px solid #000" : "1px solid #ccc",
                            backgroundColor: size === labelSize ? "#000" : "transparent",
                            color: size === labelSize ? "#fff" : "#000",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontSize: "0.7rem",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {labelSize}
                        </button>
                      ));
                    })()}
                    {(() => {
                      const rawSizes =
                        variants.length > 0
                          ? Array.from(new Set(variants.map((v) => v.size))).filter(Boolean)
                          : (productData.sizes || []);
                      const allSizes = Array.from(new Set(rawSizes.map((s) => mapSizeToLabel(s))));
                      return allSizes.length > 4 && (
                        <span style={{ fontSize: "0.7rem", color: "#999", alignSelf: "center" }}>
                          +{allSizes.length - 4}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <button
              style={{
                marginLeft: 16,
                color: "black",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 100,
                fontSize: "3rem",
                lineHeight: 1,
              }}
              onClick={() => {
                if (!size) {
                  toast.warning("Please select a size", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                  return;
                }
                if (!selectedVariant?.color) {
                  toast.warning("Please select a color", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                  return;
                }
                if (getCurrentStock(selectedVariant) <= 0) {
                  toast.error("Not enough quantity in stock for this variant", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                  return;
                }
                 // Add to cart immediately when both size and color are selected
                 addToCart(productData._id, size, selectedVariant?.color, quantity);
                 // Update local stock
                 updateLocalStock(selectedVariant?.id, quantity);
                 toast.success("Product added to cart!", {
                   position: "top-right",
                   autoClose: 2000,
                   hideProgressBar: false,
                   closeOnClick: true,
                   pauseOnHover: true,
                   draggable: true,
                 });
              }}
            >
              +
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isScrollSectionInView && showModal && (
          <motion.div
            key="popover"
            initial={{ opacity: 0, y: 100 }}   // يبدأ من تحت
            animate={{ opacity: 1, y: 0 }}     // يتحرك لمكانه الطبيعي
            exit={{ opacity: 0, y: 100 }}      // يرجع لتحت عند الخروج
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: "160px",
              right: "40px",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              padding: 32,
              zIndex: 1100,
              minWidth: 340,
              maxWidth: 480,
              width: "90vw",
            }}
          >
            {/* Arrow Pointer */}
            <div
              style={{
                position: "absolute",
                left: "auto",
                right: 24,
                bottom: -16,
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "16px solid white",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.10))",
              }}
            />
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#888",
                zIndex: 1200,
              }}
              aria-label="Close"
            >
              ×
            </button>
            {/* Product Image and Info */}
            <div
              style={{
                display: "flex",
                gap: 24,
                alignItems: "flex-start",
                marginBottom: 24,
              }}
            >
              <img
                src={productData.image[0]}
                alt="Product"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    marginBottom: 4,
                  }}
                >
                  {productData.name}
                </div>
                <div
                  style={{ fontSize: "1.2rem", color: "#222", marginBottom: 8 }}
                >
                  {productData.currency}
                  {productData.price}
                </div>
              </div>
            </div>
            {/* Size Selection */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                {t("SELECT_SIZE")}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  // Get all unique sizes from variants
                  const rawSizes =
                    variants.length > 0
                      ? Array.from(new Set(variants.map((v) => v.size))).filter(Boolean)
                      : (productData.sizes || []);
                  const allSizes = Array.from(new Set(rawSizes.map((s) => mapSizeToLabel(s))));

                  return allSizes.map((labelSize, index) => {

                    return (
                      <button
                        key={index}
                        className={`h-12 flex items-center justify-center border ${size === labelSize ? "bg-black text-white" : "border-gray-300"} hover:border-gray-500 transition-colors duration-200 cursor-pointer`}
                        onClick={() => setSize(labelSize)}
                      >
                        {labelSize}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
            {/* Add to Cart Button */}
            <button
              className={`relative overflow-hidden group cursor-pointer px-8 py-3 text-sm border border-black ${(!size || !selectedVariant?.color) && "opacity-50 cursor-not-allowed w-full"}`}
              style={{
                background: "white",
                color: "black",
                transition: "color 0.3s ease",
              }}
              onClick={() => {
                 if (!size) {
                   toast.warning("Please select a size", {
                     position: "top-right",
                     autoClose: 3000,
                     hideProgressBar: false,
                     closeOnClick: true,
                     pauseOnHover: true,
                     draggable: true,
                   });
                   return;
                 }
                 if (!selectedVariant?.color) {
                   toast.warning("Please select a color", {
                     position: "top-right",
                     autoClose: 3000,
                     hideProgressBar: false,
                     closeOnClick: true,
                     pauseOnHover: true,
                     draggable: true,
                   });
                   return;
                 }
                 if (getCurrentStock(selectedVariant) <= 0) {
                   toast.error("Not enough quantity in stock for this variant", {
                     position: "top-right",
                     autoClose: 3000,
                     hideProgressBar: false,
                     closeOnClick: true,
                     pauseOnHover: true,
                     draggable: true,
                   });
                   return;
                 }
                 addToCart(productData._id, size, selectedVariant?.color, quantity);
                 // Update local stock
                 updateLocalStock(selectedVariant?.id, quantity);
                 setShowModal(false);
                  toast.success("Product added to cart!", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
               }}
              disabled={
                !size || !selectedVariant?.color
              }
            >
              {/* Animated background */}
              <div
                className="absolute inset-0 bg-black transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out origin-bottom"
                style={{ zIndex: -1 }}
              />
              {/* Button text */}
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
              {t("ADD_TO_CART")}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;

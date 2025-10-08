import { createContext, useState, useEffect } from "react";
// import { products } from "../assets/frontend_assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchWithTokenRefresh, getAuthHeaders } from "../utils/apiUtils";
<<<<<<< HEAD
=======
import wishlistService from "../services/wishlistService";
import discountService from "../services/discountService";
>>>>>>> f928bb6 (last update)
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : {};
  });
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    console.log("Token from localStorage:", storedToken);
    return storedToken || "";
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

<<<<<<< HEAD
=======
  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

>>>>>>> f928bb6 (last update)
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      const userData = localStorage.getItem("user");
      
      if (!refreshTokenValue) {
        console.log("No refresh token available");
        return false;
      }

      if (!userData) {
        console.log("No user data available");
        return false;
      }

      const user = JSON.parse(userData);
      const userId = user.id || user.userId;

      if (!userId) {
        console.log("No user ID available");
        return false;
      }

      const response = await fetch(`${backendUrl}/api/Account/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue,
          userId: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.responseBody && data.responseBody.data) {
          const tokenData = data.responseBody.data;
          localStorage.setItem("token", tokenData.token);
          localStorage.setItem("refreshToken", tokenData.refreshToken);
          setToken(tokenData.token);
          console.log("Token refreshed successfully");
          return true;
        }
      }

      console.log("Failed to refresh token");
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };
  const navigate = useNavigate();

  // Resolve variant id by size from Fashion-main variants API (best-effort)
  const resolveVariantId = async (productId, sizeLabel) => {
    if (!sizeLabel) return null;
    try {
      const response = await fetch(
        `${backendUrl}/api/Products/${productId}/Variants`
      );
      if (!response.ok) return null;
      const data = await response.json();
      const variants = data?.responseBody?.data || [];

      // Helper function to map size label to numeric range
      const mapSizeLabelToRange = (label) => {
        const upper = String(label).toUpperCase();
        switch (upper) {
          case 'S': return { min: 30, max: 32 };
          case 'M': return { min: 33, max: 35 };
          case 'L': return { min: 36, max: 38 };
          case 'XL': return { min: 39, max: 41 };
          case 'XXL': return { min: 42, max: 44 };
          default: return null;
        }
      };

      // First try exact string match
      let match = variants.find(
        (v) => String(v.size || "").toLowerCase() === String(sizeLabel).toLowerCase()
      );

      // If no exact match, try numeric range matching
      if (!match) {
        const range = mapSizeLabelToRange(sizeLabel);
        if (range) {
          match = variants.find((v) => {
            const variantSize = Number(v.size);
            return variantSize >= range.min && variantSize <= range.max;
          });
        }
      }

      // If still no match and we have variants, try to find any variant with available quantity
      if (!match && variants.length > 0) {
        console.warn(`No variant found for size ${sizeLabel}, trying to use first available variant`);
        match = variants.find(v => v.quantity > 0) || variants[0];
      }

      console.log('resolveVariantId:', { productId, sizeLabel, variants, match });
      return match?.id || null;
    } catch (e) {
      console.log("resolveVariantId error", e);
      return null;
    }
  };

  const addToCart = async (itemId, size, color, quantity = 1) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    if (!color) {
      toast.error("Please select a color");
      return;
    }

    const itemKey = `${size}_${color}`; // Create unique key for size+color combination

    // Check if item with same ID, size, and color already exists in cart
    let itemExists = false;
    if (cartItems[itemId] && cartItems[itemId][itemKey]) {
      itemExists = true;
    }

    if (itemExists) {
      toast.error("Item with this size and color is already in cart");
      return;
    }

    // Add item to cart
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][itemKey] = quantity;
    } else {
      cartData[itemId] = {};
      cartData[itemId][itemKey] = quantity;
    }
    setCartItems(cartData);

    // Handle server-side cart update if user is logged in
    if (token) {
      try {
        console.log("Adding to cart with token:", token);
        const productVariantId = await resolveVariantId(itemId, size);

        if (!productVariantId) {
          toast.error("No variant found for the selected size. Please try a different size.");
          // Revert local cart changes
          setCartItems(cartItems);
          return;
        }

        console.log("Using variant ID:", productVariantId);
        const response = await fetchWithTokenRefresh(
          `${backendUrl}/api/Cart/items`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json-patch+json'
            },
            body: JSON.stringify({
              productId: Number(itemId),
              quantity: quantity,
              productVariantId: productVariantId,
            }),
          },
          refreshToken
        );

        const data = await response.json();
        console.log("Add to cart response:", data);

        if (response.ok && data.responseBody) {
          toast.success(data.responseBody.message || "Product added to cart");
          await fetchUserCart();

        } else {
          const errorMessage = data.responseBody?.message || data.message || "Failed to add product to cart";
          toast.error(errorMessage);
          console.error("Add to cart error:", data);
          // Revert local cart changes on server error
          setCartItems(cartItems);
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        toast.error("Error adding product to cart. Please try again.");
        // Revert local cart changes on error
        setCartItems(cartItems);
      }
    } else {
      // Show success message for guest users
      toast.success("Product added to cart");
    }
  };

  const getCartCount = () => {
    let total = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            total += cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return total;
  };

  const updataQuantity = async (itemId, size, color, quantity) => {
    let cartData = structuredClone(cartItems);
    // Handle both old format (no color) and new format (with color)
    const itemKey = color ? `${size}_${color}` : size;
    cartData[itemId][itemKey] = quantity;
    setCartItems(cartData);

    // Update cart in backend if user is logged in
    if (token) {
      try {
        const variantId = await resolveVariantId(itemId, size);
        if (!variantId) {
          console.log("Variant not found for size; skipping backend update");
          return;
        }
        console.log("Updating cart with token:", token);
        await fetchWithTokenRefresh(
          `${backendUrl}/api/Cart/items/${Number(itemId)}/${Number(variantId)}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity: Number(quantity) }),
          },
          refreshToken
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCartAmount = () => {
    let amount = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          const product = products.find(p => p._id === itemId);
          if (product && product.finalPrice) {
            amount += product.finalPrice * cartItems[itemId][size];
          }
        }
      }
    }
    return amount;
  };


  const getProducts = async () => {
    try {
<<<<<<< HEAD
      const res = await fetch(`${backendUrl}/api/Products?page=1&pageSize=100`);
      const data = await res.json();
      const list = data?.responseBody?.data || [];
      // Transform to UI shape expected by the app
      const transformed = list.map((p) => ({
        _id: String(p.id),
        name: p.name,
        description: p.description,
        price: p.price, // Original price
        finalPrice: p.finalPrice, // Final/discounted price
        image: Array.isArray(p.images)
          ? p.images
            .map((img) => img.url || img.imageUrl || img.Url)
            .filter(Boolean)
          : p.mainImageUrl
            ? [p.mainImageUrl]
            : [],
        isActive: p.isActive,
        currency: currency,
        // Best-effort fields to minimize downstream changes
        category: p.categoryName || p.category?.name,
        subCategory: p.subCategoryName || p.subCategory?.name,
        sizes: (p.variants || []).map((v) => v.size).filter(Boolean),
      }));
      setProducts(transformed);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load products");
=======
      // First, get all products using the discount service
      const productsResult = await discountService.getAllProducts(1, 100, refreshToken);
      
      if (!productsResult.success) {
        throw new Error(productsResult.error);
      }

      const allProducts = productsResult.data;
      console.log('ShopContext - All products from discount service:', allProducts);

      // Get discount information for each product using the same logic as TypeProduct.jsx
      const productsWithDiscounts = await Promise.all(
        allProducts.map(async (product) => {
          try {
            const discountResult = await discountService.getProductDetails(product.id, refreshToken);
            
            if (discountResult.success && discountResult.data) {
              const productData = discountResult.data;
              const discount = productData.discount;
              
              if (discount && discount.isActive) {
                const originalPrice = productData.price || 0;
                const finalPrice = productData.finalPrice || originalPrice;
                const discountPercentage = discount.discountPercent || 0;
                
                return {
                  _id: String(productData.id),
                  name: productData.name,
                  description: productData.description,
                  price: originalPrice,
                  finalPrice: finalPrice,
                  discountPercentage: discountPercentage,
                  discountPrecentage: discountPercentage, // API field name
                  discountName: discount.name,
                  discountDescription: discount.description,
                  startDate: discount.startDate,
                  endDate: discount.endDate,
                  image: Array.isArray(productData.images)
                    ? productData.images
                      .map((img) => img.url || img.imageUrl || img.Url)
                      .filter(Boolean)
                    : productData.mainImageUrl
                      ? [productData.mainImageUrl]
                      : [],
                  isActive: productData.isActive,
                  currency: currency,
                  category: productData.categoryName || productData.category?.name,
                  subCategory: productData.subCategoryName || productData.subCategory?.name,
                  sizes: (productData.variants || []).map((v) => v.size).filter(Boolean),
                };
              }
            }
            
            // Fallback to basic discount calculation if no discount API data
            const originalPrice = product.price || 0;
            const finalPrice = product.finalPrice || originalPrice;
            const discountPercentage = originalPrice > 0 && finalPrice < originalPrice 
              ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
              : 0;
            
            return {
              _id: String(product.id),
              name: product.name,
              description: product.description,
              price: originalPrice,
              finalPrice: finalPrice,
              discountPercentage: discountPercentage,
              discountPrecentage: discountPercentage, // API field name
              discountName: product.discountName || null,
              image: Array.isArray(product.images)
                ? product.images
                  .map((img) => img.url || img.imageUrl || img.Url)
                  .filter(Boolean)
                : product.mainImageUrl
                  ? [product.mainImageUrl]
                  : [],
              isActive: product.isActive,
              currency: currency,
              category: product.categoryName || product.category?.name,
              subCategory: product.subCategoryName || product.subCategory?.name,
              sizes: (product.variants || []).map((v) => v.size).filter(Boolean),
            };
          } catch (error) {
            console.error(`Error fetching discount for product ${product.id}:`, error);
            // Return basic product data if discount fetch fails
            return {
              _id: String(product.id),
              name: product.name,
              description: product.description,
              price: product.price || 0,
              finalPrice: product.finalPrice || product.price || 0,
              discountPercentage: 0,
              discountPrecentage: 0,
              discountName: null,
              image: Array.isArray(product.images)
                ? product.images
                  .map((img) => img.url || img.imageUrl || img.Url)
                  .filter(Boolean)
                : product.mainImageUrl
                  ? [product.mainImageUrl]
                  : [],
              isActive: product.isActive,
              currency: currency,
              category: product.categoryName || product.category?.name,
              subCategory: product.subCategoryName || product.subCategory?.name,
              sizes: (product.variants || []).map((v) => v.size).filter(Boolean),
            };
          }
        })
      );

      console.log('ShopContext - Products with discount data:', productsWithDiscounts);
      setProducts(productsWithDiscounts);
    } catch (error) {
      console.error('Error fetching products with discounts:', error);
      toast.error("Failed to load products");
      
      // Fallback to basic API call if discount service fails
      try {
        const res = await fetch(`${backendUrl}/api/Products?page=1&pageSize=100`);
        const data = await res.json();
        const list = data?.responseBody?.data || [];
        
        const transformed = list.map((p) => ({
          _id: String(p.id),
          name: p.name,
          description: p.description,
          price: p.price,
          finalPrice: p.finalPrice,
          discountPrecentage: p.discountPrecentage || 0,
          discountName: p.discountName || null,
          image: Array.isArray(p.images)
            ? p.images
              .map((img) => img.url || img.imageUrl || img.Url)
              .filter(Boolean)
            : p.mainImageUrl
              ? [p.mainImageUrl]
              : [],
          isActive: p.isActive,
          currency: currency,
          category: p.categoryName || p.category?.name,
          subCategory: p.subCategoryName || p.subCategory?.name,
          sizes: (p.variants || []).map((v) => v.size).filter(Boolean),
        }));
        
        setProducts(transformed);
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
        toast.error("Failed to load products");
      }
>>>>>>> f928bb6 (last update)
    }
  };

  const fetchUserCart = async () => {
    if (!token) return;
    
    try {
      console.log("Fetching user cart from server...");
      const response = await fetchWithTokenRefresh(
        `${backendUrl}/api/Cart`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
        refreshToken
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Cart fetch response:", data);
        
        if (data.responseBody && data.responseBody.data) {
          let serverCartItems = data.responseBody.data;
          
          // Handle different response structures
          if (serverCartItems.items) {
            serverCartItems = serverCartItems.items;
          }
          
          // Ensure we have an array
          if (!Array.isArray(serverCartItems)) {
            console.log("Server cart data is not an array:", serverCartItems);
            setCartItems({});
            return;
          }
          
          // Transform server cart format to local cart format
          const transformedCart = {};
          serverCartItems.forEach(item => {
            const productId = item.productId || item.product?.id;
            const size = item.productVariant?.size || item.size || 'default';
            const color = item.productVariant?.color || item.color || 'default';
            const quantity = item.quantity || 1;
            
            if (productId) {
              const itemKey = `${size}_${color}`;
              if (!transformedCart[productId]) {
                transformedCart[productId] = {};
              }
              transformedCart[productId][itemKey] = quantity;
            }
          });
          
          console.log("Transformed cart:", transformedCart);
          setCartItems(transformedCart);
        } else {
          console.log("No cart data in response");
          setCartItems({});
        }
      } else {
        console.log("Failed to fetch cart:", response.status);
        setCartItems({});
      }
    } catch (error) {
      console.error("Error fetching user cart:", error);
    }
  };

  // Fetch user's cart data from the backend
  useEffect(() => {
    getProducts();
    clearLocalStorageCart();
  }, []);

  useEffect(() => {
    if (token) {
      console.log("Token available, fetching user cart...");
      fetchUserCart();
<<<<<<< HEAD
    } else {
      console.log("No token, clearing cart");
      setCartItems({});
=======
      fetchWishlist();
    } else {
      console.log("No token, clearing cart and wishlist");
      setCartItems({});
      setWishlistItems([]);
>>>>>>> f928bb6 (last update)
    }
  }, [token]);

  const clearCart = async () => {
    if (token) {
      try {
        console.log("Clearing cart with token:", token);
        const res = await fetch(`${backendUrl}/api/Cart/clear`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          setCartItems({});
          toast.success("Cart cleared successfully");
        } else {
          toast.error("Failed to clear cart");
        }
      } catch (error) {
        console.log("Error clearing cart:", error.message);
        if (error.response) {
          console.log(
            "Error response:",
            error.response.status,
            error.response.data
          );
        }
        toast.error("Failed to clear cart");
      }
    } else {
      // Clear local cart if not logged in
      setCartItems({});
      toast.success("Cart cleared successfully");
    }
  };

  const clearLocalStorageCart = () => {
    localStorage.removeItem("cartItems");
  };

<<<<<<< HEAD
=======
  // Wishlist functions
  const addToWishlist = async (productId) => {
    if (!token) {
      toast.error("Please log in to add items to wishlist");
      return false;
    }

    setWishlistLoading(true);
    try {
      const result = await wishlistService.addToWishlist(productId, refreshToken);
      
      if (result.success) {
        toast.success(result.message);
        // Refresh wishlist to get updated data
        await fetchWishlist();
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Error adding product to wishlist");
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!token) {
      toast.error("Please log in to manage wishlist");
      return false;
    }

    setWishlistLoading(true);
    try {
      const result = await wishlistService.removeFromWishlist(productId, refreshToken);
      
      if (result.success) {
        toast.success(result.message);
        // Refresh wishlist to get updated data
        await fetchWishlist();
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Error removing product from wishlist");
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!token) {
      setWishlistItems([]);
      return;
    }

    setWishlistLoading(true);
    try {
      const result = await wishlistService.getWishlist(1, 100, refreshToken);
      
      if (result.success) {
        console.log("Wishlist data received:", result.data);
        setWishlistItems(result.data || []);
      } else {
        console.error("Error fetching wishlist:", result.error);
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  const isInWishlist = async (productId) => {
    if (!token) return false;

    try {
      const result = await wishlistService.isInWishlist(productId, refreshToken);
      return result.success ? result.data : false;
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      return false;
    }
  };

  const clearWishlist = async () => {
    if (!token) {
      toast.error("Please log in to manage wishlist");
      return false;
    }

    setWishlistLoading(true);
    try {
      const result = await wishlistService.clearWishlist(refreshToken);
      
      if (result.success) {
        toast.success(result.message);
        setWishlistItems([]);
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Error clearing wishlist");
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

>>>>>>> f928bb6 (last update)
  const checkout = async () => {
    if (token) {
      try {
        const response = await fetchWithTokenRefresh(
          `${backendUrl}/api/Cart/checkout`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          },
          refreshToken
        );

        const data = await response.json();
        if (response.ok && data.responseBody) {
          // Instead of just clearing locally, fetch the actual cart state from server
          await fetchUserCart();
          toast.success(data.responseBody.message || "Checkout successful");
          return true;
        } else {
          toast.error(data.responseBody?.message || "Checkout failed");
          return false;
        }
      } catch (error) {
        console.log("Error during checkout:", error.message);
        if (error.response) {
          console.log(
            "Error response:",
            error.response.status,
            error.response.data
          );
        }
        toast.error("Checkout failed");
        return false;
      }
    } else {
      toast.error("Please log in to checkout");
      return false;
    }
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updataQuantity,
    getCartAmount,
    clearCart,
    checkout, // 
    navigate,
    backendUrl,
    getProducts,
    token,
    setToken,
    refreshToken,
    user,
    setUser,
    clearLocalStorageCart,
<<<<<<< HEAD
    fetchUserCart
=======
    fetchUserCart,
    // Wishlist functions
    wishlistItems,
    wishlistLoading,
    addToWishlist,
    removeFromWishlist,
    fetchWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount
>>>>>>> f928bb6 (last update)
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;

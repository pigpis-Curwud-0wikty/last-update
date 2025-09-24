import React, { useContext, useState, useEffect } from 'react'
import Title from './Title'
import { ShopContext } from '../context/ShopContext'
import ProductCard from './ProductCard'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next';

const ReelDenim = () => {
    const { t } = useTranslation();
    const { backendUrl } = useContext(ShopContext);

    const [denimProducts, setDenimProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [subcategory, setSubcategory] = useState(null);

    useEffect(() => {
        const fetchDenimProducts = async () => {
            try {
                setLoading(true);
                setError("");

                // هات كل الـ Subcategories
                const subcategoriesResponse = await fetch(
                    `${backendUrl}/api/subcategories?isActive=true&includeDeleted=false`
                );
                const subcategoriesData = await subcategoriesResponse.json();

                if (subcategoriesResponse.ok && subcategoriesData.responseBody) {
                    const subcategories = subcategoriesData.responseBody.data || [];

                    // دور على Subcategory اسمها Denim
                    const denimSubcategory = subcategories.find(
                        sub => sub.name?.toLowerCase() === "denim"
                    );

                    if (denimSubcategory) {
                        setSubcategory(denimSubcategory);

                        // هات المنتجات الخاصة بالـ Denim
                        const productsResponse = await fetch(
                            `${backendUrl}/api/products?subCategoryId=${denimSubcategory.id}&isActive=true&includeDeleted=false&page=1&pageSize=50`
                        );
                        const productsData = await productsResponse.json();

                        if (
                            productsResponse.ok &&
                            Array.isArray(productsData.responseBody?.data)
                        ) {
                            setDenimProducts(productsData.responseBody.data);
                        } else {
                            setDenimProducts([]);
                        }
                    } else {
                        setError("Denim subcategory not found");
                        setDenimProducts([]);
                    }
                } else {
                    setError(subcategoriesData.message || "Failed to load subcategories");
                }
            } catch (err) {
                console.error("Error fetching Denim products:", err);
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDenimProducts();
    }, [backendUrl]);

    return (
        <motion.div
            className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: "-100px" }}
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut" },
                },
            }}
        >
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-600 p-4 bg-red-100 rounded-md">
                    {error}
                </div>
            ) : (
                <>
                    {/* Subcategory Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl md:text-3xl tracking-wide mb-3 sm:mb-4 uppercase">
                            <Title text1={t('REEL')} text2={t('DENIM_COLLECTION')} />
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base max-w-3xl mx-auto px-4">
                            {t('DENIM_DESCRIPTION')}
                        </p>
                    </div>

                    {/* Products Grid */}
                    {denimProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                            {denimProducts.slice(0, 8).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 my-8">
                            <p className="text-sm sm:text-base">{t('NO_DENIM_PRODUCTS')}</p>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    )
}

export default ReelDenim

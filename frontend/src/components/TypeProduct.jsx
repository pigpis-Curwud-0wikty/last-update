import React, { useContext, useMemo } from 'react'
import { assets } from '../assets/frontend_assets/assets'
import { useNavigate } from 'react-router-dom'
import Title from './Title'
import { useTranslation } from 'react-i18next';
import { ShopContext } from '../context/ShopContext'

const TypeProduct = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { products, currency } = useContext(ShopContext);

    // Calculate the two products with the biggest discounts
    const topDiscountedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];

        // Filter products that have discounts and calculate discount percentage
        const discountedProducts = products
            .filter(product => {
                const originalPrice = product.price || 0;
                const finalPrice = typeof product.finalPrice === "number" ? product.finalPrice : originalPrice;
                return finalPrice < originalPrice && originalPrice > 0;
            })
            .map(product => {
                const originalPrice = product.price || 0;
                const finalPrice = typeof product.finalPrice === "number" ? product.finalPrice : originalPrice;
                const discountPercentage = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
                return {
                    ...product,
                    discountPercentage
                };
            })
            .sort((a, b) => b.discountPercentage - a.discountPercentage) // Sort by discount percentage descending
            .slice(0, 2); // Get top 2

        return discountedProducts;
    }, [products]);

    // Fallback to default images if no discounted products found
    const getProductImage = (product, index) => {
        if (product && product.image && product.image.length > 0) {
            return product.image[0];
        }
        // Fallback to default images
        return index === 0 ? assets.baggey4 : assets.baggey3;
    };

    const getProductName = (product) => {
        return product ? product.name : t('NEWEST_DROP');
    };

    const getProductDescription = (product) => {
        return product ? product.description || t('BALLON_FIT') : t('BALLON_FIT');
    };

    const getProductId = (product, index) => {
        return product ? product._id : (index === 0 ? '15' : '14');
    };

    return (
        <div className='my-10 overflow-hidden px-4 sm:px-[2vw] md:px-[2vw] lg:px-[3vw]'>
            <div className='text-center py-8'>
                <h1 className="text-xl sm:text-2xl md:text-3xl tracking-wide mb-3 sm:mb-4 uppercase">
                    <Title text1={t('BIG')} text2={t('DISCOUNTS')} />
                </h1>
                <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
                    {t('DISCOVER_BIGGEST_SAVINGS')}
                </p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6'>
                {[0, 1].map((index) => {
                    const product = topDiscountedProducts[index];
                    return (
                        <div key={index} className='col-span-1 relative group bg-[#111111]'>
                            <img
                                src={getProductImage(product, index)}
                                alt={getProductName(product)}
                                className='w-full h-full object-cover transition-transform duration-300'
                            />
                            {product && Number(product.discountPercentage) > 0 && (
                                <div
                                    className='absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold'
                                    title={`${product.discountPercentage}% off`}
                                    aria-label={`${product.discountPercentage}% off`}
                                >
                                    -{Number(product.discountPercentage)}%
                                </div>
                            )}
                            <div className='absolute bottom-0 left-0 w-full h-full p-4 flex flex-col gap-2 items-start justify-end py-15 px-10'>
                                <h1 className='text-white text-4xl font-medium mb-2'>
                                    {getProductName(product)}
                                </h1>
                                <p className='text-white text-sm font-base mb-2'>
                                    {getProductDescription(product)}
                                </p>
                                {product && (
                                    <div className='flex items-center gap-2 mb-2'>
                                        <span className='text-white text-lg line-through opacity-75'>
                                            {currency}{product.price}
                                        </span>
                                        <span className='text-red-400 text-xl font-bold'>
                                            {currency}{product.finalPrice}
                                        </span>
                                    </div>
                                )}
                                <button
                                    className='text-black border border-white cursor-pointer text-sm font-medium bg-white px-8 py-3 hover:bg-[#111111] hover:border-white hover:text-white transition-all duration-300'
                                    onClick={() => navigate(`/product/${getProductId(product, index)}`)}
                                >
                                    {t('SHOP_NOW')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default TypeProduct
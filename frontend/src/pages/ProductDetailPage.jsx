import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiArrowLeft, FiStar, FiPackage, FiTruck } from 'react-icons/fi';
import { getPrimaryProductImageUrl, getProductImageUrls } from '../utils/productImages';

export default function ProductDetailPage() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    productApi.getById(id)
      .then(r => {
        setProduct(r.data);
        setSelectedImage(getPrimaryProductImageUrl(r.data, '600/700'));
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAdding(true);

    try {
      await addToCart(product.id, qty);

      toast.success('Added to cart!', {
        style: {
          background: '#181818',
          color: '#C9A84C',
          border: '1px solid #2A2A2A'
        }
      });

    } catch {
      toast.error('Failed to add to cart');
    }

    finally {
      setAdding(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!product) return null;

  const discount =
    product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const galleryImages = getProductImageUrls(product);
  const mainImage = selectedImage || getPrimaryProductImageUrl(product, '600/700');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gold-500 font-sans text-sm mb-8 transition-colors"
      >
        <FiArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

        {/* IMAGE SECTION */}
        <div className="w-full max-w-xl mx-auto md:mx-0">

          {/* Main Image */}
          <div className="relative mb-4">
            <div className="aspect-[4/5] bg-luxe-dark overflow-hidden border border-luxe-border">
              <img
                src={mainImage}
                alt={product.name}
                loading="eager"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {discount && (
              <span className="absolute top-4 left-4 bg-gold-500 text-luxe-black font-bold text-sm px-3 py-1">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* THUMBNAILS */}
          {galleryImages.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {galleryImages.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`${product.name} view ${index + 1}`}
                  loading="lazy"
                  onClick={() => setSelectedImage(imageUrl)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 object-cover object-center cursor-pointer border 
                  ${mainImage === imageUrl ? 'border-gold-500' : 'border-luxe-border'}
                  hover:border-gold-500`}
                />
              ))}
            </div>
          )}

        </div>

        {/* DETAILS */}
        <div className="flex flex-col">

          <p className="font-sans text-xs text-gold-500 tracking-widest uppercase mb-2">
            {product.brand} · {product.category}
          </p>

          <h1 className="font-display text-4xl text-white leading-tight mb-4">
            {product.name}
          </h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {Array(5).fill(0).map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={
                    i < Math.round(product.rating)
                      ? 'text-gold-500 fill-gold-500'
                      : 'text-gray-600'
                  }
                />
              ))}
              <span className="font-sans text-xs text-gray-400">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          <div className="gold-divider" />

          {/* PRICE */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-5xl text-white">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>

            {product.originalPrice && (
              <span className="font-sans text-xl text-gray-500 line-through">
                ₹{product.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <p className="font-body text-gray-400 leading-relaxed mb-8 text-lg">
            {product.description}
          </p>

          {/* STOCK */}
          <div className="flex items-center gap-2 mb-6">
            <FiPackage
              size={14}
              className={product.stock > 0 ? 'text-green-500' : 'text-red-500'}
            />

            <span className={`font-sans text-xs tracking-wide 
            ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {product.stock > 10
                ? 'In Stock'
                : product.stock > 0
                  ? `Only ${product.stock} left`
                  : 'Out of Stock'}
            </span>
          </div>

          {/* QUANTITY */}
          {product.stock > 0 && (
            <div className="flex gap-4 mb-6">

              <div className="flex items-center border border-luxe-border">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-12 text-white hover:text-gold-500 transition-colors"
                >
                  −
                </button>

                <span className="w-12 text-center font-sans text-sm text-white">
                  {qty}
                </span>

                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-10 h-12 text-white hover:text-gold-500 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-gold flex-1 flex items-center justify-center gap-2"
              >
                <FiShoppingCart size={16} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>

            </div>
          )}

          <div className="flex items-center gap-2 text-gray-500 font-sans text-xs">
            <FiTruck size={14} className="text-gold-500" />
            Free shipping on orders over ₹999
          </div>

          <div className="gold-divider" />

          {/* EXTRA INFO */}
          <div className="grid grid-cols-2 gap-4 text-xs font-sans">

            <div>
              <p className="text-gray-500 mb-1 tracking-widest uppercase">SKU</p>
              <p className="text-white">{product.sku || 'N/A'}</p>
            </div>

            <div>
              <p className="text-gray-500 mb-1 tracking-widest uppercase">Category</p>
              <p className="text-white">{product.category}</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

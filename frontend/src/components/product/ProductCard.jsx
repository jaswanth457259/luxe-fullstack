import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart', { style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' } });
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="card-luxe overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-luxe-dark overflow-hidden">
          <img src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/500`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {discount && (
            <span className="absolute top-3 left-3 bg-gold-500 text-luxe-black text-xs font-bold px-2 py-0.5 font-sans tracking-wide">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-sans text-xs tracking-widest uppercase">Out of Stock</span>
            </div>
          )}
          {/* Quick add */}
          {product.stock > 0 && (
            <button onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 bg-gold-500 text-luxe-black py-3 font-sans text-xs tracking-widest uppercase font-semibold
                         translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2">
              <FiShoppingCart size={14} /> Add to Cart
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-sans text-xs text-gold-500 tracking-widest uppercase mb-1">{product.brand || product.category}</p>
          <h3 className="font-display text-white text-lg leading-tight mb-2 group-hover:text-gold-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <FiStar size={12} className="text-gold-500 fill-gold-500" />
              <span className="font-sans text-xs text-gray-400">{product.rating} ({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-display text-xl text-white">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="font-sans text-sm text-gray-500 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, updateItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleUpdate = async (id, qty) => {
    try { await updateItem(id, qty); }
    catch { toast.error('Failed to update cart'); }
  };

  if (cart.items.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center page-enter">
      <h2 className="font-display text-4xl text-white mb-4">Your Cart is Empty</h2>
      <p className="font-body text-gray-500 text-lg mb-8">Discover our curated collections</p>
      <Link to="/products" className="btn-gold inline-flex items-center gap-2">
        Browse Products <FiArrowRight />
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Shopping Cart</h1>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gold-500 font-sans text-xs tracking-widest uppercase flex items-center gap-1 transition-colors">
          <FiArrowLeft size={12} /> Continue Shopping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="card-luxe p-4 flex gap-4">
              <img src={item.productImage || `https://picsum.photos/seed/${item.productId}/100/120`}
                alt={item.productName} className="w-20 h-24 object-cover bg-luxe-dark shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="font-display text-lg text-white hover:text-gold-500 transition-colors line-clamp-2">
                  {item.productName}
                </Link>
                <p className="font-display text-gold-500 text-xl mt-1">₹{item.price?.toLocaleString('en-IN')}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-luxe-border">
                    <button onClick={() => handleUpdate(item.id, item.quantity - 1)} className="w-8 h-8 text-white hover:text-gold-500 transition-colors text-sm">−</button>
                    <span className="w-8 text-center font-sans text-sm text-white">{item.quantity}</span>
                    <button onClick={() => handleUpdate(item.id, item.quantity + 1)} className="w-8 h-8 text-white hover:text-gold-500 transition-colors text-sm">+</button>
                  </div>
                  <button onClick={() => handleUpdate(item.id, 0)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-xl text-white">₹{item.subtotal?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card-luxe p-6 h-fit">
          <h3 className="font-display text-xl text-white mb-6">Order Summary</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-sans text-sm text-gray-400">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>₹{cart.total?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-gray-400">
              <span>Shipping</span>
              <span className="text-green-500">{cart.total >= 999 ? 'Free' : '₹99'}</span>
            </div>
          </div>
          <div className="gold-divider my-0 mb-4" />
          <div className="flex justify-between font-display text-xl text-white mb-6">
            <span>Total</span>
            <span>₹{(cart.total + (cart.total >= 999 ? 0 : 99)).toLocaleString('en-IN')}</span>
          </div>
          <Link to="/checkout" className="btn-gold w-full block text-center">
            Proceed to Checkout
          </Link>
          <button onClick={clearCart} className="w-full mt-3 font-sans text-xs text-gray-500 hover:text-red-400 transition-colors tracking-widest uppercase">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

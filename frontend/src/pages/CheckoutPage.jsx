import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [form, setForm] = useState({ shippingAddress: '', paymentMethod: 'COD' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) { toast.error('Your cart is empty'); return; }
    setLoading(true);
    try {
      const res = await orderApi.place(form);
      await clearCart();
      toast.success('Order placed successfully!', { style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' } });
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <h1 className="section-title mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-luxe p-6">
            <h3 className="font-display text-xl text-white mb-5">Shipping Details</h3>
            <div>
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-2">Delivery Address</label>
              <textarea value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})}
                className="input-luxe h-28 resize-none" placeholder="Full address including city, state, pincode" required />
            </div>
          </div>
          <div className="card-luxe p-6">
            <h3 className="font-display text-xl text-white mb-5">Payment Method</h3>
            {['COD', 'ONLINE'].map(method => (
              <label key={method} className={`flex items-center gap-3 p-4 mb-3 border cursor-pointer transition-colors
                ${form.paymentMethod === method ? 'border-gold-500 bg-gold-500/5' : 'border-luxe-border hover:border-gold-500/50'}`}>
                <input type="radio" name="payment" value={method} checked={form.paymentMethod === method}
                  onChange={e => setForm({...form, paymentMethod: e.target.value})} className="accent-gold-500" />
                <div>
                  <p className="font-sans text-sm text-white font-semibold">
                    {method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                  </p>
                  <p className="font-sans text-xs text-gray-500">
                    {method === 'COD' ? 'Pay when delivered' : 'UPI, Cards, Net Banking'}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        {/* Summary */}
        <div className="card-luxe p-6 h-fit">
          <h3 className="font-display text-xl text-white mb-5">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between font-sans text-sm">
                <span className="text-gray-400 truncate mr-2">{item.productName} × {item.quantity}</span>
                <span className="text-white shrink-0">₹{item.subtotal?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="gold-divider" />
          <div className="flex justify-between font-display text-xl text-white">
            <span>Total</span>
            <span className="text-gold-500">₹{cart.total?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

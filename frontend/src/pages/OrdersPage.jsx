import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderApi } from '../services/api';
import { FiPackage, FiTruck, FiCheck, FiClock, FiX } from 'react-icons/fi';

const STATUS_CONFIG = {
  PENDING:   { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: FiClock, label: 'Pending' },
  CONFIRMED: { color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: FiCheck,   label: 'Confirmed' },
  SHIPPED:   { color: 'text-purple-400', bg: 'bg-purple-400/10', icon: FiTruck,   label: 'Shipped' },
  DELIVERED: { color: 'text-green-500',  bg: 'bg-green-500/10',  icon: FiCheck,   label: 'Delivered' },
  CANCELLED: { color: 'text-red-400',    bg: 'bg-red-400/10',    icon: FiX,       label: 'Cancelled' },
};

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders({ page: 0, size: 20 }).then(r => setOrders(r.data.content || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <h1 className="section-title mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-white mb-2">No orders yet</h2>
          <Link to="/products" className="btn-gold inline-block mt-4">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const Icon = sc.icon;
            return (
              <Link key={order.id} to={`/orders/${order.id}`} className="card-luxe p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gold-500/50 block">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-sm ${sc.bg}`}><Icon size={20} className={sc.color} /></div>
                  <div>
                    <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mb-1">Order #{order.id}</p>
                    <p className="font-display text-lg text-white">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    <p className="font-sans text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-sans text-xs tracking-widest uppercase px-3 py-1 rounded-sm ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  <p className="font-display text-xl text-white mt-2">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.getById(id).then(r => setOrder(r.data));
  }, [id]);

  if (!order) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const Icon = sc.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <h1 className="section-title mb-2">Order #{order.id}</h1>
      <p className="font-sans text-sm text-gray-500 mb-8">
        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="card-luxe p-5 mb-4 flex items-center gap-3">
        <div className={`p-2 rounded-sm ${sc.bg}`}><Icon size={20} className={sc.color} /></div>
        <div>
          <p className="font-sans text-xs text-gray-500 tracking-widest uppercase">Status</p>
          <p className={`font-display text-xl ${sc.color}`}>{sc.label}</p>
        </div>
      </div>

      <div className="card-luxe p-5 mb-4">
        <h3 className="font-display text-lg text-white mb-4">Items</h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between font-sans text-sm border-b border-luxe-border pb-3 last:border-0 last:pb-0">
              <span className="text-gray-300">{item.productName} × {item.quantity}</span>
              <span className="text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="flex justify-between font-display text-xl text-white pt-2">
            <span>Total</span><span className="text-gold-500">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="card-luxe p-5">
        <h3 className="font-display text-lg text-white mb-3">Delivery Details</h3>
        <p className="font-sans text-sm text-gray-400">{order.shippingAddress}</p>
        <p className="font-sans text-xs text-gray-500 mt-2">Payment: {order.paymentMethod}</p>
        {order.trackingNumber && <p className="font-sans text-xs text-gold-500 mt-1">Tracking: {order.trackingNumber}</p>}
      </div>
    </div>
  );
}

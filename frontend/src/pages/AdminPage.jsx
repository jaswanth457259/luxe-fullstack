import { useState, useEffect } from 'react';
import { adminApi, productApi, orderApi } from '../services/api';
import { FiPackage, FiUsers, FiShoppingBag, FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(() => {});
    productApi.getAll({ page: 0, size: 50 }).then(r => setProducts(r.data.content || [])).catch(() => {});
    orderApi.getAllAdmin({ page: 0, size: 50 }).then(r => setOrders(r.data.content || [])).catch(() => {});
  }, []);

  const statCards = [
    { icon: FiUsers, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: FiPackage, label: 'Products', value: stats.totalProducts, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: FiShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'text-gold-500', bg: 'bg-gold-500/10' },
    { icon: FiTrendingUp, label: 'Delivered', value: stats.deliveredOrders, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Admin Panel</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Manage your LUXE store</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-luxe-border">
        {['dashboard', 'products', 'orders'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 font-sans text-xs tracking-widest uppercase transition-colors border-b-2 -mb-px
              ${tab === t ? 'border-gold-500 text-gold-500' : 'border-transparent text-gray-500 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="card-luxe p-5">
                <div className={`inline-flex p-2 rounded-sm mb-3 ${bg}`}><Icon size={20} className={color} /></div>
                <p className="font-display text-3xl text-white">{value ?? '–'}</p>
                <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending', value: stats.pendingOrders, color: 'text-yellow-500' },
              { label: 'Shipped', value: stats.shippedOrders, color: 'text-purple-400' },
              { label: 'Delivered', value: stats.deliveredOrders, color: 'text-green-500' },
            ].map(item => (
              <div key={item.label} className="card-luxe p-5 text-center">
                <p className={`font-display text-4xl ${item.color}`}>{item.value ?? 0}</p>
                <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditProduct(null); setShowProductForm(true); }} className="btn-gold flex items-center gap-2">
              <FiPlus size={14} /> Add Product
            </button>
          </div>
          <div className="card-luxe overflow-hidden">
            <table className="w-full">
              <thead className="bg-luxe-dark">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-xs tracking-widest uppercase text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-luxe-border hover:bg-luxe-dark/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl || `https://picsum.photos/seed/${p.id}/40/40`} alt={p.name} className="w-10 h-10 object-cover" />
                        <span className="font-sans text-sm text-white line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-400">{p.category}</td>
                    <td className="px-4 py-3 font-display text-white">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-sans text-sm">
                      <span className={p.stock > 0 ? 'text-green-500' : 'text-red-500'}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-sans text-xs px-2 py-1 rounded-sm ${p.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditProduct(p); setShowProductForm(true); }} className="p-1.5 text-gray-500 hover:text-gold-500 transition-colors"><FiEdit2 size={14} /></button>
                        <button onClick={async () => { await productApi.delete(p.id); setProducts(products.filter(x => x.id !== p.id)); toast.success('Product deleted'); }}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <div className="text-center py-12 text-gray-500 font-sans">No products yet</div>}
          </div>
          {showProductForm && <ProductForm product={editProduct} onClose={() => setShowProductForm(false)}
            onSave={async (data) => {
              if (editProduct) {
                const r = await productApi.update(editProduct.id, data);
                setProducts(products.map(p => p.id === editProduct.id ? r.data : p));
              } else {
                const r = await productApi.create(data);
                setProducts([r.data, ...products]);
              }
              setShowProductForm(false);
              toast.success(editProduct ? 'Product updated' : 'Product created', { style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' } });
            }} />}
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="card-luxe overflow-hidden">
          <table className="w-full">
            <thead className="bg-luxe-dark">
              <tr>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date', 'Update Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs tracking-widest uppercase text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t border-luxe-border hover:bg-luxe-dark/50 transition-colors">
                  <td className="px-4 py-3 font-sans text-sm text-gold-500">#{order.id}</td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-300">{order.items?.length} item(s)</td>
                  <td className="px-4 py-3 font-display text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-xs px-2 py-1 bg-gold-500/10 text-gold-500">{order.status}</span>
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <select value={order.status}
                      onChange={async (e) => {
                        try {
                          await orderApi.updateStatus(order.id, e.target.value);
                          setOrders(orders.map(o => o.id === order.id ? { ...o, status: e.target.value } : o));
                          toast.success('Status updated');
                        } catch { toast.error('Failed to update'); }
                      }}
                      className="bg-luxe-dark border border-luxe-border text-white font-sans text-xs px-2 py-1 outline-none focus:border-gold-500">
                      {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="text-center py-12 text-gray-500 font-sans">No orders yet</div>}
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    stock: '', imageUrl: '', category: '', brand: '', sku: '', active: true,
    ...(product || {})
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave({ ...form, price: parseFloat(form.price), originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null, stock: parseInt(form.stock) }); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-luxe-card border border-luxe-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-luxe-border">
          <h2 className="font-display text-xl text-white">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Name', span: 2 }, { key: 'description', label: 'Description', span: 2, textarea: true },
            { key: 'price', label: 'Price (₹)', type: 'number' }, { key: 'originalPrice', label: 'Original Price (₹)', type: 'number' },
            { key: 'stock', label: 'Stock', type: 'number' }, { key: 'category', label: 'Category' },
            { key: 'brand', label: 'Brand' }, { key: 'sku', label: 'SKU' },
            { key: 'imageUrl', label: 'Image URL', span: 2 },
          ].map(f => (
            <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-1">{f.label}</label>
              {f.textarea ? (
                <textarea value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="input-luxe h-20 resize-none" />
              ) : (
                <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="input-luxe" required={['name', 'price', 'stock'].includes(f.key)} />
              )}
            </div>
          ))}
          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-outline px-6">Cancel</button>
            <button type="submit" disabled={loading} className="btn-gold px-8">{loading ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { adminApi, productApi, orderApi } from '../services/api';
import {
  FiPackage,
  FiUsers,
  FiShoppingBag,
  FiTrendingUp,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUpload,
  FiDownload,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getPrimaryProductImageUrl } from '../utils/productImages';

function createInitialForm(product) {
  return {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ?? '',
    originalPrice: product?.originalPrice ?? '',
    stock: product?.stock ?? '',
    mainImageUrl: product?.mainImageUrl || '',
    imagesText: product?.images?.map((img) => img.imageUrl).join('\n') || '',
    category: product?.category || '',
    brand: product?.brand || '',
    sku: product?.sku || '',
    active: product?.active ?? true,
  };
}

function parseImagesInput(value) {
  return value
    .split(/\r?\n|\|/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [importing, setImporting] = useState(false);
  const [lastImportResult, setLastImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const loadStats = async () => {
    const response = await adminApi.getStats();
    setStats(response.data);
  };

  const loadProducts = async () => {
    const response = await productApi.getAll({ page: 0, size: 50 });
    setProducts(response.data.content || []);
  };

  const loadOrders = async () => {
    const response = await orderApi.getAllAdmin({ page: 0, size: 50 });
    setOrders(response.data.content || []);
  };

  useEffect(() => {
    loadStats().catch(() => {});
    loadProducts().catch(() => {});
    loadOrders().catch(() => {});
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setImporting(true);

    try {
      const response = await adminApi.importProductsCsv(file);
      const result = response.data;
      setLastImportResult(result);
      await Promise.all([loadProducts(), loadStats()]);

      toast.success(`CSV imported: ${result.created} created, ${result.updated} updated`, {
        style: {
          background: '#181818',
          color: '#C9A84C',
          border: '1px solid #2A2A2A',
        },
      });

      if (result.failed > 0) {
        toast.error(`${result.failed} row(s) failed. Review the import details below.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productApi.delete(id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
      await loadStats();
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

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

      <div className="flex gap-1 mb-8 border-b border-luxe-border">
        {['dashboard', 'products', 'orders'].map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className={`px-5 py-3 font-sans text-xs tracking-widest uppercase transition-colors border-b-2 -mb-px
              ${tab === tabName ? 'border-gold-500 text-gold-500' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            {tabName}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="card-luxe p-5">
                <div className={`inline-flex p-2 rounded-sm mb-3 ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
                <p className="font-display text-3xl text-white">{value ?? '-'}</p>
                <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending', value: stats.pendingOrders, color: 'text-yellow-500' },
              { label: 'Shipped', value: stats.shippedOrders, color: 'text-purple-400' },
              { label: 'Delivered', value: stats.deliveredOrders, color: 'text-green-500' },
            ].map((item) => (
              <div key={item.label} className="card-luxe p-5 text-center">
                <p className={`font-display text-4xl ${item.color}`}>{item.value ?? 0}</p>
                <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="font-sans text-xs text-gray-500 tracking-wide">
              Import products with one CSV row per product. Use the `images` column for multi-image galleries separated by `|`.
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/product-import-template.csv" download className="btn-outline flex items-center gap-2">
                <FiDownload size={14} /> Template
              </a>
              <button onClick={handleImportClick} disabled={importing} className="btn-outline flex items-center gap-2">
                <FiUpload size={14} /> {importing ? 'Importing...' : 'Import CSV'}
              </button>
              <button
                onClick={() => {
                  setEditProduct(null);
                  setShowProductForm(true);
                }}
                className="btn-gold flex items-center gap-2"
              >
                <FiPlus size={14} /> Add Product
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleImportChange}
              />
            </div>
          </div>

          {lastImportResult && (
            <div className="card-luxe p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Processed', value: lastImportResult.processed },
                  { label: 'Created', value: lastImportResult.created },
                  { label: 'Updated', value: lastImportResult.updated },
                  { label: 'Failed', value: lastImportResult.failed },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="font-sans text-xs tracking-widest uppercase text-gray-500 mb-1">{item.label}</p>
                    <p className="font-display text-2xl text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              {lastImportResult.errors?.length > 0 && (
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-red-400 mb-2">Import Errors</p>
                  <div className="space-y-2">
                    {lastImportResult.errors.slice(0, 5).map((error) => (
                      <div key={`${error.row}-${error.sku || 'no-sku'}`} className="font-sans text-sm text-gray-400">
                        Row {error.row}
                        {error.sku ? ` (${error.sku})` : ''}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="card-luxe overflow-hidden">
            <table className="w-full">
              <thead className="bg-luxe-dark">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left font-sans text-xs tracking-widest uppercase text-gray-400">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-luxe-border hover:bg-luxe-dark/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getPrimaryProductImageUrl(product, '40/40')}
                          alt={product.name}
                          className="w-10 h-10 object-cover"
                        />
                        <span className="font-sans text-sm text-white line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-400">{product.category}</td>
                    <td className="px-4 py-3 font-display text-white">Rs {product.price?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-sans text-sm">
                      <span className={product.stock > 0 ? 'text-green-500' : 'text-red-500'}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-sans text-xs px-2 py-1 rounded-sm ${product.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditProduct(product);
                            setShowProductForm(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-gold-500 transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <div className="text-center py-12 text-gray-500 font-sans">No products yet</div>}
          </div>

          {showProductForm && (
            <ProductForm
              product={editProduct}
              onClose={() => setShowProductForm(false)}
              onSave={async (data) => {
                if (editProduct) {
                  await productApi.update(editProduct.id, data);
                } else {
                  await productApi.create(data);
                }

                await Promise.all([loadProducts(), loadStats()]);
                setShowProductForm(false);
                setLastImportResult(null);
                toast.success(editProduct ? 'Product updated' : 'Product created', {
                  style: {
                    background: '#181818',
                    color: '#C9A84C',
                    border: '1px solid #2A2A2A',
                  },
                });
              }}
            />
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="card-luxe overflow-hidden">
          <table className="w-full">
            <thead className="bg-luxe-dark">
              <tr>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date', 'Update Status'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left font-sans text-xs tracking-widest uppercase text-gray-400">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-luxe-border hover:bg-luxe-dark/50 transition-colors">
                  <td className="px-4 py-3 font-sans text-sm text-gold-500">#{order.id}</td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-300">{order.items?.length} item(s)</td>
                  <td className="px-4 py-3 font-display text-white">Rs {order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-xs px-2 py-1 bg-gold-500/10 text-gold-500">{order.status}</span>
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={async (event) => {
                        try {
                          await orderApi.updateStatus(order.id, event.target.value);
                          setOrders((currentOrders) =>
                            currentOrders.map((item) =>
                              item.id === order.id ? { ...item, status: event.target.value } : item
                            )
                          );
                          toast.success('Status updated');
                        } catch {
                          toast.error('Failed to update');
                        }
                      }}
                      className="bg-luxe-dark border border-luxe-border text-white font-sans text-xs px-2 py-1 outline-none focus:border-gold-500"
                    >
                      {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
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
  const [form, setForm] = useState(() => createInitialForm(product));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        stock: parseInt(form.stock, 10),
        mainImageUrl: form.mainImageUrl.trim(),
        images: parseImagesInput(form.imagesText),
        category: form.category.trim(),
        brand: form.brand.trim(),
        sku: form.sku.trim(),
        active: form.active,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-luxe-card border border-luxe-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-luxe-border">
          <h2 className="font-display text-xl text-white">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Name', span: 2 },
            { key: 'description', label: 'Description', span: 2, textarea: true },
            { key: 'price', label: 'Price (Rs)', type: 'number' },
            { key: 'originalPrice', label: 'Original Price (Rs)', type: 'number' },
            { key: 'stock', label: 'Stock', type: 'number' },
            { key: 'category', label: 'Category' },
            { key: 'brand', label: 'Brand' },
            { key: 'sku', label: 'SKU' },
            { key: 'mainImageUrl', label: 'Main Image URL', span: 2 },
            { key: 'imagesText', label: 'Gallery Images (one URL per line)', span: 2, textarea: true, rows: 5 },
          ].map((field) => (
            <div key={field.key} className={field.span === 2 ? 'col-span-2' : ''}>
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-1">{field.label}</label>
              {field.textarea ? (
                <textarea
                  value={form[field.key]}
                  rows={field.rows || 3}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                  className="input-luxe resize-none"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={form[field.key]}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                  className="input-luxe"
                  required={['name', 'price', 'stock'].includes(field.key)}
                />
              )}
            </div>
          ))}
          <label className="col-span-2 flex items-center gap-2 font-sans text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm({ ...form, active: event.target.checked })}
              className="accent-[#C9A84C]"
            />
            Active product
          </label>
          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-outline px-6">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-gold px-8">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

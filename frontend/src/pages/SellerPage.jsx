import { useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiEdit2, FiFileText, FiPlus, FiSend, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { sellerApi } from '../services/api';

function createInitialProductForm(product) {
  return {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ?? '',
    originalPrice: product?.originalPrice ?? '',
    stock: product?.stock ?? '',
    category: product?.category || '',
    brand: product?.brand || '',
    sku: product?.sku || '',
    mainImageUrl: product?.mainImageUrl || '',
    imagesText: product?.images?.join('\n') || '',
    active: product?.active ?? true,
  };
}

function parseImagesInput(value) {
  return value
    .split(/\r?\n|\|/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getStatusClasses(status) {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-500/10 text-green-500';
    case 'PENDING_REVIEW':
      return 'bg-yellow-500/10 text-yellow-400';
    case 'REJECTED':
      return 'bg-red-500/10 text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-400';
  }
}

function ReviewPanel({ title, summary, score, recommendation, issues, adminNotes }) {
  return (
    <div className="card-luxe p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">{title}</p>
          <p className="font-display text-2xl text-white">{summary || 'No AI review yet'}</p>
        </div>
        <div className="text-right">
          <p className="font-sans text-xs tracking-widest uppercase text-gray-500">AI Score</p>
          <p className="font-display text-3xl text-white">{score ?? '--'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-sm font-sans text-gray-300">
        <div>
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Recommendation</p>
          <p>{recommendation || 'Save or submit to generate AI feedback.'}</p>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Admin Notes</p>
          <p>{adminNotes || 'No admin notes yet.'}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Issues</p>
        {issues?.length ? (
          <div className="space-y-2">
            {issues.map((issue) => (
              <div key={issue} className="flex items-start gap-2 text-sm text-gray-300">
                <FiAlertCircle className="text-yellow-400 mt-0.5 shrink-0" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No issues raised yet.</p>
        )}
      </div>
    </div>
  );
}

export default function SellerPage() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    businessType: '',
    taxId: '',
    website: '',
    description: '',
    address: '',
    documentUrl: '',
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(createInitialProductForm());
  const [savingProduct, setSavingProduct] = useState(false);
  const [submittingProductId, setSubmittingProductId] = useState(null);

  const loadSellerWorkspace = async () => {
    const [profileResponse, productResponse] = await Promise.all([
      sellerApi.getProfile(),
      sellerApi.getProducts({ page: 0, size: 50 }),
    ]);

    setProfile(profileResponse.data);
    setProfileForm({
      businessName: profileResponse.data.businessName || '',
      businessType: profileResponse.data.businessType || '',
      taxId: profileResponse.data.taxId || '',
      website: profileResponse.data.website || '',
      description: profileResponse.data.description || '',
      address: profileResponse.data.address || '',
      documentUrl: profileResponse.data.documentUrl || '',
    });
    setProducts(productResponse.data.content || []);
  };

  useEffect(() => {
    loadSellerWorkspace()
      .catch(() => toast.error('Failed to load seller workspace'))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (submitForReview) => {
    setSavingProfile(true);
    try {
      const response = await sellerApi.updateProfile({ ...profileForm, submitForReview });
      setProfile(response.data);
      setProfileForm({
        businessName: response.data.businessName || '',
        businessType: response.data.businessType || '',
        taxId: response.data.taxId || '',
        website: response.data.website || '',
        description: response.data.description || '',
        address: response.data.address || '',
        documentUrl: response.data.documentUrl || '',
      });
      toast.success(submitForReview ? 'Seller profile submitted for review' : 'Seller profile saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save seller profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProductSave = async (event) => {
    event.preventDefault();
    setSavingProduct(true);

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
      stock: parseInt(productForm.stock, 10),
      category: productForm.category.trim(),
      brand: productForm.brand.trim(),
      sku: productForm.sku.trim(),
      mainImageUrl: productForm.mainImageUrl.trim(),
      images: parseImagesInput(productForm.imagesText),
      active: productForm.active,
    };

    try {
      const response = editingProduct
        ? await sellerApi.updateProduct(editingProduct.id, payload)
        : await sellerApi.createProduct(payload);

      setProducts((currentProducts) => {
        const nextProduct = response.data;
        const existingIndex = currentProducts.findIndex((item) => item.id === nextProduct.id);

        if (existingIndex >= 0) {
          return currentProducts.map((item) => (item.id === nextProduct.id ? nextProduct : item));
        }

        return [nextProduct, ...currentProducts];
      });

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm(createInitialProductForm());
      toast.success(editingProduct ? 'Draft updated' : 'Draft created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product draft');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSubmitProduct = async (productId) => {
    setSubmittingProductId(productId);
    try {
      const response = await sellerApi.submitProduct(productId);
      setProducts((currentProducts) =>
        currentProducts.map((item) => (item.id === productId ? response.data : item))
      );
      toast.success('Product submitted for admin review');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit product');
    } finally {
      setSubmittingProductId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sellerApproved = profile?.status === 'APPROVED';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter space-y-8">
      <section className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="card-luxe p-8">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-500 mb-4">Seller Studio</p>
          <h1 className="font-display text-4xl text-white mb-3">Build your storefront with review-ready data</h1>
          <p className="font-sans text-sm text-gray-400 max-w-2xl">
            Complete your business profile, let the AI pre-check your information, and then submit your listings for admin approval.
          </p>
        </div>

        <div className="card-luxe p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-sans text-xs tracking-widest uppercase text-gray-500">Seller Status</p>
              <p className="font-display text-2xl text-white mt-1">{profile?.status?.replaceAll('_', ' ') || 'DRAFT'}</p>
            </div>
            <span className={`font-sans text-xs px-3 py-1 rounded-sm ${getStatusClasses(profile?.status)}`}>
              {profile?.status?.replaceAll('_', ' ') || 'DRAFT'}
            </span>
          </div>

          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <FiShield className="text-gold-500 mt-0.5" />
              <span>AI feedback is generated when you save or submit your seller profile.</span>
            </div>
            <div className="flex items-start gap-3">
              <FiCheckCircle className={sellerApproved ? 'text-green-500 mt-0.5' : 'text-gray-500 mt-0.5'} />
              <span>{sellerApproved ? 'Your seller account is approved and ready for product submissions.' : 'Your seller account must be approved before products can be submitted.'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="card-luxe p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-2">Verification Profile</p>
              <h2 className="font-display text-3xl text-white">Seller details</h2>
            </div>
            <FiFileText className="text-gold-500" size={22} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              ['businessName', 'Business Name'],
              ['businessType', 'Business Type'],
              ['taxId', 'Tax / Registration ID'],
              ['website', 'Website'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-1">{label}</label>
                <input
                  value={profileForm[key]}
                  onChange={(event) => setProfileForm({ ...profileForm, [key]: event.target.value })}
                  className="input-luxe"
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-1">Business Address</label>
              <textarea
                value={profileForm.address}
                onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })}
                rows={3}
                className="input-luxe resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-1">Business Description</label>
              <textarea
                value={profileForm.description}
                onChange={(event) => setProfileForm({ ...profileForm, description: event.target.value })}
                rows={4}
                className="input-luxe resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-1">Verification Document URL</label>
              <input
                value={profileForm.documentUrl}
                onChange={(event) => setProfileForm({ ...profileForm, documentUrl: event.target.value })}
                className="input-luxe"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <button type="button" onClick={() => handleProfileSave(false)} disabled={savingProfile} className="btn-outline px-6">
              {savingProfile ? 'Saving...' : 'Save Draft'}
            </button>
            <button type="button" onClick={() => handleProfileSave(true)} disabled={savingProfile} className="btn-gold px-6">
              {savingProfile ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </div>

        <ReviewPanel
          title="AI Seller Review"
          summary={profile?.aiReviewSummary}
          score={profile?.aiReviewScore}
          recommendation={profile?.aiRecommendation}
          issues={profile?.aiReviewIssues}
          adminNotes={profile?.adminNotes}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-2">Catalog Workflow</p>
            <h2 className="font-display text-3xl text-white">Product drafts and submissions</h2>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm(createInitialProductForm());
              setShowProductForm(true);
            }}
            className="btn-gold flex items-center gap-2"
          >
            <FiPlus size={14} /> Add Product Draft
          </button>
        </div>

        <div className="card-luxe overflow-hidden">
          <table className="w-full">
            <thead className="bg-luxe-dark">
              <tr>
                {['Product', 'Price', 'Stock', 'Status', 'AI Score', 'Actions'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left font-sans text-xs tracking-widest uppercase text-gray-400">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-luxe-border align-top">
                  <td className="px-4 py-4">
                    <p className="font-sans text-sm text-white">{product.name}</p>
                    <p className="font-sans text-xs text-gray-500 mt-1">{product.brand || product.category || 'Uncategorized'}</p>
                    {product.aiReviewSummary && (
                      <p className="font-sans text-xs text-gray-400 mt-2 max-w-sm">{product.aiReviewSummary}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 font-display text-white">Rs {product.price?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 font-sans text-sm text-gray-300">{product.stock}</td>
                  <td className="px-4 py-4">
                    <span className={`font-sans text-xs px-2 py-1 rounded-sm ${getStatusClasses(product.approvalStatus)}`}>
                      {product.approvalStatus?.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-display text-white">{product.aiReviewScore ?? '--'}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm(createInitialProductForm(product));
                          setShowProductForm(true);
                        }}
                        className="btn-outline px-3 py-2 text-xs flex items-center gap-2"
                      >
                        <FiEdit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleSubmitProduct(product.id)}
                        disabled={!sellerApproved || submittingProductId === product.id}
                        className="btn-gold px-3 py-2 text-xs flex items-center gap-2 disabled:opacity-50"
                      >
                        <FiSend size={14} /> {submittingProductId === product.id ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-sans">Create your first product draft to start the approval workflow.</div>
          )}
        </div>
      </section>

      {showProductForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-luxe-card border border-luxe-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-luxe-border">
              <h2 className="font-display text-xl text-white">{editingProduct ? 'Edit Product Draft' : 'Create Product Draft'}</h2>
              <button onClick={() => setShowProductForm(false)} className="text-gray-500 hover:text-white">Close</button>
            </div>

            <form onSubmit={handleProductSave} className="p-6 grid md:grid-cols-2 gap-4">
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
                <div key={field.key} className={field.span === 2 ? 'md:col-span-2' : ''}>
                  <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-1">{field.label}</label>
                  {field.textarea ? (
                    <textarea
                      value={productForm[field.key]}
                      rows={field.rows || 3}
                      onChange={(event) => setProductForm({ ...productForm, [field.key]: event.target.value })}
                      className="input-luxe resize-none"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={productForm[field.key]}
                      onChange={(event) => setProductForm({ ...productForm, [field.key]: event.target.value })}
                      className="input-luxe"
                      required={['name', 'price', 'stock'].includes(field.key)}
                    />
                  )}
                </div>
              ))}

              <label className="md:col-span-2 flex items-center gap-2 font-sans text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={productForm.active}
                  onChange={(event) => setProductForm({ ...productForm, active: event.target.checked })}
                  className="accent-[#C9A84C]"
                />
                Keep product active once approved
              </label>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowProductForm(false)} className="btn-outline px-6">
                  Cancel
                </button>
                <button type="submit" disabled={savingProduct} className="btn-gold px-8">
                  {savingProduct ? 'Saving...' : 'Save Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-luxe-dark border-t border-luxe-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="font-display text-3xl text-gold-500 tracking-[0.3em]">LUXE</Link>
            <p className="mt-3 text-gray-500 font-body text-sm leading-relaxed max-w-xs">
              Curating the finest products from around the world. Premium quality, timeless elegance.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-4">Shop</h4>
            {['All Products', 'Fashion', 'Electronics', 'Jewelry', 'New Arrivals'].map(item => (
              <Link key={item} to="/products" className="block font-sans text-sm text-gray-500 hover:text-white mb-2 transition-colors">{item}</Link>
            ))}
          </div>
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-4">Support</h4>
            {['My Account', 'Order Tracking', 'Returns', 'Contact Us'].map(item => (
              <span key={item} className="block font-sans text-sm text-gray-500 mb-2">{item}</span>
            ))}
          </div>
        </div>
        <div className="gold-divider" />
        <p className="text-center text-gray-600 font-sans text-xs tracking-widest uppercase">
          © 2026 LUXE · All rights reserved
        </p>
      </div>
    </footer>
  );
}

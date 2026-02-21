import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-luxe-black/95 backdrop-blur-sm border-b border-luxe-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl text-gold-500 tracking-[0.3em] uppercase">
            LUXE
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {['/', '/products', '/products?category=Fashion', '/products?category=Electronics'].map((path, i) => {
              const labels = ['Home', 'All Products', 'Fashion', 'Electronics'];
              return (
                <Link key={i} to={path}
                  className={`font-sans text-xs tracking-widest uppercase transition-colors duration-200 
                    ${location.pathname === path.split('?')[0] && !path.includes('?') ? 'text-gold-500' : 'text-gray-400 hover:text-white'}`}>
                  {labels[i]}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="bg-luxe-dark border border-gold-500/50 text-white text-sm px-3 py-1.5 outline-none w-48 placeholder:text-gray-500" />
                <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-gray-400 hover:text-white">
                  <FiX size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-gold-500 transition-colors">
                <FiSearch size={20} />
              </button>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-400 hover:text-gold-500 transition-colors">
              <FiShoppingCart size={20} />
              {cart.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-luxe-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors">
                  <FiUser size={20} />
                  <span className="hidden md:block font-sans text-xs">{user.fullName?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-44 bg-luxe-card border border-luxe-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold-500 hover:bg-luxe-dark transition-colors">
                    <FiUser size={14} /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold-500 hover:bg-luxe-dark transition-colors">
                      <FiSettings size={14} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-luxe-dark transition-colors border-t border-luxe-border">
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-outline text-xs px-4 py-2">Login</Link>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-white">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-luxe-border py-4 animate-fade-in">
            {['/', '/products', '/orders'].map((path, i) => (
              <Link key={i} to={path} onClick={() => setMenuOpen(false)}
                className="block py-3 text-xs tracking-widest uppercase text-gray-400 hover:text-gold-500">
                {['Home', 'Products', 'My Orders'][i]}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

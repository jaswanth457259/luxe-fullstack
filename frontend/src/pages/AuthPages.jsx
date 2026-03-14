import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

const hasGoogleSignIn = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

function getPostLoginRoute(user) {
  if (user.role === 'ADMIN') return '/admin';
  if (user.role === 'SELLER') return '/seller';
  return '/';
}

function AccountTypeSelector({ value, onChange }) {
  return (
    <div>
      <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-2">Account Type</label>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'USER', label: 'Buyer', description: 'Shop and place orders' },
          { value: 'SELLER', label: 'Seller', description: 'List products for approval' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`border p-4 text-left transition-colors ${
              value === option.value
                ? 'border-gold-500 bg-gold-500/10 text-white'
                : 'border-luxe-border text-gray-400 hover:border-gold-500/40 hover:text-white'
            }`}
          >
            <p className="font-display text-lg">{option.label}</p>
            <p className="font-sans text-xs mt-1">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.fullName}!`, { style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' } });
      navigate(getPostLoginRoute(user));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = useCallback(async (credential) => {
    setGoogleLoading(true);
    try {
      const user = await googleLogin(credential);
      toast.success(`Welcome back, ${user.fullName}!`, { style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' } });
      navigate(getPostLoginRoute(user));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-4xl text-gold-500 tracking-[0.3em]">LUXE</Link>
          <h2 className="font-display text-2xl text-white mt-4">Welcome Back</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Sign in to your buyer, seller, or admin account</p>
        </div>
        <div className="card-luxe p-8">
          {hasGoogleSignIn && (
            <div className="space-y-3">
              <GoogleAuthButton text="signin_with" onCredential={handleGoogleAuth} disabled={loading || googleLoading} />
              <p className="font-sans text-xs text-center text-gray-500">
                Sign in instantly with your Google account
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {hasGoogleSignIn && <div className="gold-divider" />}
            <div>
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-luxe"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-luxe"
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="gold-divider" />
          <p className="text-center font-sans text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-500 hover:text-gold-400 transition-colors">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    accountType: 'USER',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(form.accountType === 'SELLER' ? 'Seller account created. Complete your verification next.' : 'Account created! Welcome to LUXE', {
        style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' },
      });
      navigate(getPostLoginRoute(user));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = useCallback(async (credential) => {
    setGoogleLoading(true);
    try {
      const user = await googleLogin(credential);
      toast.success('Account created! Welcome to LUXE', { style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' } });
      navigate(getPostLoginRoute(user));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-4xl text-gold-500 tracking-[0.3em]">LUXE</Link>
          <h2 className="font-display text-2xl text-white mt-4">Create Account</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Choose whether you're joining as a buyer or seller</p>
        </div>
        <div className="card-luxe p-8">
          {hasGoogleSignIn && (
            <div className="space-y-3">
              <GoogleAuthButton text="signup_with" onCredential={handleGoogleAuth} disabled={loading || googleLoading} />
              <p className="font-sans text-xs text-center text-gray-500">
                Google sign-up currently creates a buyer account
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {hasGoogleSignIn && <div className="gold-divider" />}
            <AccountTypeSelector value={form.accountType} onChange={(accountType) => setForm({ ...form, accountType })} />
            {[
              { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
              { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
            ].map((field) => (
              <div key={field.key}>
                <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-2">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="input-luxe"
                  placeholder={field.placeholder}
                  required={field.key !== 'phone'}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? 'Creating Account...' : form.accountType === 'SELLER' ? 'Create Seller Account' : 'Create Account'}
            </button>
          </form>
          <div className="gold-divider" />
          <p className="text-center font-sans text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-500 hover:text-gold-400 transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

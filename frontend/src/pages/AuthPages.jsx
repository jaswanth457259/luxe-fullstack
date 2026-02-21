import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.fullName}!`, { style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' } });
      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-4xl text-gold-500 tracking-[0.3em]">LUXE</Link>
          <h2 className="font-display text-2xl text-white mt-4">Welcome Back</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>
        <div className="card-luxe p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-2">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="input-luxe" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-2">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="input-luxe" placeholder="••••••••" required />
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
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to LUXE', { style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' } });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-4xl text-gold-500 tracking-[0.3em]">LUXE</Link>
          <h2 className="font-display text-2xl text-white mt-4">Create Account</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Join the LUXE experience</p>
        </div>
        <div className="card-luxe p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
              { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.key}>
                <label className="font-sans text-xs tracking-widest uppercase text-gray-400 block mb-2">{field.label}</label>
                <input type={field.type} value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})}
                  className="input-luxe" placeholder={field.placeholder} required={field.key !== 'phone'} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
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

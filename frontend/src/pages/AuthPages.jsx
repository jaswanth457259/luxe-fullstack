import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getClerkInstance, rememberPendingAccountType } from '../utils/clerkClient';

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

function ClerkPanel({ mode }) {
  const containerRef = useRef(null);
  const { clerkEnabled, clerkReady } = useAuth();
  const [mountError, setMountError] = useState('');

  useEffect(() => {
    if (!clerkEnabled || !clerkReady || !containerRef.current) {
      return undefined;
    }

    let active = true;
    let cleanup = null;

    (async () => {
      try {
        setMountError('');
        const clerk = await getClerkInstance();
        if (!active || !clerk || !containerRef.current) {
          return;
        }

        if (mode === 'sign-up') {
          clerk.mountSignUp(containerRef.current);
          cleanup = () => clerk.unmountSignUp(containerRef.current);
        } else {
          clerk.mountSignIn(containerRef.current);
          cleanup = () => clerk.unmountSignIn(containerRef.current);
        }
      } catch (error) {
        const message = error?.errors?.[0]?.longMessage
          || error?.errors?.[0]?.message
          || error?.message
          || 'Clerk widget failed to load. Check Clerk dashboard auth settings and allowed origins.';
        console.error('Clerk mount failed:', error);
        if (active) {
          setMountError(message);
        }
      }
    })();

    return () => {
      active = false;
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [clerkEnabled, clerkReady, mode]);

  if (!clerkEnabled) {
    return (
      <div className="rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 font-sans text-sm text-red-200">
        Set <span className="font-semibold">VITE_CLERK_PUBLISHABLE_KEY</span> (or <span className="font-semibold">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</span>) to enable Clerk authentication.
      </div>
    );
  }

  if (!clerkReady) {
    return <div className="font-sans text-sm text-gray-400">Loading Clerk...</div>;
  }

  if (mountError) {
    return (
      <div className="rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 font-sans text-sm text-red-200">
        {mountError}
      </div>
    );
  }

  return <div ref={containerRef} />;
}

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(getPostLoginRoute(user), { replace: true });
    }
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-4xl text-gold-500 tracking-[0.3em]">LUXE</Link>
          <h2 className="font-display text-2xl text-white mt-4">Welcome Back</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Sign in with Clerk to access your buyer, seller, or admin account</p>
        </div>
        <div className="card-luxe p-8">
          <ClerkPanel mode="sign-in" />
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    accountType: 'USER',
  });

  useEffect(() => {
    rememberPendingAccountType(form.accountType);
  }, [form.accountType]);

  useEffect(() => {
    if (user) {
      toast.success(form.accountType === 'SELLER' ? 'Seller account created. Complete your verification next.' : 'Account created! Welcome to LUXE', {
        style: { background: '#181818', color: '#C9A84C', border: '1px solid #2A2A2A' },
      });
      navigate(getPostLoginRoute(user), { replace: true });
    }
  }, [form.accountType, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-4xl text-gold-500 tracking-[0.3em]">LUXE</Link>
          <h2 className="font-display text-2xl text-white mt-4">Create Account</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Choose whether you're joining as a buyer or seller, then finish sign-up with Clerk</p>
        </div>
        <div className="card-luxe p-8">
          <div className="space-y-5">
            <AccountTypeSelector value={form.accountType} onChange={(accountType) => setForm({ accountType })} />
            <p className="font-sans text-xs text-gray-500">
              Your selected account type is saved before Clerk creates the account. Seller accounts still require profile completion and review after sign-up.
            </p>
            <ClerkPanel mode="sign-up" />
          </div>
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

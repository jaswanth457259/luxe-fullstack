const CLERK_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js';
const PENDING_ACCOUNT_TYPE_KEY = 'luxe_pending_account_type';

let clerkPromise;

function loadClerkScript() {
  return new Promise((resolve, reject) => {
    if (window.Clerk) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${CLERK_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Clerk SDK')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = CLERK_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Clerk SDK'));
    document.head.appendChild(script);
  });
}

export async function getClerkInstance() {
  const publishableKey = (
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
    || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    || ''
  ).trim();
  if (!publishableKey) {
    return null;
  }

  if (!clerkPromise) {
    clerkPromise = (async () => {
      await loadClerkScript();
      const clerk = new window.Clerk(publishableKey);
      await clerk.load();
      return clerk;
    })();
  }

  return clerkPromise;
}

export function rememberPendingAccountType(accountType) {
  localStorage.setItem(PENDING_ACCOUNT_TYPE_KEY, accountType || 'USER');
}

export function consumePendingAccountType() {
  const accountType = localStorage.getItem(PENDING_ACCOUNT_TYPE_KEY) || 'USER';
  localStorage.removeItem(PENDING_ACCOUNT_TYPE_KEY);
  return accountType;
}
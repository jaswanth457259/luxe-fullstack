import { Clerk } from '@clerk/clerk-js';
import { ClerkUI } from '@clerk/ui';

const PENDING_ACCOUNT_TYPE_KEY = 'luxe_pending_account_type';

let clerkPromise;

export function getClerkPublishableKey() {
  return (
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
    || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    || ''
  ).trim();
}

export async function getClerkInstance() {
  const publishableKey = getClerkPublishableKey();
  if (!publishableKey) {
    return null;
  }

  if (!clerkPromise) {
    clerkPromise = (async () => {
      const clerk = new Clerk(publishableKey);
      await clerk.load({
        ui: {
          ClerkUI,
        },
      });
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
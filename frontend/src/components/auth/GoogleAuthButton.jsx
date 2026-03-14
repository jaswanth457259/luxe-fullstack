import { useEffect, useRef, useState } from 'react';

const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let googleScriptPromise;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`);

      const handleLoad = () => resolve(window.google);
      const handleError = () => reject(new Error('Failed to load Google Identity Services'));

      if (existingScript) {
        existingScript.addEventListener('load', handleLoad, { once: true });
        existingScript.addEventListener('error', handleError, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', handleError, { once: true });
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export default function GoogleAuthButton({ text = 'signin_with', onCredential, disabled = false }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!clientId || !buttonRef.current) {
      return;
    }

    let isCancelled = false;

    loadGoogleIdentityScript()
      .then((google) => {
        if (isCancelled || !buttonRef.current || !google?.accounts?.id) {
          return;
        }

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) {
              return;
            }

            Promise.resolve(onCredential(response.credential)).catch(() => {});
          },
        });

        buttonRef.current.innerHTML = '';
        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          width: 320,
          text,
          logo_alignment: 'left',
        });

        setHasError(false);
        setIsReady(true);
      })
      .catch(() => {
        if (!isCancelled) {
          setHasError(true);
          setIsReady(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [clientId, onCredential, text]);

  if (!clientId) {
    return null;
  }

  return (
    <div className={disabled ? 'opacity-60 pointer-events-none' : ''}>
      {!isReady && !hasError && (
        <div className="input-luxe text-center text-xs text-gray-500">
          Loading Google sign-in...
        </div>
      )}

      <div ref={buttonRef} className={isReady ? '' : 'hidden'} />

      {hasError && (
        <div className="font-sans text-xs text-red-400 text-center">
          Google sign-in is unavailable right now.
        </div>
      )}
    </div>
  );
}

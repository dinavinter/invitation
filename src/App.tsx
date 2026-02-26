import { useEffect, useState } from 'react';

function App() {
  const [swStatus, setSwStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const currentPath = window.location.pathname;

    if (currentPath.startsWith('/sw')) {
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/sw', type: 'module' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          setSwStatus('ready');
          if (!currentPath.startsWith('/sw')) {
            window.location.href = '/sw';
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          setSwStatus('error');
          setErrorMsg(error.message);
        });
    } else {
      setSwStatus('error');
      setErrorMsg('Service Workers are not supported in this browser');
    }
  }, []);

  if (swStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (swStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Worker Error</h1>
          <p className="text-gray-600 mb-4">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;

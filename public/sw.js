import { Hono } from 'https://esm.sh/hono@4.0.0';
import { config } from './config.js';

const app = new Hono();

const GIGYA_API_KEY = config.GIGYA_API_KEY;
const GIGYA_DOMAIN = config.GIGYA_DOMAIN;

async function callGigyaAPI(endpoint, params) {
  const apiUrl = `${config.SUPABASE_URL}/functions/v1/gigya-api`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint, params }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Gigya API call failed:', error);
    throw error;
  }
}

const STYLES = `
  .card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:24px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
  .field-label{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:4px}
  .field-hint{font-size:.75rem;color:#9ca3af;margin-top:3px}
  .input{width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;box-sizing:border-box;transition:border-color .15s}
  .input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
  .input.mono{font-family:monospace}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:8px;font-weight:600;font-size:.875rem;cursor:pointer;border:none;transition:all .15s}
  .btn-primary{background:#6366f1;color:#fff}
  .btn-primary:hover{background:#4f46e5}
  .btn-danger{background:#dc2626;color:#fff}
  .btn-danger:hover{background:#b91c1c}
  .btn-ghost{background:transparent;color:#6b7280;border:1px solid #e5e7eb}
  .btn-ghost:hover{background:#f9fafb;color:#111827}
  .btn-secondary{background:#059669;color:#fff}
  .btn-secondary:hover{background:#047857}
  .tag{display:inline-flex;align-items:center;gap:4px;background:#e0e7ff;color:#3730a3;border-radius:9999px;padding:2px 10px;font-size:12px;font-weight:600}
  .badge-ok{background:#dcfce7;color:#166534}
  .badge-fail{background:#fee2e2;color:#991b1b}
`;

app.get('/', async (c) => {
  return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js"></script>
  <script src="https://esm.sh/@gigya/wc" type="module"></script>
  <style>${STYLES}</style>
  <title>Engagement Layer</title>
</head>

<body>
  <gigya-js api-key="${GIGYA_API_KEY}" domain="${GIGYA_DOMAIN}" class="h-full w-full">
    <gigya-screen slot="not-authenticated" screen-set="landing-login" container-id="login"
      data-on-success-screen="_finish">
      <template>
        <div class="min-h-md flex items-center justify-center fixed inset-0">
          <div class="min-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div class="text-center space-y-2">
              <h1 class="text-2xl font-semibold text-[#0a6ed1]">
                SAP Engagement Layer
              </h1>
              <p class="text-sm text-gray-500">
                Sign in using one of the options below
              </p>
            </div>

            <div class="space-y-3">
              <button type="button" data-gigya-provider="oidc-accountssapdev"
                onclick="gigya.socialize.login({provider:'oidc-accountssapdev'})"
                class="w-full flex items-center justify-center gap-3 py-3 rounded-md border border-gray-300 bg-white hover:bg-blue-50 hover:border-[#0a6ed1] transition text-sm font-medium text-gray-700 shadow-sm">
                <iconify-icon icon="simple-icons:sap" width="18"></iconify-icon>
                Sign in with SAP
              </button>

              <button type="button" data-gigya-provider="google"
                onclick="gigya.socialize.login({provider:'google'})"
                class="w-full flex items-center justify-center gap-3 py-3 rounded-md border border-gray-300 bg-white hover:bg-blue-50 hover:border-[#0a6ed1] transition text-sm font-medium text-gray-700 shadow-sm">
                <iconify-icon icon="simple-icons:google" width="18"></iconify-icon>
                Sign in with Google
              </button>
            </div>

            <div class="flex items-center gap-4">
              <div class="flex-1 h-px bg-gray-200"></div>
              <span class="text-xs text-gray-400"></span>
              <div class="flex-1 h-px bg-gray-200"></div>
            </div>

            <p class="text-xs text-gray-400 text-center">
              By signing in, you accept the
              <a href="#" class="text-[#0a6ed1] hover:underline">Terms of Service</a>
              and acknowledge our
              <a href="#" class="text-[#0a6ed1] hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </template>
    </gigya-screen>

    <gigya-screen slot="authenticated">
      <template>
        <div class="min-h-screen bg-gray-50">
          <nav class="bg-white shadow-sm border-b">
            <div class="container mx-auto px-4">
              <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-2">
                  <span class="text-xl font-bold text-gray-900">Gigya</span>
                  <span class="text-gray-400">/</span>
                  <span class="text-gray-700 font-semibold">Group Manager</span>
                </div>
                <button onclick="gigya.accounts.logout()" class="text-sm text-indigo-600 hover:underline">
                  Logout
                </button>
              </div>
            </div>
          </nav>

          <main class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-1">Group Invitations</h1>
              <p class="text-gray-500">Manage group invitations and members</p>
            </div>

            <div class="card">
              <div class="flex items-center gap-3 mb-4">
                <div class="step-dot" style="background:#6366f1;color:#fff;width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">👥</div>
                <div>
                  <p class="text-lg font-bold text-gray-900">Groups</p>
                  <p class="text-sm text-gray-600">View and manage your groups</p>
                </div>
              </div>

              <div id="groups-list" class="space-y-2">
                <button onclick="loadGroups()" class="btn btn-primary">
                  Load Groups
                </button>
              </div>
            </div>
          </main>
        </div>

        <script>
          async function loadGroups() {
            const container = document.getElementById('groups-list');
            container.innerHTML = '<p class="text-gray-500">Loading groups...</p>';

            try {
              const response = await fetch('/api/groups');
              const data = await response.json();

              if (data.results && data.results.length > 0) {
                container.innerHTML = data.results.map(group => \`
                  <div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                    <div class="flex justify-between items-center">
                      <div>
                        <h3 class="font-semibold text-gray-900">\${group.name || group.groupId}</h3>
                        <p class="text-sm text-gray-500">Members: \${group.membersCount || 0}</p>
                        <p class="text-xs text-gray-400 font-mono">Model: \${group.model || 'N/A'}</p>
                      </div>
                      <span class="tag badge-ok">\${group.membersCount || 0} members</span>
                    </div>
                  </div>
                \`).join('');
              } else {
                container.innerHTML = '<p class="text-gray-500">No groups found</p>';
              }
            } catch (error) {
              container.innerHTML = \`<p class="text-red-500">Error loading groups: \${error.message}</p>\`;
            }
          }
        </script>
      </template>
    </gigya-screen>
  </gigya-js>
</body>
</html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
});

app.post('/api/groups', async (c) => {
  try {
    const result = await callGigyaAPI('accounts.groups.search', {
      query: 'select * from groups',
      model: 'playground-access',
    });

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

app.get('/api/groups', async (c) => {
  try {
    const result = await callGigyaAPI('accounts.groups.search', {
      query: 'select * from groups',
      model: 'playground-access',
    });

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/') || url.pathname === '/') {
    event.respondWith(app.fetch(event.request));
  }
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

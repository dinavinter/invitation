import { Hono } from 'hono';
import { fire } from 'hono/service-worker';
import { html } from 'hono/html';
import { useGigya } from '@gigya/wc';

const app = new Hono().basePath('/sw');

const styles = `
  .card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:24px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:8px;font-weight:600;font-size:.875rem;cursor:pointer;border:none;transition:all .15s}
  .btn-primary{background:#6366f1;color:#fff}
  .btn-primary:hover{background:#4f46e5}
  .tag{display:inline-flex;align-items:center;gap:4px;background:#e0e7ff;color:#3730a3;border-radius:9999px;padding:2px 10px;font-size:12px;font-weight:600}
  .badge-ok{background:#dcfce7;color:#166534}
`;

app.get('/', (c) => {
  const {VITE_GIGYA_API_KEY, VITE_GIGYA_DOMAIN} = env< {GIGYA_API_KEY:string, GIGYA_DOMAIN:string}>(c)
  return c.html(html`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js"></script>
  <script src="https://esm.sh/@gigya/wc" type="module"></script>
  <script src="https://unpkg.com/htmx.org@2.0.4"></script>
  <style>${styles}</style>
  <title>Engagement Layer</title>
</head>
<body>
  <gigya-js api-key="${VITE_GIGYA_API_KEY}" domain="${VITE_GIGYA_DOMAIN}" class="h-full w-full">
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
                <div style="width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;background:#6366f1;color:#fff">👥</div>
                <div>
                  <p class="text-lg font-bold text-gray-900">Groups</p>
                  <p class="text-sm text-gray-600">View and manage your groups</p>
                </div>
              </div>

              <div id="groups-list" class="space-y-2">
                <button
                  hx-get="/sw/groups"
                  hx-target="#groups-list"
                  hx-swap="innerHTML"
                  class="btn btn-primary">
                  Load Groups
                </button>
              </div>
            </div>
          </main>
        </div>
      </template>
    </gigya-screen>
  </gigya-js>
</body>
</html>
  `);
});

app.get('/groups', async (c) => {
  try {
    const gigya = useGigya();
    const result = await gigya.accounts.groups.search({
      query: 'select * from groups',
      model: 'playground-access',
    });

    if (result.results && result.results.length > 0) {
      const groupsHtml = result.results.map((group: any) => `
        <div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-gray-900">${group.name || group.groupId}</h3>
              <p class="text-sm text-gray-500">Members: ${group.membersCount || 0}</p>
              <p class="text-xs text-gray-400 font-mono">Model: ${group.model || 'N/A'}</p>
            </div>
            <span class="tag badge-ok">${group.membersCount || 0} members</span>
          </div>
        </div>
      `).join('');

      return c.html(groupsHtml);
    } else {
      return c.html('<p class="text-gray-500">No groups found</p>');
    }
  } catch (error: any) {
    return c.html(`<p class="text-red-500">Error loading groups: ${error.message}</p>`);
  }
});

fire(app);

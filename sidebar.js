/**
 * FixWheel Admin Dashboard — Unified Sidebar & Global Search Command Palette
 */

function renderSidebar(activeKey) {
  const init = () => {
    // 1. Render Sidebar if missing
    if (!document.querySelector('.sidebar')) {
      const sidebarHtml = `
        <aside class="sidebar">
          <div class="sidebar-header">
            <img src="fixwheel_icon.png" alt="FixWheel Logo" class="sidebar-logo" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ef4444\' width=\'32\' height=\'32\'><rect x=\'4\' y=\'4\' width=\'16\' height=\'16\' rx=\'4\' fill=\'%23ef4444\'/><path d=\'M9 17v-8h3a2.5 2.5 0 0 1 0 5h-3v3H9z\' fill=\'white\'/></svg>'">
            <div class="sidebar-brand-text">
              <span class="sidebar-title">FixWheel</span>
              <span class="sidebar-subtitle">Admin Panel</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <!-- Overview Group -->
            <div class="nav-group">
              <div class="nav-group-title">Overview</div>
              <a href="home.html?v=2027" class="nav-item ${activeKey === 'dashboard' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
                Dashboard
              </a>
              <a href="live_ops.html?v=2027" class="nav-item ${activeKey === 'live_ops' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Live Ops
              </a>
            </div>

            <!-- Orders Group -->
            <div class="nav-group">
              <div class="nav-group-title">Orders</div>
              <a href="index.html?v=2027" class="nav-item ${activeKey === 'all_orders' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                All Orders
              </a>
              <a href="queries.html?v=2027" class="nav-item ${activeKey === 'queries' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Customer Queries
              </a>
              <a href="disputes.html?v=2027" class="nav-item ${activeKey === 'disputes' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Disputes
              </a>
            </div>

            <!-- Partners Group -->
            <div class="nav-group">
              <div class="nav-group-title">Partners</div>
              <a href="active_partners.html?v=2027" class="nav-item ${activeKey === 'active_partners' || activeKey === 'all_partners' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Active Partners
              </a>
              <a href="pending_partners.html?v=2027" class="nav-item ${activeKey === 'pending_partners' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                Pending Approval
              </a>
              <a href="partner_workload.html?v=2027" class="nav-item ${activeKey === 'partner_workload' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                Partner Workload
              </a>
              <a href="dublicate_partners.html?v=2027" class="nav-item ${activeKey === 'duplicates' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Duplicates
              </a>
              <a href="partner_payouts.html?v=2027" class="nav-item ${activeKey === 'payouts' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Payouts
              </a>
            </div>

            <!-- Customers Group -->
            <div class="nav-group">
              <div class="nav-group-title">Customers</div>
              <a href="customers.html?v=2027" class="nav-item ${activeKey === 'customer_list' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Customer List
              </a>
              <a href="blocked_customers.html?v=2027" class="nav-item ${activeKey === 'blocked_customers' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                Blocked / Flagged
              </a>
            </div>

            <!-- Coverage Group -->
            <div class="nav-group">
              <div class="nav-group-title">Coverage</div>
              <a href="coverage.html?v=2027" class="nav-item ${activeKey === 'coverage' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Cities & Localities
              </a>
            </div>

            <!-- Finance Group -->
            <div class="nav-group">
              <div class="nav-group-title">Finance</div>
              <a href="revenue.html?v=2027" class="nav-item ${activeKey === 'revenue' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Revenue
              </a>
              <a href="refunds.html?v=2027" class="nav-item ${activeKey === 'refunds' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                Refunds
              </a>
            </div>

            <!-- Content Group -->
            <div class="nav-group">
              <div class="nav-group-title">Content</div>
              <a href="pages.html?v=2027" class="nav-item ${activeKey === 'pages' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                Pages & Sitemap
              </a>
              <a href="bike_type_pages.html?v=2027" class="nav-item ${activeKey === 'bike_type' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path></svg>
                Bike Types
              </a>
            </div>

            <!-- Team Group -->
            <div class="nav-group">
              <div class="nav-group-title">Team</div>
              <a href="notifications.html?v=2027" class="nav-item ${activeKey === 'notifications' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                Notification Logs
              </a>
              <a href="settings.html?v=2027" class="nav-item ${activeKey === 'settings' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
              </a>
            </div>

            <!-- Dev Tools Group -->
            <div class="nav-group dev-tools">
              <div class="nav-group-title">Dev Tools</div>
              <a href="test_orders.html?v=2027" class="nav-item ${activeKey === 'test_orders' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                Test Orders
              </a>
            </div>
          </nav>
        </aside>
      `;

      const container = document.createElement('div');
      container.innerHTML = sidebarHtml;
      document.body.prepend(container.firstElementChild);
    }

    // 2. Inject Global Search Trigger into Topbar if present
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight && !document.querySelector('.global-search-trigger')) {
      const searchBtn = document.createElement('button');
      searchBtn.className = 'global-search-trigger';
      searchBtn.onclick = window.openGlobalSearchModal;
      searchBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>Search pages, settings...</span>
        <kbd>Ctrl K</kbd>
      `;
      topbarRight.prepend(searchBtn);
    }

    // 3. Inject Command Palette Modal if missing
    injectCommandPaletteModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// ─── Global Command Palette Search Engine ───

const SEARCH_DATABASE = [
  // Pages & Navigation
  { type: 'page', title: 'Dashboard Overview', sub: 'Overview · Main KPIs & Revenue', icon: '🏠', url: 'home.html?v=2027' },
  { type: 'page', title: 'Live Ops Dispatch', sub: 'Overview · Realtime Dispatch & SLA Queue', icon: '⚡', url: 'live_ops.html?v=2027' },
  { type: 'page', title: 'All Orders Management', sub: 'Orders · Complete Production Orders', icon: '📋', url: 'index.html?v=2027' },
  { type: 'page', title: "Today's Orders", sub: 'Orders · Orders Received Today', icon: '📅', url: 'index.html?tab=today&v=2027' },
  { type: 'page', title: 'Customer Queries', sub: 'Orders · Support Tickets & Inquiries', icon: '💬', url: 'queries.html?v=2027' },
  { type: 'page', title: 'Order Disputes', sub: 'Orders · Customer & Mechanic Complaints', icon: '⚖️', url: 'disputes.html?v=2027' },
  { type: 'page', title: 'Active Partners', sub: 'Partners · Active Mechanics & On-Duty Garages', icon: '👥', url: 'active_partners.html?v=2027' },
  { type: 'page', title: 'Total Partners Directory', sub: 'Partners · All Registered Garages', icon: '🏪', url: 'partners.html?v=2027' },
  { type: 'page', title: 'Pending Approval', sub: 'Partners · Onboarding Approvals', icon: '⏳', url: 'pending_partners.html?v=2027' },
  { type: 'page', title: 'Partner Workload', sub: 'Partners · Workload Distribution', icon: '⚡', url: 'partner_workload.html?v=2027' },
  { type: 'page', title: 'Duplicate Accounts', sub: 'Partners · Flagged Duplicate Accounts', icon: '📑', url: 'dublicate_partners.html?v=2027' },
  { type: 'page', title: 'Partner Payouts', sub: 'Partners · Earnings & Commission Payouts', icon: '💰', url: 'partner_payouts.html?v=2027' },
  { type: 'page', title: 'Customer Directory', sub: 'Customers · User Profiles & Registered Riders', icon: '👤', url: 'customers.html?v=2027' },
  { type: 'page', title: 'Blocked / Flagged Customers', sub: 'Customers · Flagged Accounts', icon: '🚫', url: 'blocked_customers.html?v=2027' },
  { type: 'page', title: 'Cities & Localities Coverage', sub: 'Coverage · Operational Areas', icon: '🗺️', url: 'coverage.html?v=2027' },
  { type: 'page', title: 'Revenue Analytics', sub: 'Finance · Gross & Net Revenue Reports', icon: '💵', url: 'revenue.html?v=2027' },
  { type: 'page', title: 'Refunds Queue', sub: 'Finance · Customer Refund Processing', icon: '🔄', url: 'refunds.html?v=2027' },
  { type: 'page', title: 'Pages & Sitemap Inventory', sub: 'Content · All Public Website Pages & Health Check', icon: '📄', url: 'pages.html?v=2027' },
  { type: 'page', title: 'Bike Types Sitemap Inventory', sub: 'Content · All 2,268 Service-City-Locality Pages', icon: '🏍️', url: 'bike_type_pages.html?v=2027' },
  { type: 'page', title: 'Notification Logs', sub: 'Team · Push & SMS Activity Logs', icon: '🔔', url: 'notifications.html?v=2027' },
  { type: 'page', title: 'Settings & Configurations', sub: 'Team · System Settings, Pricing & Keys', icon: '⚙️', url: 'settings.html?v=2027' },
  { type: 'page', title: 'Test Orders Sandbox', sub: 'Dev Tools · App Sandbox Orders', icon: '🧪', url: 'test_orders.html?v=2027' },

  // Settings & Actions
  { type: 'setting', title: 'Toggle Light / Dark Theme', sub: 'Action · Switch color scheme', icon: '🌗', action: 'toggle_theme' },
  { type: 'setting', title: 'Admin Account & Security Settings', sub: 'Setting · Password, Email & 2FA', icon: '🔐', url: 'settings.html#security' },
  { type: 'setting', title: 'Service Rate & Commission Pricing', sub: 'Setting · Standard Rates & Platform Fees', icon: '🏷️', url: 'settings.html#pricing' },
  { type: 'setting', title: 'API Keys & Third-Party Integrations', sub: 'Setting · Supabase, Maps, SMS & Payment Keys', icon: '🔑', url: 'settings.html#api' },
  { type: 'setting', title: 'Payment Gateway Configuration', sub: 'Setting · UPI, Razorpay & Cash Settings', icon: '💳', url: 'settings.html#payments' },
  { type: 'setting', title: 'Notification & Email Preferences', sub: 'Setting · Admin Alerts & Customer SMS', icon: '📩', url: 'settings.html#notifications' },
  { type: 'setting', title: 'System Diagnostics & Data Backup', sub: 'Setting · Database Backups & Diagnostics', icon: '🛠️', url: 'settings.html#system' }
];

function injectCommandPaletteModal() {
  if (document.getElementById('global-search-modal')) return;

  const modalHtml = `
    <div class="cmd-modal-overlay" id="global-search-modal" onclick="if(event.target === this) closeGlobalSearchModal()">
      <div class="cmd-palette-card">
        <div class="cmd-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="cmd-search-input" class="cmd-input" placeholder="Type a command, page name, or setting..." oninput="filterGlobalSearch(this.value)">
          <span class="cmd-esc-badge">ESC to close</span>
        </div>
        <div class="cmd-results-list" id="cmd-results-list">
          <!-- Dynamically populated -->
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);

  // Keyboard shortcut listener: Ctrl + K or Cmd + K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      window.toggleGlobalSearchModal();
    }
    if (e.key === 'Escape') {
      window.closeGlobalSearchModal();
    }
  });
}

window.openGlobalSearchModal = function() {
  const modal = document.getElementById('global-search-modal');
  if (!modal) return;
  modal.classList.add('active');
  const input = document.getElementById('cmd-search-input');
  if (input) {
    input.value = '';
    input.focus();
    filterGlobalSearch('');
  }
};

window.closeGlobalSearchModal = function() {
  const modal = document.getElementById('global-search-modal');
  if (modal) modal.classList.remove('active');
};

window.toggleGlobalSearchModal = function() {
  const modal = document.getElementById('global-search-modal');
  if (modal && modal.classList.contains('active')) {
    window.closeGlobalSearchModal();
  } else {
    window.openGlobalSearchModal();
  }
};

function filterGlobalSearch(query) {
  const container = document.getElementById('cmd-results-list');
  if (!container) return;

  const q = (query || '').toLowerCase().trim();

  const matched = SEARCH_DATABASE.filter(item => {
    return !q || item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q);
  });

  if (matched.length === 0) {
    container.innerHTML = `
      <div style="padding:32px 16px; text-align:center; color:var(--text-3); font-family:var(--mono); font-size:13px;">
        🔍 No matching pages or settings found for "${query}"
      </div>
    `;
    return;
  }

  const pages = matched.filter(item => item.type === 'page');
  const settings = matched.filter(item => item.type === 'setting');

  let html = '';

  if (pages.length > 0) {
    html += `
      <div class="cmd-group">
        <div class="cmd-group-title">Pages & Navigation</div>
        ${pages.map(item => `
          <a class="cmd-item" href="${item.url}" onclick="closeGlobalSearchModal()">
            <div class="cmd-item-left">
              <div class="cmd-item-icon">${item.icon}</div>
              <div>
                <div class="cmd-item-title">${item.title}</div>
                <div class="cmd-item-sub">${item.sub}</div>
              </div>
            </div>
            <span class="cmd-enter-badge">Jump →</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  if (settings.length > 0) {
    html += `
      <div class="cmd-group">
        <div class="cmd-group-title">Settings & System Actions</div>
        ${settings.map(item => `
          <a class="cmd-item" href="${item.url || '#'}" onclick="${item.action ? 'handleCmdAction(\'' + item.action + '\'); event.preventDefault();' : 'closeGlobalSearchModal();'}">
            <div class="cmd-item-left">
              <div class="cmd-item-icon">${item.icon}</div>
              <div>
                <div class="cmd-item-title">${item.title}</div>
                <div class="cmd-item-sub">${item.sub}</div>
              </div>
            </div>
            <span class="cmd-enter-badge">Open →</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = html;
}

function handleCmdAction(action) {
  if (action === 'toggle_theme') {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
    const themeText = document.getElementById('theme-text');
    if (themeText) themeText.textContent = isLight ? 'Dark' : 'Light';
  }
  window.closeGlobalSearchModal();
}

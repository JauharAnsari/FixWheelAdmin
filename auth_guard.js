/**
 * FixWheel Admin Dashboard — Global Auth Guard & Access Control
 */
(function() {
  function getCleanPath() {
    const raw = window.location.pathname.split('/').pop() || 'index.html';
    return raw.split('?')[0].split('#')[0].toLowerCase();
  }

  function isUserAuthenticated() {
    return sessionStorage.getItem('fixwheel_admin_logged_in') === 'true' ||
           localStorage.getItem('fixwheel_admin_logged_in') === 'true' ||
           sessionStorage.getItem('fixwheel_admin_session_v2') === 'true' ||
           localStorage.getItem('fixwheel_admin_session_v2') === 'true';
  }

  function getStaffRole() {
    return localStorage.getItem('fixwheel_staff_role') || 'admin';
  }

  window.fixwheelLogout = async function() {
    try {
      if (window.supabaseClient && window.supabaseClient.auth) {
        await window.supabaseClient.auth.signOut();
      }
    } catch(e) {
      console.error('Logout error:', e);
    }
    sessionStorage.removeItem('fixwheel_admin_logged_in');
    localStorage.removeItem('fixwheel_admin_logged_in');
    sessionStorage.removeItem('fixwheel_admin_session_v2');
    localStorage.removeItem('fixwheel_admin_session_v2');
    localStorage.removeItem('fixwheel_staff_role');
    localStorage.removeItem('fixwheel_staff_user');
    window.location.replace('login.html');
  };

  const currentPath = getCleanPath();
  const isAuth = isUserAuthenticated();
  const role = getStaffRole();

  window.FIXWHEEL_CURRENT_ROLE = role;

  // On Login page: if already logged in, redirect to appropriate start page
  if (currentPath === 'login.html') {
    if (isAuth) {
      if (role === 'employee') {
        window.location.replace('index.html');
      } else {
        window.location.replace('home.html');
      }
    }
    return;
  }

  // On Dashboard pages: if unauthenticated, redirect to login.html
  if (!isAuth) {
    window.location.replace('login.html');
    return;
  }

  // Role Restriction: Employee is restricted ONLY to index.html and partners.html / active_partners.html
  if (role === 'employee') {
    const allowedPages = ['index.html', 'partners.html', 'active_partners.html'];
    const isAllowed = allowedPages.includes(currentPath);

    if (!isAllowed) {
      console.warn(`[AuthGuard] Access denied for employee to "${currentPath}". Redirecting to index.html`);
      window.location.replace('index.html');
    }
  }

  // Employee UI Customization: Hide Download CSV and Revenue cards for employee role
  function applyEmployeeUIElements() {
    if (getStaffRole() === 'employee') {
      const csvBtn = document.getElementById('download-csv');
      if (csvBtn) csvBtn.style.display = 'none';

      const revTodayCard = document.getElementById('card-revenue-today');
      if (revTodayCard) revTodayCard.style.display = 'none';

      const totalRevCard = document.getElementById('card-total-revenue');
      if (totalRevCard) totalRevCard.style.display = 'none';

      const statGrid = document.querySelector('.fw-stat-grid');
      if (statGrid) statGrid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEmployeeUIElements);
  } else {
    applyEmployeeUIElements();
  }
})();

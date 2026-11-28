const SUPABASE_URL = "https://grvbunnfnqeyfafcaaaf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydmJ1bm5mbnFleWZhZmNhYWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjkyMzgsImV4cCI6MjA5MDk0NTIzOH0.c2Yb3KV-WnAmwiEPVe8Rt6QwlEaw7pZLMBDgXz3iJlQ";

// Supabase/PostgREST limits one response to 1,000 rows by default. Always page
// through Booking so older orders remain visible as the table keeps growing.
async function fetchAllBookingRows(client, options = {}) {
  const pageSize = 1000;
  const ascending = options.ascending === true;
  const select = options.select || '*';
  const rows = [];
  let expectedTotal = null;

  for (let from = 0; ; from += pageSize) {
    const selectOptions = from === 0 ? { count: 'exact' } : undefined;
    let query = client
      .from('Booking')
      .select(select, selectOptions)
      .order('createdAt', { ascending, nullsFirst: false })
      .order('id', { ascending });

    const { data, error, count } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    if (from === 0 && Number.isFinite(count)) expectedTotal = count;

    const page = data || [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  if (expectedTotal !== null && rows.length < expectedTotal) {
    throw new Error(`Only ${rows.length} of ${expectedTotal} orders were loaded. Please retry.`);
  }

  return rows;
}

window.fetchAllBookingRows = fetchAllBookingRows;

/**
 * Return a valid Supabase access token for dashboard mutations.
 * Local/session storage flags are UI hints only; they must never be treated as
 * database authentication because the Supabase session can expire separately.
 */
async function getFixWheelStaffAccessToken(client) {
  if (!client?.auth) return null;
  const { data, error } = await client.auth.getSession();
  if (error) {
    console.error('Unable to verify the staff session', error);
    return null;
  }
  return data?.session?.access_token || null;
}

function clearFixWheelStaffSession() {
  sessionStorage.removeItem('fixwheel_admin_logged_in');
  localStorage.removeItem('fixwheel_admin_logged_in');
  sessionStorage.removeItem('fixwheel_admin_session_v2');
  localStorage.removeItem('fixwheel_admin_session_v2');
  localStorage.removeItem('fixwheel_staff_role');
  localStorage.removeItem('fixwheel_staff_user');
}

window.getFixWheelStaffAccessToken = getFixWheelStaffAccessToken;
window.clearFixWheelStaffSession = clearFixWheelStaffSession;

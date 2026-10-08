export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SESSION_KEY = 'skillifyme_session';

// Returns the saved admin session, or null if there is none or its token has expired
const readSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session?.access_token) return null;
    const payload = JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const authHeaders = () => {
  const session = readSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
};

// Parses a JSON response; non-JSON error pages become a readable error
const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return { error: { message: `Server error (${response.status})` } };
  }
};

// Public data (courses, reviews, ...) is kept for a minute in the browser, so moving between pages
// doesn't download it again. Identical requests made at the same time share one download.
// Logged-in admins always get fresh data, and any change clears the cached table.
const PUBLIC_TABLES = new Set(['courses', 'internships', 'reviews', 'contact_info', 'gallery_items']);
const BROWSER_CACHE_MS = 60 * 1000;
const responseCache = new Map(); // url -> { promise, expires }

const clearBrowserCache = (table) => {
  for (const key of responseCache.keys()) {
    if (key.startsWith(`${API_URL}/${table}?`) || key === `${API_URL}/${table}`) responseCache.delete(key);
  }
};

// Uploaded file URLs, so getPublicUrl(path) can return the URL the server actually saved
const uploadedUrls = new Map();

const authListeners = new Set();

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this._method = 'GET';
    this._select = '*';
    this._data = null;
    this._eq = [];
    this._limit = null;
    this._single = false;
    this._count = null;
    this._head = false;
    this._order = [];
  }

  select(columns = '*', options = {}) {
    // .insert(...).select() / .update(...).select() keep their write method
    if (this._data === null && this._method !== 'DELETE') this._method = 'GET';
    this._select = columns;
    if (options.count) this._count = options.count;
    if (options.head) this._head = true;
    return this;
  }

  insert(data) {
    this._method = 'POST';
    this._data = data;
    return this;
  }

  update(data) {
    this._method = 'PUT';
    this._data = data;
    return this;
  }

  delete() {
    this._method = 'DELETE';
    return this;
  }

  eq(column, value) {
    this._eq.push({ column, value });
    return this;
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  order(column, options = { ascending: true }) {
    this._order.push(`${column}.${options.ascending === false ? 'desc' : 'asc'}`);
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  async execute() {
    let url = `${API_URL}/${this.table}`;
    const options = {
      method: this._method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
    };

    if (this._method === 'GET') {
      const params = new URLSearchParams();
      if (this._count) params.append('count', this._count);
      if (this._head) params.append('head', 'true');
      if (this._limit) params.append('limit', this._limit);
      this._order.forEach(order => params.append('order', order));
      this._eq.forEach(filter => params.append(filter.column, filter.value));
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    } else if (this._method === 'POST') {
      options.body = JSON.stringify(this._data);
    } else if (this._method === 'PUT' || this._method === 'DELETE') {
      // The API only supports updating / deleting a single row by id
      const idFilter = this._eq.find(f => f.column === 'id');
      if (!idFilter) {
        return { data: null, error: { message: 'Update and delete need an id filter' }, count: null };
      }
      url += `/${encodeURIComponent(idFilter.value)}`;
      if (this._method === 'PUT') {
        options.body = JSON.stringify(this._data);
      }
    }

    const cacheable = this._method === 'GET' && PUBLIC_TABLES.has(this.table) && !readSession();
    if (this._method !== 'GET') clearBrowserCache(this.table);

    const load = async () => {
      const response = await fetch(url, options);
      const json = await readJson(response);
      if (response.status === 401) localStorage.removeItem(SESSION_KEY);
      return { ok: response.ok, json };
    };

    try {
      let request;
      if (cacheable) {
        const hit = responseCache.get(url);
        if (hit && hit.expires > Date.now()) {
          request = hit.promise;
        } else {
          request = load();
          responseCache.set(url, { promise: request, expires: Date.now() + BROWSER_CACHE_MS });
        }
      } else {
        request = load();
      }

      const { ok, json } = await request;
      if (!ok) {
        if (cacheable) responseCache.delete(url); // don't keep errors
        return { data: null, error: json.error || { message: 'Network error' }, count: null };
      }

      let data = json.data;
      if (this._single && Array.isArray(data)) {
        data = data[0] || null;
      }

      return { data, error: null, count: json.count };
    } catch (error) {
      if (cacheable) responseCache.delete(url);
      return { data: null, error: { message: error.message }, count: null };
    }
  }
}

export const supabase = {
  from: (table) => new QueryBuilder(table),
  storage: {
    from: (bucket) => ({
      upload: async (path, file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);

        let url = `${API_URL}/upload/${bucket}`;
        const fetchOptions = { method: 'POST', body: formData, headers: authHeaders() };

        try {
          const res = await fetch(url, fetchOptions);
          const json = await readJson(res);
          if (!res.ok) return { data: null, error: json.error };
          uploadedUrls.set(`${bucket}/${path}`, json.data.publicUrl);
          return { data: json.data, error: null };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      },
      getPublicUrl: (path) => {
        // The server renames uploaded files, so use the URL it returned during upload
        const uploaded = uploadedUrls.get(`${bucket}/${path}`);
        return { data: { publicUrl: uploaded || `${API_URL.replace(/\/api$/, '')}/uploads/${bucket}/${path.split('/').pop()}` } };
      }
    })
  },
  auth: {
    signInWithPassword: async ({ email, password }) => {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const json = await readJson(res);
        if (!res.ok) return { data: null, error: json.error };
        localStorage.setItem(SESSION_KEY, JSON.stringify(json.data.session));
        return { data: json.data, error: null };
      } catch (e) {
        return { data: null, error: { message: e.message } };
      }
    },
    getSession: async () => {
      return { data: { session: readSession() }, error: null };
    },
    onAuthStateChange: (callback) => {
      // Simulate initial auth state, then report sign-ins/outs from this or another tab
      const session = readSession();
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      authListeners.add(callback);
      const onStorage = (e) => {
        if (e.key === SESSION_KEY) callback(e.newValue ? 'SIGNED_IN' : 'SIGNED_OUT', readSession());
      };
      window.addEventListener('storage', onStorage);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
              window.removeEventListener('storage', onStorage);
            },
          },
        },
      };
    },
    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      authListeners.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    }
  }
};

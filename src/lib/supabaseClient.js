const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    this._order = null;
  }

  select(columns = '*', options = {}) {
    this._method = 'GET';
    this._select = columns;
    if (options.count) this._count = options.count;
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
    this._order = `${column}.${options.ascending === false ? 'desc' : 'asc'}`;
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
      },
    };

    const sessionStr = localStorage.getItem('skillifyme_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      options.headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    if (this._method === 'GET') {
      const params = new URLSearchParams();
      if (this._count) params.append('count', this._count);
      if (this._limit) params.append('limit', this._limit);
      if (this._order) params.append('order', this._order);
      this._eq.forEach(filter => params.append(filter.column, filter.value));
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    } else if (this._method === 'POST') {
      options.body = JSON.stringify(this._data);
    } else if (this._method === 'PUT' || this._method === 'DELETE') {
      // Assuming PUT and DELETE are always using .eq('id', id)
      const idFilter = this._eq.find(f => f.column === 'id');
      if (idFilter) {
        url += `/${idFilter.value}`;
      } else if (this._method === 'PUT' && this.table === 'contact_info' && this._data.id) {
         // Custom handling for contact_info which is updated via POST in our backend
         options.method = 'POST';
         options.body = JSON.stringify(this._data);
      }
      if (this._method === 'PUT') {
        options.body = JSON.stringify(this._data);
      }
    }

    try {
      const response = await fetch(url, options);
      let json = await response.json();
      
      if (!response.ok) {
        return { data: null, error: json.error || { message: 'Network error' }, count: null };
      }

      if (this._single && Array.isArray(json.data)) {
        json.data = json.data[0] || null;
      }

      return { data: json.data, error: null, count: json.count };
    } catch (error) {
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
        const fetchOptions = { method: 'POST', body: formData, headers: {} };
        const sessionStr = localStorage.getItem('skillifyme_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          fetchOptions.headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        try {
          const res = await fetch(url, fetchOptions);
          const json = await res.json();
          if (!res.ok) return { data: null, error: json.error };
          return { data: json.data, error: null };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      },
      getPublicUrl: (path) => {
        // Our backend returns the public URL during upload, but if just given a path:
        return { data: { publicUrl: `${API_URL.replace('/api', '')}/uploads/${bucket}/${path.split('/').pop()}` } };
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
        const json = await res.json();
        if (!res.ok) return { data: null, error: json.error };
        localStorage.setItem('skillifyme_session', JSON.stringify(json.data.session));
        return { data: json.data, error: null };
      } catch (e) {
        return { data: null, error: { message: e.message } };
      }
    },
    getSession: async () => {
      const sessionStr = localStorage.getItem('skillifyme_session');
      if (sessionStr) {
        return { data: { session: JSON.parse(sessionStr) }, error: null };
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback) => {
      // Simulate initial auth state
      const sessionStr = localStorage.getItem('skillifyme_session');
      callback('SIGNED_IN', sessionStr ? JSON.parse(sessionStr) : null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signOut: async () => {
      localStorage.removeItem('skillifyme_session');
      return { error: null };
    }
  }
};

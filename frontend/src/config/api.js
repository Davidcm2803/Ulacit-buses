const BASE = import.meta.env.VITE_API_URL

async function apiRequest(path, opts = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  }
  const res = await fetch(path, { ...opts, headers })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail ?? `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

const http = {
  get:    (path)        => apiRequest(path, { method: 'GET' }),
  post:   (path, body)  => apiRequest(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)  => apiRequest(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)        => apiRequest(path, { method: 'DELETE' }),
}

const createService = (resource) => ({
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return http.get(`${BASE}/${resource}${qs ? `?${qs}` : ''}`)
  },
  getById: (id)       => http.get(`${BASE}/${resource}/${id}`),
  create:  (data)     => http.post(`${BASE}/${resource}`, data),
  update:  (id, data) => http.put(`${BASE}/${resource}/${id}`, data),
  remove:  (id)       => http.delete(`${BASE}/${resource}/${id}`),
})

export const routesService = {
  ...createService('routes'),
  getStops: (id) => http.get(`${BASE}/routes/${id}/stops`),
}

export const stopsService = createService('stops')
export const authService  = createService('auth')
export const apiGet  = (path)        => http.get(`${BASE}${path}`)
export const apiPost = (path, body)  => http.post(`${BASE}${path}`, body)
export const apiPut  = (path, body)  => http.put(`${BASE}${path}`, body)
export const apiDel  = (path)        => http.delete(`${BASE}${path}`)
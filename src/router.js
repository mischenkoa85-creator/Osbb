export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler, options = {}) {
    const keys = [];
    const pattern = path
      .split('/')
      .map((part) => {
        if (part.startsWith(':')) {
          keys.push(part.slice(1));
          return '([^/]+)';
        }
        return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/');
    this.routes.push({ method, path, regex: new RegExp(`^${pattern}/?$`), keys, handler, options });
  }

  get(path, handler, options) { this.add('GET', path, handler, options); }
  post(path, handler, options) { this.add('POST', path, handler, options); }
  patch(path, handler, options) { this.add('PATCH', path, handler, options); }
  put(path, handler, options) { this.add('PUT', path, handler, options); }
  delete(path, handler, options) { this.add('DELETE', path, handler, options); }

  match(method, pathname) {
    const allowed = new Set();
    for (const route of this.routes) {
      const m = route.regex.exec(pathname);
      if (!m) continue;
      if (route.method !== method) {
        allowed.add(route.method);
        continue;
      }
      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(m[i + 1]);
      });
      return { route, params };
    }
    return allowed.size ? { allowed: [...allowed] } : null;
  }

  list() {
    return this.routes.map((r) => ({
      method: r.method,
      path: r.path,
      auth: r.options.public ? 'public' : (r.options.roles ? r.options.roles.join('|') : 'any'),
    }));
  }
}

// ====== AUTH STORAGE LAYER ======
const LS_KEYS = {
    USERS: 'APP_USERS',
    CURRENT_USER: 'APP_CURRENT_USER'
  };
  
  const ALLOWED_DOMAINS_RE = /@(?:duocuc\.cl|gmail\.com)$/i;
  const AUTO_LOGIN_AFTER_REGISTER = true;
  
  function seedUsersIfEmpty() {
    const raw = localStorage.getItem(LS_KEYS.USERS);
    if (!raw) {
      const seed = [
        { name: 'Admin', email: 'admin@duocuc.cl', pass: '123456', role: 'admin' },
        { name: 'Usuario', email: 'user@gmail.com', pass: '123456', role: 'user' }
      ];
      localStorage.setItem(LS_KEYS.USERS, JSON.stringify(seed));
    }
  }
  
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.USERS)) || []; }
    catch { return []; }
  }
  
  function saveUsers(users) {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
  }
  
  function emailDomainOk(email) {
    return ALLOWED_DOMAINS_RE.test((email || '').trim());
  }
  
  function findUserByEmail(email) {
    return getUsers().find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  }
  
  function setSession(user) {
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify({
      name: user.name, email: user.email, role: user.role
    }));
  }
  
  function registerUser({ name, email, pass }) {
    if (!name?.trim() || !email?.trim() || !pass?.trim()) {
      return { ok: false, code: 'missing_fields', message: 'Todos los campos son obligatorios.' };
    }
    if (!emailDomainOk(email)) {
      return { ok: false, code: 'bad_domain', message: 'Dominio no permitido. Usa @duocuc.cl o @gmail.com.' };
    }
    if (findUserByEmail(email)) {
      return { ok: false, code: 'already_exists', message: 'El correo ya está registrado.' };
    }
  
    const users = getUsers();
    const newUser = { name: name.trim(), email: email.trim(), pass: pass.trim(), role: 'user' };
    users.push(newUser);
    saveUsers(users);
  
    if (AUTO_LOGIN_AFTER_REGISTER) {
      setSession(newUser);
      const dest = newUser.role === 'admin' ? 'admin.html' : 'index.html';
      return { ok: true, code: 'registered_and_logged_in', user: newUser, dest };
    }
  
    return { ok: true, code: 'registered', user: newUser };
  }
  
  function loginUser(email, pass) {
    if (!email?.trim() || !pass?.trim()) {
      return { ok: false, code: 'missing_fields', message: 'Correo y contraseña son obligatorios.' };
    }
    if (!emailDomainOk(email)) {
      return { ok: false, code: 'bad_domain', message: 'Dominio no permitido.' };
    }
  
    const user = findUserByEmail(email);
    if (!user) {
      return { ok: false, code: 'not_found', message: 'Este correo no está registrado.' };
    }
    if (user.pass !== pass) {
      return { ok: false, code: 'bad_credentials', message: 'Usuario o contraseña incorrectos.' };
    }
  
    setSession(user);
    const dest = user.role === 'admin' ? 'admin.html' : 'index.html';
    return { ok: true, code: 'logged_in', user, dest };
  }
  
  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.CURRENT_USER)) || null; }
    catch { return null; }
  }
  
  function logout() {
    localStorage.removeItem(LS_KEYS.CURRENT_USER);
  }
  
  // ====== PRODUCTOS SEED ======
  function seedProductsIfEmpty() {
    const raw = localStorage.getItem('APP_PRODS');
    if (!raw) {
      const seedProducts = [
        {
          id: 1,
          nombre: "Acelerador pulgar",
          precio: 12990,
          stock: 15,
          img: "https://via.placeholder.com/300x200/1e3a8a/ffffff?text=Acelerador+Pulgar"
        },
        {
          id: 2,
          nombre: "BMS 13S 15A",
          precio: 22990,
          stock: 8,
          img: "https://via.placeholder.com/300x200/3b82f6/ffffff?text=BMS+13S+15A"
        },
        {
          id: 3,
          nombre: "Cargador 54.6V 2A",
          precio: 21990,
          stock: 12,
          img: "https://via.placeholder.com/300x200/f59e0b/ffffff?text=Cargador+54.6V"
        },
        {
          id: 4,
          nombre: "Faro LED + Bocina",
          precio: 14990,
          stock: 20,
          img: "https://via.placeholder.com/300x200/10b981/ffffff?text=Faro+LED"
        },
        {
          id: 5,
          nombre: "Acelerador tipo moto",
          precio: 20000,
          stock: 6,
          img: "https://via.placeholder.com/300x200/ef4444/ffffff?text=Acelerador+Moto"
        },
        {
          id: 6,
          nombre: "BMS 10S 15A",
          precio: 18000,
          stock: 10,
          img: "https://via.placeholder.com/300x200/06b6d4/ffffff?text=BMS+10S+15A"
        }
      ];
      localStorage.setItem('APP_PRODS', JSON.stringify(seedProducts));
    }
  }

  seedUsersIfEmpty();
  seedProductsIfEmpty();
  
  window.AuthStore = {
    LS_KEYS,
    registerUser,
    loginUser,
    getCurrentUser,
    logout
  };
  
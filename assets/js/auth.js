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

  // Función para verificar si un email ya existe (útil para validaciones en tiempo real)
  function emailExists(email) {
    return findUserByEmail(email) !== undefined;
  }
  
  function setSession(user) {
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify({
      name: user.name, email: user.email, role: user.role
    }));
    
    // Disparar evento para actualizar navbar
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
    }
  }
  
  function registerUser({ name, email, password }) {
    // Validaciones básicas
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return { ok: false, code: 'missing_fields', message: 'Todos los campos son obligatorios.' };
    }
    
    // Validación de nombre
    if (name.trim().length < 2) {
      return { ok: false, code: 'invalid_name', message: 'El nombre debe tener al menos 2 caracteres.' };
    }
    
    // Validación de email
    if (!emailDomainOk(email)) {
      return { ok: false, code: 'bad_domain', message: 'Dominio no permitido. Usa @duocuc.cl, @duoc.cl o @gmail.com.' };
    }
    
    // Validación de contraseña
    if (password.length < 6) {
      return { ok: false, code: 'weak_password', message: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    
    // Validación de email duplicado
    if (findUserByEmail(email)) {
      return { ok: false, code: 'already_exists', message: 'El correo ya está registrado.' };
    }

    const users = getUsers();
    const newUser = { name: name.trim(), email: email.trim(), password: password.trim(), role: 'user' };
    users.push(newUser);
    saveUsers(users);
  
    if (AUTO_LOGIN_AFTER_REGISTER) {
      setSession(newUser);
      const dest = newUser.role === 'admin' ? 'admin.html' : 'index.html';
      return { ok: true, code: 'registered_and_logged_in', user: newUser, dest };
    }
  
    return { ok: true, code: 'registered', user: newUser };
  }
  
  function loginUser(email, password) {
    if (!email?.trim() || !password?.trim()) {
      return { ok: false, code: 'missing_fields', message: 'Correo y contraseña son obligatorios.' };
    }
    if (!emailDomainOk(email)) {
      return { ok: false, code: 'bad_domain', message: 'Dominio no permitido. Usa @duocuc.cl, @duoc.cl o @gmail.com.' };
    }

    const user = findUserByEmail(email);
    if (!user) {
      return { ok: false, code: 'not_found', message: 'Este correo no está registrado.' };
    }
    if (user.password !== password) {
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
    
    // Disparar evento para actualizar navbar
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
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
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUzYThhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BY2VsZXJhZG9yIFB1bGdhcjwvdGV4dD48L3N2Zz4="
        },
        {
          id: 2,
          nombre: "BMS 13S 15A",
          precio: 22990,
          stock: 8,
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM2I4MmY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CTVMgMTNTIDE1QTwvdGV4dD48L3N2Zz4="
        },
        {
          id: 3,
          nombre: "Cargador 54.6V 2A",
          precio: 21990,
          stock: 12,
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjU5ZTBiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXJnYWRvciA1NC42ViAyQTwvdGV4dD48L3N2Zz4="
        },
        {
          id: 4,
          nombre: "Faro LED + Bocina",
          precio: 14990,
          stock: 20,
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GYXJvIExFRCArIEJvY2luYTwvdGV4dD48L3N2Zz4="
        },
        {
          id: 5,
          nombre: "Acelerador tipo moto",
          precio: 20000,
          stock: 6,
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BY2VsZXJhZG9yIFRpcG8gTW90bzwvdGV4dD48L3N2Zz4="
        },
        {
          id: 6,
          nombre: "BMS 10S 15A",
          precio: 18000,
          stock: 10,
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDZiNmQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CTVMgMTBTIDE1QTwvdGV4dD48L3N2Zz4="
        }
      ];
      localStorage.setItem('APP_PRODS', JSON.stringify(seedProducts));
    }
  }

  // Funciones de productos
  function getProducts() {
    try {
      return JSON.parse(localStorage.getItem('APP_PRODS')) || [];
    } catch {
      return [];
    }
  }

  function saveProducts(products) {
    localStorage.setItem('APP_PRODS', JSON.stringify(products));
  }

  seedUsersIfEmpty();
  seedProductsIfEmpty();
  
  // Función global para logout que se puede usar desde cualquier página
  function globalLogout() {
    console.log('Ejecutando logout global...');
    
    // Llamar a la función de logout
    if (window.AuthStore && window.AuthStore.logout) {
      window.AuthStore.logout();
    } else {
      // Fallback directo
      localStorage.removeItem('APP_CURRENT_USER');
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    
    // Redirigir al index
    window.location.href = 'index.html';
  }

  // Exponer función global
  window.globalLogout = globalLogout;

  window.AuthStore = {
    LS_KEYS,
    registerUser,
    loginUser,
    getCurrentUser,
    logout,
    // Funciones de validación
    emailExists,
    findUserByEmail,
    // Funciones de productos
    getProducts,
    saveProducts,
    generateUniqueProductCode
  };
  
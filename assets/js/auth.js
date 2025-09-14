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
      name: user.name, email: user.email, role: user.role, points: user.points || 0
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
    const newUser = { name: name.trim(), email: email.trim(), pass: password.trim(), role: 'user' };
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
    if (user.pass !== password) {
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
          codigo: "C20-1001",
          nombre: "Acelerador pulgar",
          descripcion: "Acelerador de pulgar ergonómico para scooters eléctricos. Diseño compacto y resistente al agua.",
          precio: 12990,
          stock: 15,
          categoria: "Sistema Eléctrico",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUzYThhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BY2VsZXJhZG9yIFB1bGdhcjwvdGV4dD48L3N2Zz4="
        },
        {
          id: 2,
          codigo: "C20-1002",
          nombre: "BMS 13S 15A",
          descripcion: "Sistema de gestión de batería 13S 15A para baterías de litio. Protección contra sobrecarga y descarga.",
          precio: 22990,
          stock: 8,
          categoria: "Baterías",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM2I4MmY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CTVMgMTNTIDE1QTwvdGV4dD48L3N2Zz4="
        },
        {
          id: 3,
          codigo: "C20-1003",
          nombre: "Cargador 54.6V 2A",
          descripcion: "Cargador rápido 54.6V 2A con indicador LED. Compatible con baterías de litio 13S.",
          precio: 21990,
          stock: 12,
          categoria: "Cargadores",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjU5ZTBiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXJnYWRvciA1NC42ViAyQTwvdGV4dD48L3N2Zz4="
        },
        {
          id: 4,
          codigo: "C20-1004",
          nombre: "Faro LED + Bocina",
          descripcion: "Kit completo de iluminación LED con bocina integrada. Fácil instalación y alta durabilidad.",
          precio: 14990,
          stock: 20,
          categoria: "Sistema Eléctrico",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GYXJvIExFRCArIEJvY2luYTwvdGV4dD48L3N2Zz4="
        },
        {
          id: 5,
          codigo: "C20-1005",
          nombre: "Acelerador tipo moto",
          descripcion: "Acelerador estilo motocicleta con mango de goma antideslizante. Ideal para scooters de alta potencia.",
          precio: 20000,
          stock: 6,
          categoria: "Sistema Eléctrico",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BY2VsZXJhZG9yIFRpcG8gTW90bzwvdGV4dD48L3N2Zz4="
        },
        {
          id: 6,
          codigo: "C20-1006",
          nombre: "BMS 10S 15A",
          descripcion: "Sistema de gestión de batería 10S 15A para baterías de litio. Compacto y eficiente.",
          precio: 18000,
          stock: 10,
          categoria: "Baterías",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDZiNmQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CTVMgMTNTIDE1QTwvdGV4dD48L3N2Zz4="
        },
        {
          id: 7,
          codigo: "C20-1007",
          nombre: "Motor 1000W 48V",
          descripcion: "Motor brushless 1000W 48V de alta eficiencia. Ideal para conversiones y upgrades de scooters.",
          precio: 45000,
          stock: 5,
          categoria: "Motor y Transmisión",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2YjAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Nb3RvciAxMDAwVyA0OFY8L3RleHQ+PC9zdmc+"
        },
        {
          id: 8,
          codigo: "C20-1008",
          nombre: "Controlador 48V 30A",
          descripcion: "Controlador inteligente 48V 30A con display LCD. Compatible con motores brushless.",
          precio: 35000,
          stock: 7,
          categoria: "Sistema Eléctrico",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOWM5YzljIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Db250cm9sYWRvciA0OFYgMzBBPC90ZXh0Pjwvc3ZnPg=="
        },
        {
          id: 9,
          codigo: "C20-1009",
          nombre: "Batería Li-ion 48V 20Ah",
          descripcion: "Batería de litio 48V 20Ah con celdas de alta calidad. Autonomía de hasta 60km.",
          precio: 120000,
          stock: 3,
          categoria: "Baterías",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDA3Y2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYXRlcmlhIDQ4ViAyMEFoPC90ZXh0Pjwvc3ZnPg=="
        },
        {
          id: 10,
          codigo: "C20-1010",
          nombre: "Luces LED traseras",
          descripcion: "Kit de luces LED traseras con intermitentes. Fácil instalación y máxima visibilidad.",
          precio: 8500,
          stock: 15,
          categoria: "Sistema Eléctrico",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MdWNlcyBMRUQgdHJhc2VyYXM8L3RleHQ+PC9zdmc+"
        },
        {
          id: 11,
          codigo: "C20-1011",
          nombre: "Pastillas de Freno Delanteras",
          descripcion: "Pastillas de freno delanteras de alta calidad para scooters eléctricos. Freno seguro y eficiente.",
          precio: 12500,
          stock: 12,
          categoria: "Sistema de Frenos",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjODAwMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QYXN0aWxsYXMgZGUgRnJlbm88L3RleHQ+PC9zdmc+"
        },
        {
          id: 12,
          codigo: "C20-1012",
          nombre: "Neumático 10 pulgadas",
          descripcion: "Neumático 10 pulgadas para scooter eléctrico. Goma resistente y antideslizante.",
          precio: 18000,
          stock: 8,
          categoria: "Neumáticos",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2NjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OZXVtw6F0aWNvIDEwIHB1bGdhZGFzPC90ZXh0Pjwvc3ZnPg=="
        },
        {
          id: 13,
          codigo: "C20-1013",
          nombre: "Guardabarros Delantero",
          descripcion: "Guardabarros delantero de plástico resistente. Protección contra salpicaduras y agua.",
          precio: 8500,
          stock: 15,
          categoria: "Carrocería",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjYzBjMGMwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HdWFyZGFiYXJyb3MgRGVsYW50ZXJvPC90ZXh0Pjwvc3ZnPg=="
        },
        {
          id: 14,
          codigo: "C20-1014",
          nombre: "Kit de Herramientas Básico",
          descripcion: "Kit de herramientas básico para mantenimiento de scooters eléctricos. Incluye llaves y destornilladores.",
          precio: 25000,
          stock: 6,
          categoria: "Herramientas",
          marca: "Custom20",
          img: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY4YzAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LaXQgZGUgSGVycmFtaWVudGFzPC90ZXh0Pjwvc3ZnPg=="
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

  // Función para generar código único de producto
  function generateUniqueProductCode() {
    const prods = getProducts();
    const existingCodes = prods.map(p => p.codigo).filter(Boolean);
    
    let codigo;
    do {
      // Generar código con formato: C20-XXXX
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      codigo = `C20-${randomNum}`;
    } while (existingCodes.includes(codigo));
    
    return codigo;
  }

  // Funciones para manejo de puntos por usuario
  function getUserPoints(userEmail) {
    const users = getUsers();
    const user = users.find(u => u.email === userEmail);
    return user ? (user.points || 0) : 0;
  }

  function addUserPoints(userEmail, points) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
      users[userIndex].points = (users[userIndex].points || 0) + points;
      saveUsers(users);
      
      // Actualizar sesión actual si es el mismo usuario
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.email === userEmail) {
        currentUser.points = users[userIndex].points;
        localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
      
      return users[userIndex].points;
    }
    return 0;
  }

  function calculateTier(points) {
    if (points >= 1000) return "Pro";
    if (points >= 500) return "Expert";
    if (points >= 200) return "Advanced";
    return "Beginner";
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
    generateUniqueProductCode,
    // Funciones de puntos
    getUserPoints,
    addUserPoints,
    calculateTier
  };
  
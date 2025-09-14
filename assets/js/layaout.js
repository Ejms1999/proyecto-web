// ====== assets/js/layout.js (versión jQuery .load) ======
(function () {
    const CART_KEY = 'APP_CART';
  
    function getCartCount() {
      try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return 0;
        const items = JSON.parse(raw);
        return items.reduce((acc, it) => acc + (Number(it.qty) || 1), 0);
      } catch { return 0; }
    }
  
    function markActiveNavLink() {
      try {
        const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        document.querySelectorAll('a.nav-link').forEach(a => {
          const href = (a.getAttribute('href') || '').toLowerCase();
          if (href === here) a.classList.add('active');
        });
      } catch {}
    }

    function updateScooterPointsDisplay() {
      if (window.AuthStore && window.AuthStore.getCurrentUser) {
        const user = window.AuthStore.getCurrentUser();
        if (user) {
          const points = user.points || 0;
          const tier = window.AuthStore.calculateTier ? window.AuthStore.calculateTier(points) : 'Beginner';
          
          const tierElement = document.getElementById('user-tier');
          const pointsElement = document.getElementById('user-points');
          
          if (tierElement) tierElement.textContent = tier;
          if (pointsElement) pointsElement.textContent = points;
        }
      }
    }
  
    function initNavbarLogic() {
      const user = (window.AuthStore && window.AuthStore.getCurrentUser && window.AuthStore.getCurrentUser()) || null;
  
      const nameEl = document.getElementById('navUserName');
      const logoutBtn = document.getElementById('btnLogout');
      const adminEls = document.querySelectorAll('.admin-only');
      const cartCountEl = document.getElementById('cartCount');
      const scooterPointsSection = document.getElementById('scooterPointsSection');
  
      // Usuario y rol
      if (user) {
        if (nameEl) nameEl.textContent = `${user.name} (${user.role})`;
        if (user.role === 'admin') {
          adminEls.forEach(el => el.classList.remove('d-none'));
          // Ocultar ScooterPoints para administradores
          if (scooterPointsSection) scooterPointsSection.classList.add('d-none');
        } else {
          // Mostrar ScooterPoints para usuarios normales
          if (scooterPointsSection) scooterPointsSection.classList.remove('d-none');
          // Actualizar puntos del usuario
          updateScooterPointsDisplay();
        }
      } else {
        if (nameEl) nameEl.textContent = 'Invitado';
        if (logoutBtn) {
          logoutBtn.classList.add('disabled');
          logoutBtn.setAttribute('tabindex', '-1');
          logoutBtn.setAttribute('aria-disabled', 'true');
        }
        // Ocultar ScooterPoints para usuarios no logueados
        if (scooterPointsSection) scooterPointsSection.classList.add('d-none');
      }
  
      // Carrito
      if (cartCountEl) cartCountEl.textContent = String(getCartCount());
  
      // Logout
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (window.AuthStore && window.AuthStore.logout) {
            window.AuthStore.logout();
          }
          window.location.href = 'login.html';
        });
      }
  
      markActiveNavLink();
  
      // Permite refrescar badge desde otras partes: window.dispatchEvent(new CustomEvent('cart:updated'))
      window.addEventListener('cart:updated', () => {
        const el = document.getElementById('cartCount');
        if (el) el.textContent = String(getCartCount());
      });
    }
  
    // Helper para intentar dos rutas (assets/partials/... y partials/...)
    function loadWithFallback($target, pathA, pathB, after) {
      $target.load(pathA, function (response, status) {
        if (status === 'error') {
          $target.load(pathB, function (response2, status2) {
            if (status2 === 'error') {
              $target.html('<div class="alert alert-danger m-0">No se pudo cargar el contenido.</div>');
            } else {
              after && after();
            }
          });
        } else {
          after && after();
        }
      });
    }
    
    function loadPartials() {
      const $navTarget = $('#navbar-container');
      const $footerTarget = $('#footer-container');
  
      if ($navTarget.length) {
        loadWithFallback($navTarget,
          'assets/partials/navbar.html',
          'partials/navbar.html',
          initNavbarLogic
        );
      }
  
      if ($footerTarget.length) {
        loadWithFallback($footerTarget,
          'assets/partials/footer.html',
          'partials/footer.html',
          () => {
            // Asegurar año dinámico aunque el parcial no traiga script
            const yearEl = document.getElementById('yearNow');
            if (yearEl) yearEl.textContent = new Date().getFullYear();
          }
        );
      }
    }
  
    window.Layout = {
      loadPartials,
      getCartCount,
      initNavbarLogic
    };
  })();
  
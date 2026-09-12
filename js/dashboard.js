/* ================================================================
   Dashboard Pompompurin — sidebar y barra superior compartidas
   entre todas las vistas del tema (Inicio, Pedido, PQRS, Recibo de
   caja, Egreso...) para navegar entre ellas desde un único componente.

   Uso en cada página:
     <div class="app">
       <div id="dashboard-sidebar"></div>
       <main class="main">
         <div id="dashboard-topbar"></div>
         ... resto de la vista ...
       </main>
     </div>
     <script src="ruta/a/js/dashboard.js"></script>
     <script>
       montarDashboard({ activo: 'pqrs', base: '../', titulo: 'PQRS' });
     </script>

   - activo: clave de ITEMS que debe marcarse como enlace activo
   - base:   prefijo relativo hasta la raíz del proyecto
             ('' en index.html, '../' dentro de pages/)
   - titulo: texto que se muestra en la barra superior

   Los íconos del menú son SVG (trazo currentColor, hereda el color
   del enlace); el único emoji que queda es el logo 🍮 de la marca.

   En móvil, abrir el menú también oscurece el contenido (overlay) y
   bloquea el scroll de fondo; se cierra con el propio botón, con
   Escape, tocando el overlay, o al elegir un enlace del menú.
   ================================================================ */
(function () {
    function icon(paths, size) {
        const s = size || 18;
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' +
            'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            paths + '</svg>';
    }

    const ICONO_MENU = icon('<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>', 22);
    const ICONO_CERRAR = icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 22);
    const ICONO_USUARIO = icon('<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>', 18);

    const ITEMS = [
        {
            key: 'inicio', label: 'Inicio', href: 'index.html',
            icon: icon('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>')
        },
        {
            key: 'pedido', label: 'Pedido', href: 'pages/pedido.html',
            icon: icon('<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>')
        },
        {
            key: 'recibo', label: 'Recibo de caja', href: 'pages/recibodecaja.html',
            icon: icon('<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M16 8H8"/><path d="M16 12H8"/><path d="M12 16H8"/>')
        },
        {
            key: 'egreso', label: 'Egreso', href: 'pages/ComprobanteEgreso.html',
            icon: icon('<circle cx="12" cy="12" r="10"/><path d="m16 12-4 4-4-4"/><path d="M12 8v8"/>')
        },
        {
            key: 'pqrs', label: 'PQRS', href: 'pages/PQRS.html',
            icon: icon('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>')
        },
        {
            key: 'platos', label: 'Platos', href: '#',
            icon: icon('<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>')
        },
        {
            key: 'usuarios', label: 'Usuarios', href: '#',
            icon: ICONO_USUARIO
        }
    ];

    function montarDashboard(opts) {
        const { activo = '', base = '', titulo = 'Panel de gestión' } = opts || {};

        const sidebarMount = document.getElementById('dashboard-sidebar');
        const topbarMount  = document.getElementById('dashboard-topbar');
        if (!sidebarMount && !topbarMount) return;

        const enlaces = ITEMS.map((item) => {
            const href = item.href === '#' ? '#' : base + item.href;
            const clase = item.key === activo ? ' class="active"' : '';
            return `<a href="${href}"${clase}>${item.icon}<span>${item.label}</span></a>`;
        }).join('');

        if (sidebarMount) {
            sidebarMount.outerHTML =
                '<aside class="sidebar" id="pompompurin-sidebar">' +
                    '<div class="brand">🍮 <span>Pompompurin</span></div>' +
                    '<nav class="nav">' + enlaces + '</nav>' +
                '</aside>';
        }

        if (topbarMount) {
            topbarMount.outerHTML =
                '<header class="topbar">' +
                    '<button class="menu-btn" id="pompompurin-menu-btn" aria-label="Abrir menú" aria-expanded="false">' + ICONO_MENU + '</button>' +
                    '<b>' + titulo + '</b>' +
                    '<span class="topbar-user">' + ICONO_USUARIO + '<span>Usuario</span></span>' +
                '</header>';
        }

        const btn = document.getElementById('pompompurin-menu-btn');
        const sidebar = document.getElementById('pompompurin-sidebar');
        if (!btn || !sidebar) return;

        // Overlay para cerrar el menú tocando fuera de él (se crea una sola vez)
        let backdrop = document.getElementById('pompompurin-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'pompompurin-backdrop';
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
        }

        function abrirMenu() {
            sidebar.classList.add('open');
            backdrop.classList.add('visible');
            btn.innerHTML = ICONO_CERRAR;
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Cerrar menú');
            document.body.style.overflow = 'hidden';
        }

        function cerrarMenu() {
            sidebar.classList.remove('open');
            backdrop.classList.remove('visible');
            btn.innerHTML = ICONO_MENU;
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Abrir menú');
            document.body.style.overflow = '';
        }

        btn.addEventListener('click', () => {
            sidebar.classList.contains('open') ? cerrarMenu() : abrirMenu();
        });
        backdrop.addEventListener('click', cerrarMenu);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cerrarMenu();
        });
        sidebar.querySelectorAll('.nav a').forEach((a) => {
            a.addEventListener('click', cerrarMenu);
        });
    }

    window.montarDashboard = montarDashboard;
})();

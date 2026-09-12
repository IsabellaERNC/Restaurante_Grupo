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
   ================================================================ */
(function () {
    const ITEMS = [
        { key: 'inicio',   icon: '🏠', label: 'Inicio',         href: 'index.html' },
        { key: 'pedido',   icon: '📋', label: 'Pedido',         href: 'pages/pedido.html' },
        { key: 'recibo',   icon: '🧾', label: 'Recibo de caja', href: 'pages/recibodecaja.html' },
        { key: 'egreso',   icon: '💰', label: 'Egreso',         href: 'pages/ComprobanteEgreso.html' },
        { key: 'pqrs',     icon: '📊', label: 'PQRS',           href: 'pages/PQRS.html' },
        { key: 'platos',   icon: '🍴', label: 'Platos',         href: '#' },
        { key: 'usuarios', icon: '👤', label: 'Usuarios',       href: '#' }
    ];

    function montarDashboard(opts) {
        const { activo = '', base = '', titulo = 'Panel de gestión' } = opts || {};

        const sidebarMount = document.getElementById('dashboard-sidebar');
        const topbarMount  = document.getElementById('dashboard-topbar');
        if (!sidebarMount && !topbarMount) return;

        const enlaces = ITEMS.map((item) => {
            const href = item.href === '#' ? '#' : base + item.href;
            const clase = item.key === activo ? ' class="active"' : '';
            return `<a href="${href}"${clase}>${item.icon} ${item.label}</a>`;
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
                    '<button class="menu-btn" id="pompompurin-menu-btn" aria-label="Abrir menú">☰</button>' +
                    '<b>' + titulo + '</b>' +
                    '<span>👤 Usuario</span>' +
                '</header>';
        }

        const btn = document.getElementById('pompompurin-menu-btn');
        const sidebar = document.getElementById('pompompurin-sidebar');
        if (btn && sidebar) {
            btn.addEventListener('click', () => sidebar.classList.toggle('open'));
        }
    }

    window.montarDashboard = montarDashboard;
})();

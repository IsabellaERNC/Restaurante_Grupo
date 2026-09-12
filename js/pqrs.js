/* ================================================================
   PQRS · lógica de radicación, consulta e historial
   Persistencia local con localStorage (clave: pqrs_solicitudes)
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    /* ---------- Pestañas ---------- */
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
            btn.classList.add('active');
            $('tab-' + btn.dataset.tab).classList.add('active');
            if (btn.dataset.tab === 'historial') renderHistorial();
        });
    });

    /* ---------- Selección del tipo de solicitud ---------- */
    document.querySelectorAll('.tipo-card').forEach((card) => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.tipo-card').forEach((c) => c.classList.remove('selected'));
            card.classList.add('selected');
            $('tipo-seleccionado').value = card.dataset.tipo;
        });
    });

    /* ---------- Almacenamiento ---------- */
    const KEY = 'pqrs_solicitudes';

    function getSolicitudes() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || [];
        } catch {
            return [];
        }
    }
    function saveSolicitudes(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    const clasesTipo = {
        'Petición': 'badge-peticion',
        'Queja': 'badge-queja',
        'Reclamo': 'badge-reclamo',
        'Sugerencia': 'badge-sugerencia'
    };
    const clasesEstado = {
        'Recibido': 'estado-recibido',
        'En proceso': 'estado-en-proceso',
        'Resuelto': 'estado-resuelto'
    };

    /* ---------- Utilidades ---------- */
    function generarRadicado(lista) {
        const anio = new Date().getFullYear();
        const prefijo = `PQRS-${anio}-`;
        const consecutivo = lista.filter((s) => s.radicado.startsWith(prefijo)).length + 1;
        return prefijo + String(consecutivo).padStart(4, '0');
    }

    function formatFecha(iso) {
        return new Date(iso).toLocaleDateString('es-CO', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (c) => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    }

    /* ---------- Radicar solicitud ---------- */
    $('btn-radicar').addEventListener('click', () => {
        const tipo    = $('tipo-seleccionado').value;
        const nombre  = $('nombre').value.trim();
        const email   = $('email').value.trim();
        const asunto  = $('asunto').value.trim();
        const desc    = $('descripcion').value.trim();
        const err     = $('form-error');
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        let msg = '';
        if (!tipo)          msg = 'Selecciona el tipo de solicitud.';
        else if (!nombre)   msg = 'El nombre es obligatorio.';
        else if (!email)    msg = 'El correo es obligatorio.';
        else if (!emailOk)  msg = 'Ingresa un correo electrónico válido.';
        else if (!asunto)   msg = 'El asunto es obligatorio.';
        else if (!desc)     msg = 'La descripción es obligatoria.';

        if (msg) {
            err.textContent = msg;
            err.style.display = 'block';
            return;
        }
        err.style.display = 'none';

        const lista = getSolicitudes();
        const solicitud = {
            radicado: generarRadicado(lista),
            tipo,
            nombre,
            email,
            telefono: $('telefono').value.trim(),
            asunto,
            descripcion: desc,
            fecha: new Date().toISOString(),
            estado: 'Recibido'
        };
        lista.unshift(solicitud);
        saveSolicitudes(lista);

        $('radicado-num').textContent = solicitud.radicado;
        $('radicado-box').classList.add('visible');
        $('btn-radicar').style.display = 'none';
        $('radicado-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    /* ---------- Radicar otra ---------- */
    $('btn-nueva').addEventListener('click', () => {
        ['nombre', 'email', 'telefono', 'asunto', 'descripcion'].forEach((id) => {
            $(id).value = '';
        });
        $('tipo-seleccionado').value = '';
        document.querySelectorAll('.tipo-card').forEach((c) => c.classList.remove('selected'));
        $('radicado-box').classList.remove('visible');
        $('btn-radicar').style.display = 'inline-block';
        $('form-error').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- Consultar estado ---------- */
    function consultar() {
        const val = $('input-radicado').value.trim().toUpperCase();
        const s = getSolicitudes().find((x) => x.radicado === val);

        $('resultado-card').classList.remove('visible');
        $('not-found').classList.remove('visible');

        if (!val) return;
        if (!s) {
            $('not-found').classList.add('visible');
            return;
        }

        $('res-asunto').textContent      = s.asunto;
        $('res-radicado').textContent    = s.radicado;
        $('res-fecha').textContent       = formatFecha(s.fecha);
        $('res-descripcion').textContent = s.descripcion;
        $('res-nombre').textContent      = s.nombre;

        const tipoBadge = $('res-tipo-badge');
        tipoBadge.className = 'badge ' + (clasesTipo[s.tipo] || '');
        tipoBadge.textContent = s.tipo;

        const estadoBadge = $('res-estado-badge');
        estadoBadge.className = 'estado-badge ' + (clasesEstado[s.estado] || '');
        estadoBadge.textContent = s.estado;

        $('tl-recibido').textContent = formatFecha(s.fecha);

        const enProceso = s.estado === 'En proceso' || s.estado === 'Resuelto';
        $('dot-proceso').classList.toggle('inactive', !enProceso);
        $('tl-proceso').textContent = enProceso ? 'En revisión por el equipo' : 'Pendiente';

        const resuelto = s.estado === 'Resuelto';
        $('dot-resuelto').classList.toggle('inactive', !resuelto);
        $('tl-resuelto').textContent = resuelto ? 'Solicitud resuelta' : 'Pendiente';

        $('resultado-card').classList.add('visible');
    }

    $('btn-consultar').addEventListener('click', consultar);
    $('input-radicado').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') consultar();
    });

    /* ---------- Historial ---------- */
    function renderHistorial() {
        const lista = getSolicitudes();
        const cont = $('historial-container');

        if (!lista.length) {
            cont.innerHTML = '<p class="historial-empty">No hay solicitudes registradas aún.</p>';
            return;
        }

        const filas = lista.map((s) => `
            <tr>
                <td class="radicado-cell">${escapeHtml(s.radicado)}</td>
                <td><span class="badge ${clasesTipo[s.tipo] || ''}">${escapeHtml(s.tipo)}</span></td>
                <td>${escapeHtml(s.asunto)}</td>
                <td>${escapeHtml(s.nombre)}</td>
                <td style="font-size:13px">${formatFecha(s.fecha)}</td>
                <td><span class="estado-badge ${clasesEstado[s.estado] || ''}">${escapeHtml(s.estado)}</span></td>
            </tr>`).join('');

        cont.innerHTML = `
            <div style="overflow-x:auto">
                <table class="historial-table">
                    <thead>
                        <tr>
                            <th>Radicado</th><th>Tipo</th><th>Asunto</th>
                            <th>Solicitante</th><th>Fecha</th><th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>
            </div>`;
    }

    $('btn-limpiar').addEventListener('click', () => {
        if (confirm('¿Eliminar todas las solicitudes registradas?')) {
            saveSolicitudes([]);
            renderHistorial();
        }
    });
});

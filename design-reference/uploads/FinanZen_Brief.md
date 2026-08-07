# FinanZen — Brief Completo para Prototipo

> **Instrucción de diseño:** Construye un prototipo PWA **funcional e interactivo** (Mobile-First, también responsive a desktop) basándote 100% en este documento. Usa datos de ejemplo (mock) para que todo se vea "vivo". La navegación entre pantallas debe funcionar. Aplica la paleta de colores exacta. Prioriza las pantallas marcadas como ⭐ CRÍTICA.

---

## 1. QUÉ ES FINANZEN

**FinanZen** es una Progressive Web App (PWA) SaaS de gestión financiera para **micro y pequeños comerciantes dominicanos** (colmados, ferreterías, salones, bodegas, cafeterías, tiendas de ropa).

**Problema que resuelve:** El 85%+ de los negocios dominicanos llevan sus finanzas en cuadernos o Excel, sin saber si ganan dinero, sin proyectar liquidez y sin historial para acceder a crédito.

**Propuesta de valor:**
- Registrar ingresos y gastos en 3 toques.
- Ver el estado financiero en tiempo real (dashboard con KPIs).
- Recibir alertas inteligentes (presupuesto excedido, balance negativo, deudas vencidas).
- Exportar reportes en PDF/Excel para bancos o contadores.
- Todo en español, en pesos dominicanos (DOP), pensado para usarse desde el celular.

**Tono de la interfaz:** Amigable, sin jerga contable, directo, empoderante. Ejemplo de microcopy: en vez de "Error en validación de datos", usar "Verifica que el monto sea un número válido".

---

## 2. PALETA DE COLORES OFICIAL

```
NEUTRO
Crema/Beige     #F5F1E8   → fondos suaves, secciones, cards
Blanco          #FFFFFF   → fondo principal

VERDES (crecimiento / dinero)
Verde Pastel    #D4E5A2   → highlights, fondos positivos, barras
Verde Medio     #5A9B6F   → BOTÓN PRIMARIO, ingresos, valores positivos
Verde Oscuro    #1B5E3F   → headings, énfasis, números grandes, hover

ACENTO
Teal            #2B8A8A   → BOTÓN SECUNDARIO, links, iconos, info

SEMÁNTICOS (derivados, para estados)
Gasto/Marrón    #8B4513   (fondo #F5DEB3) → gastos, valores negativos
Advertencia     #CC8800   (fondo #FFE4B5) → alertas, presupuesto en riesgo
Error/Crítico   #C41E3A   (fondo #FFE4E1) → saldo negativo, deudas vencidas

TEXTO
Heading         #1B5E3F
Cuerpo          #2D3748
Secundario      #718096
Placeholder     #A0AEC0
Deshabilitado   #E2E8F0
```

**Reglas rápidas de color:**
- Ingreso → siempre verde `#5A9B6F`, con flecha ↑
- Gasto → siempre marrón `#8B4513`, con flecha ↓
- Botón primario → `#5A9B6F`, hover `#1B5E3F`, texto blanco
- Botón secundario → `#2B8A8A`, hover `#1F6566`, texto blanco
- Botón outline → borde `#5A9B6F`, texto `#5A9B6F`, hover fondo `#D4E5A2`
- Card → fondo `#F5F1E8`, radio 8px, sombra suave
- Input focus → borde `#5A9B6F` 2px + glow verde suave

**Tipografía:**
- Headings: Inter Bold (H1 28px, H2 22px, H3 18px) en `#1B5E3F`
- Cuerpo: Inter Regular 14px en `#2D3748`
- Montos/números: Roboto Mono o Inter, Bold, 18–24px en `#1B5E3F`

**Iconografía:** Lucide icons (wallet, trending-up, trending-down, bell, alert-circle, check-circle, x-circle, file-text, bar-chart, users, settings, plus, log-out, filter, download).

---

## 3. USUARIOS Y ROLES

| Rol | Quién es | Qué puede hacer |
|-----|----------|-----------------|
| **Administrador** ⭐ | El dueño del negocio | TODO: transacciones, dashboard completo, reportes, alertas, presupuestos, gestionar usuarios, auditoría |
| **Cajero / Asistente** | Empleado | Solo registrar ingresos/gastos diarios. NO ve balances globales ni reportes consolidados |
| **Contador** (externo) | Asesor | Acceso de solo-lectura a reportes exportados (PDF/Excel) |

El prototipo se diseña principalmente desde la vista del **Administrador**. Mostrar el rol activo en la barra superior o en el perfil.

---

## 4. NAVEGACIÓN GLOBAL

### Bottom Navigation (Mobile) — 5 ítems fijos
```
[ 🏠 Inicio ] [ 📋 Movim. ] [ ➕ ] [ 📊 Reportes ] [ ⚙️ Más ]
```
- El botón central **➕** es un FAB (Floating Action Button) grande, color `#5A9B6F`, que abre "Registrar Transacción".
- Ítem activo: icono y label en `#5A9B6F`. Inactivo: `#A0AEC0`.

### Sidebar (Desktop) — navegación vertical
```
FinanZen (logo)
─────────────
🏠 Dashboard
📋 Transacciones
💰 Presupuestos
🔔 Alertas
💳 Cuentas por Cobrar
📤 Cuentas por Pagar
📊 Reportes
👥 Usuarios
⚙️ Configuración
─────────────
👤 Ali Guzmán (Admin)
🚪 Cerrar sesión
```

### Mapa de navegación (flujo entre pantallas)
```
Login ──► Dashboard ──┬─► Registrar Transacción (modal) ──► vuelve a Dashboard
                      ├─► Transacciones (lista) ──► Detalle/Editar
                      ├─► Presupuestos ──► Crear/Editar presupuesto
                      ├─► Alertas ──► Configurar alerta
                      ├─► Cuentas por Cobrar ──► Nueva deuda
                      ├─► Cuentas por Pagar ──► Nuevo pago
                      ├─► Reportes ──► Exportar (PDF/Excel/Email)
                      ├─► Usuarios (solo admin) ──► Agregar/Editar usuario
                      └─► Configuración ──► Perfil / Negocio / Preferencias
```

---

## 5. PANTALLAS DETALLADAS

> Para cada pantalla: propósito, componentes, datos mock y comportamiento interactivo.

---

### 5.1 LOGIN / REGISTRO

**Propósito:** Autenticación de entrada.

**Componentes:**
- Logo "FinanZen" centrado (texto: "Finan" en `#1B5E3F` + "Zen" en `#5A9B6F`).
- Subtítulo: "Gestión Financiera Inteligente".
- Card central blanca con sombra.
- Input Email, Input Contraseña (con ojo para mostrar/ocultar).
- Checkbox "Recuérdame".
- Botón primario "Iniciar Sesión" (`#5A9B6F`).
- Links: "¿Olvidaste tu contraseña?" y "Crear cuenta nueva" (`#2B8A8A`).
- Tab/switch entre **Iniciar Sesión** y **Registrarme**.

**Datos mock para auto-llenar (demo):** `ali@colmado.com` / `••••••••`

**Comportamiento:**
- Al pulsar "Iniciar Sesión" → navega al **Dashboard**.
- Validación visual: si el email está vacío, borde rojo `#C41E3A` y mensaje.
- "Crear cuenta" → flujo de Onboarding (5.2).

---

### 5.2 ONBOARDING (3 pasos, solo primer uso)

**Propósito:** Configurar el negocio rápido.

**Paso 1 — Datos del negocio:** Nombre comercial, Rubro (dropdown: Colmado, Ferretería, Salón, Bodega, Cafetería, Otro), RNC (opcional).
**Paso 2 — Saldo inicial:** "¿Con cuánto dinero empiezas hoy?" → input monto DOP.
**Paso 3 — Primera alerta:** "Te avisamos si tu balance baja de…" → input monto, toggle activar.

**Componentes:** Stepper superior (●─●─○), botones "Atrás" (outline) y "Siguiente" (primario). En el último paso: "Empezar a usar FinanZen" → Dashboard.

---

### 5.3 DASHBOARD PRINCIPAL ⭐ CRÍTICA

**Propósito:** Vista de aterrizaje. Resume todo el estado financiero "de un vistazo".

**Estructura (de arriba a abajo):**

1. **Header:** Saludo "👋 ¡Hola, Ali!" + fecha de hoy + icono notificaciones (badge "2").
2. **Selector de período:** chips [ Hoy ] [ Semana ] [ Mes ] [ Personalizado ] — activo en `#5A9B6F`.
3. **Cards de KPI (4):**
   - **Saldo Total:** RD$ 32,940.50 · ↑ +12% vs mes anterior (verde)
   - **Ingresos del mes:** RD$ 87,450.00 · ↑ (verde `#5A9B6F`)
   - **Gastos del mes:** RD$ 54,320.00 · ↓ (marrón `#8B4513`)
   - **Ganancia Neta:** RD$ 33,130.00 · Margen 37.9% (verde oscuro)
4. **Widget de Alertas activas (máx 3):**
   - ⚠️ Presupuesto Inventario: 92% consumido (fondo `#FFE4B5`)
   - 💳 Deuda de Rosa Rodríguez vence en 3 días
   - (tocar una alerta lleva a la pantalla relacionada)
5. **Gráfica Ingresos vs Gastos (últimos 7 días):** gráfica de líneas/barras. Línea ingresos `#5A9B6F`, línea gastos `#8B4513`. Leyenda abajo.
6. **Gráfica de dona "Gastos por categoría":** Inventario, Salarios, Servicios, Otros (tonos de verde/teal).
7. **Acciones rápidas:** [+ Registrar] (primario) · [📊 Ver Reportes] (secundario) · [🔔 Alertas] (outline).
8. **Mini-lista "Últimos movimientos" (3):** enlaza a Transacciones.

**Datos mock para gráfica (7 días):**
```
Día    Ingresos   Gastos
Lun    8,200      3,100
Mar    6,500      4,800
Mié   12,300      2,200
Jue    9,100      6,400
Vie   15,200      8,900
Sáb   18,700     11,200
Dom    7,400      3,300
```

**Comportamiento:**
- Cambiar el chip de período recalcula (mock) los KPIs y la gráfica.
- Los KPIs son cards clicables (Ingresos → Transacciones filtradas por ingreso, etc.).

---

### 5.4 REGISTRAR TRANSACCIÓN ⭐ CRÍTICA (modal o pantalla full)

**Propósito:** El flujo que el comerciante usa decenas de veces al día. Debe ser rapidísimo.

**Componentes (en orden):**
1. **Selector Tipo:** dos botones grandes tipo toggle: [ ↑ INGRESO ] (verde) / [ ↓ GASTO ] (marrón). Por defecto INGRESO seleccionado.
2. **Monto:** input grande, prefijo "RD$", teclado numérico. Fuente Roboto Mono grande.
3. **Categoría:** chips o dropdown que **cambian según el tipo**:
   - Si INGRESO: Ventas, Servicios, Préstamo recibido, Otros ingresos
   - Si GASTO: Inventario, Salarios, Servicios (luz/agua), Renta, Transporte, Otros gastos
4. **Descripción:** input texto opcional ("Ej: Venta de mercancía").
5. **Fecha/Hora:** autocompletada a hoy, editable.
6. **Adjuntar comprobante:** botón outline opcional ("📎 Adjuntar foto").
7. **Botones:** [ Guardar ] (primario) · [ Guardar y nuevo ] (secundario) · [ Cancelar ] (texto).

**Validaciones:**
- Monto > 0 (si vacío o 0 → borde rojo + mensaje).
- Categoría obligatoria.
- Fecha no futura.

**Comportamiento:**
- Al Guardar → toast verde "✅ Guardado: Ingreso de RD$5,200" → cierra modal → Dashboard actualizado (el KPI de saldo "sube" con micro-animación).
- "Guardar y nuevo" → guarda y limpia el formulario para otra entrada.

---

### 5.5 TRANSACCIONES (Historial)

**Propósito:** Ver, filtrar y buscar todos los movimientos.

**Componentes:**
- Barra superior: buscador + [Filtro ▼] + chips [Todos][Ingresos][Gastos] + período.
- Resumen del período filtrado: "Ingresos: RD$X · Gastos: RD$Y · Neto: RD$Z".
- Lista de items (scroll infinito). Cada item:
  - Borde izquierdo de color (verde ingreso / marrón gasto).
  - Fecha + hora, monto (con signo y color), categoría, descripción, badge tipo.
  - Tocar → detalle/editar (admin) o solo ver (cajero).
- Botón [📊 Exportar] arriba a la derecha.

**Datos mock (lista):**
```
21 JUN 14:30  +RD$ 5,200.00   Ventas        "Venta mercancía"   ↑
21 JUN 12:00  −RD$ 1,500.00   Inventario    "Pago proveedor"    ↓
21 JUN 10:15  +RD$ 3,800.00   Ventas        "Venta del día"     ↑
20 JUN 18:40  −RD$   300.00   Servicios     "Recarga luz"       ↓
20 JUN 09:15  −RD$ 1,200.00   Salarios      "Pago empleado"     ↓
19 JUN 16:00  +RD$ 9,100.00   Ventas        "Cierre de caja"    ↑
```

---

### 5.6 PRESUPUESTOS & LÍMITES ⭐

**Propósito:** Definir techos de gasto por categoría y ver consumo.

**Componentes:**
- Selector de mes (Junio 2026).
- Por cada presupuesto, una card con:
  - Nombre de categoría (`#1B5E3F`).
  - "Límite: RD$X · Consumido: RD$Y".
  - **Barra de progreso** con regla de color:
    - 0–50% → barra `#5A9B6F` sobre fondo `#D4E5A2`
    - 50–90% → barra `#5A9B6F`, mostrar %
    - 90–100% → barra `#CC8800`, card con fondo `#FFE4B5`, badge ⚠️
    - >100% → barra `#C41E3A`, fondo `#FFE4E1`, badge 🚨 "Excedido"
  - Botón [Editar].
- Botón [+ Nuevo Presupuesto] (primario).

**Datos mock:**
```
Inventario   Límite 20,000   Consumido 18,400  → 92%  ⚠️
Salarios     Límite 15,000   Consumido 12,500  → 83%
Servicios    Límite  5,000   Consumido  2,100  → 42%
Renta        Límite  8,000   Consumido  8,000  → 100% 🚨
```

---

### 5.7 ALERTAS CONFIGURABLES ⭐

**Propósito:** Encender/apagar y configurar alertas inteligentes.

**Componentes (lista de alertas, cada una con toggle + config):**
1. **Presupuesto Superado** — toggle ON. "Avisar cuando un gasto supere el 90% del límite."
2. **Balance Negativo** — toggle ON. "Avisar si el saldo baja de RD$ [____]." (input)
3. **Meses Negativos Consecutivos** — toggle ON. "Avisar tras [2] meses negativos."
4. **Deudas Vencidas** — toggle ON. "Recordar [7] días antes del vencimiento."
5. **Ingreso Bajo** — toggle OFF. "Avisar si los ingresos del día son menores a RD$ [____]."

- Bloque "Canales de notificación": checkboxes [✓ Email] [✓ WhatsApp] [✓ En la app].
- Botón [Guardar cambios] (primario) + link [Ver historial de alertas].

**Toggle ON = `#5A9B6F`, OFF = `#A0AEC0`.**

---

### 5.8 CUENTAS POR COBRAR

**Propósito:** Dinero que le deben al negocio.

**Componentes:**
- Header: [+ Nueva Deuda] + total: "Por cobrar: RD$ 19,500".
- Cards por deudor:
  - Nombre cliente, monto, fecha de vencimiento, días restantes.
  - Estado: ⏳ PENDIENTE (fondo neutro) / ❌ VENCIDA (fondo `#FFE4E1`, texto `#C41E3A`).
  - Botón [Marcar pagado] → al pulsar, la card se anima y pasa a "✅ Cobrado".
- Resumen abajo: "Pendiente: RD$17,500 · Vencido: RD$2,000".

**Datos mock:**
```
Juan López          RD$ 5,000    vence 25/06   (4 días)   PENDIENTE
Supermercado ABC    RD$12,500    vence 30/06   (9 días)   PENDIENTE
Rosa Rodríguez      RD$ 2,000    venció 15/06  (hace 6d)  VENCIDA
```

---

### 5.9 CUENTAS POR PAGAR

**Propósito:** Dinero que el negocio debe a proveedores.

**Componentes:**
- Header: [+ Nuevo Pago] + total: "Por pagar: RD$ 23,500".
- Cards por proveedor (igual estructura que CxC).
- **Banner de flujo de caja:** si (saldo + por cobrar) < por pagar → banner ⚠️ `#FFE4B5`: "Flujo de caja en riesgo. Necesitas RD$5,200 para cubrir pagos próximos."

**Datos mock:**
```
Importadora Central       RD$ 8,500   vence 30/06   PENDIENTE
Distribuidora El Mayorista RD$15,000  vence 05/07   PENDIENTE
```

---

### 5.10 REPORTES & EXPORTACIÓN ⭐

**Propósito:** Resumen financiero y exportación.

**Componentes:**
- Selector Período (mes) + Año.
- **Resumen del mes:** Ingresos, Gastos, Ganancia Neta (grande, verde), Margen %.
- **Desglose por categoría** (tabla con mini-barras).
- **Flujo de caja:** Saldo inicial + Ingresos − Gastos = Saldo final.
- **Gráfica** del mes (barras).
- Botones de exportación: [📄 PDF] [📊 Excel] [🖨️ Imprimir] [📧 Email] (secundarios `#2B8A8A`).

**Comportamiento:** al pulsar PDF/Excel → toast "Generando reporte…" → "✅ Reporte listo para descargar" (simulado).

**Datos mock:**
```
JUNIO 2026
Ingresos:  RD$ 87,450
Gastos:    RD$ 54,320
Ganancia:  RD$ 33,130   (Margen 37.9%)

Por categoría:
  Ventas      87,450
  Inventario  20,300
  Salarios    15,000
  Servicios    4,200
  Otros       14,820

Flujo de caja:
  Saldo inicial  10,000
  + Ingresos     87,450
  − Gastos       54,320
  = Saldo final  43,130
```

---

### 5.11 GESTIÓN DE USUARIOS (solo Admin)

**Propósito:** Administrar quién accede al negocio.

**Componentes:**
- [+ Agregar Usuario].
- Cards por usuario: nombre, email, rol (badge: Admin `#FFD700`/dorado, Cajero `#2B8A8A`/teal), estado (✅ Activo verde / ⚪ Inactivo gris).
- Acciones: [Editar] [Cambiar Rol] [Activar/Desactivar] [Eliminar].

**Datos mock:**
```
⭐ Ali Guzmán      ali@colmado.com     Administrador   Activo  (Tú)
📦 Carlos Martínez carlos@colmado.com  Cajero          Activo
📦 María Rodríguez maria@colmado.com   Cajero          Inactivo
```

---

### 5.12 CONFIGURACIÓN & PERFIL

**Secciones (acordeón o tabs):**
- **Perfil:** Nombre, Email, [Cambiar contraseña].
- **Mi Negocio:** Nombre comercial, Rubro, RNC.
- **Preferencias:** Idioma (Español), **Tema (Claro / Oscuro)**, Moneda (DOP), Zona horaria.
- **Notificaciones:** Email / WhatsApp / En-app (toggles).
- **Seguridad:** 2FA (toggle), gestionar dispositivos.
- **Datos & Privacidad:** Descargar mis datos, Política de privacidad, Borrar cuenta.
- Botones: [Guardar cambios] (primario) · [Cerrar sesión] (outline rojo) → vuelve a Login.

---

## 6. COMPONENTES BASE (especificación de estilo)

**Botón primario:** fondo `#5A9B6F`, texto blanco bold, padding 12×24, radio 8px; hover `#1B5E3F` + sombra verde suave; disabled fondo `#E2E8F0` texto `#A0AEC0`.

**Botón secundario:** fondo `#2B8A8A`, texto blanco; hover `#1F6566`.

**Botón outline:** transparente, borde 2px `#5A9B6F`, texto `#5A9B6F`; hover fondo `#D4E5A2`.

**Input/Textarea:** fondo blanco, borde 1px `#E2E8F0`, radio 6px; focus borde 2px `#5A9B6F` + glow; error borde `#C41E3A` + mensaje.

**Card:** fondo `#F5F1E8`, borde 1px `#E2E8F0`, radio 8px, padding 16px, sombra suave; hover sombra más marcada.

**Badge:** Éxito (fondo `#D4E5A2` / texto `#1B5E3F`), Advertencia (fondo `#FFE4B5` / `#CC8800`), Error (fondo `#FFE4E1` / `#C41E3A`), Neutral (fondo `#E2E8F0` / `#718096`).

**Toggle:** OFF `#A0AEC0`, ON `#5A9B6F`, círculo blanco, transición 200ms.

**Checkbox/Radio:** borde `#D4E5A2`; checked fondo `#5A9B6F`, check blanco; focus glow verde.

**Toast/Notificación:** Éxito fondo `#D4E5A2`; Error fondo `#FFE4E1`; aparece arriba, se va a los 3s.

**Barra de progreso:** fondo `#D4E5A2`, relleno `#5A9B6F` (o `#CC8800`/`#C41E3A` según umbral).

---

## 7. ESTRUCTURA DE DATOS (para los mocks)

```javascript
// Transacción
{ id, businessId, type: "INGRESO"|"GASTO", amount, category, description, date, userId, documentUrl? }

// Usuario
{ id, email, role: "ADMIN"|"CAJERO"|"CONTADOR", businessId, fullName, lastLogin, isActive }

// Presupuesto
{ id, businessId, category, limitAmount, consumed, month }  // month = "YYYY-MM"

// Alerta
{ id, businessId, type: "PRESUPUESTO"|"BALANCE"|"MESES_NEG"|"DEUDA"|"INGRESO_BAJO",
  isActive, threshold, channels: ["EMAIL","WHATSAPP","IN_APP"] }

// Cuenta por Cobrar / Pagar
{ id, businessId, party, amount, dueDate, status: "PENDIENTE"|"PAGADO"|"VENCIDA", direction: "COBRAR"|"PAGAR" }

// Negocio
{ id, name, rubro, rnc, initialBalance, currency: "DOP" }
```

---

## 8. LÓGICA / REGLAS DE NEGOCIO (para que el prototipo "razone")

1. **Saldo total** = saldo inicial + Σ(ingresos) − Σ(gastos).
2. **Ganancia neta del período** = Σ ingresos − Σ gastos del período.
3. **Margen** = ganancia neta ÷ ingresos × 100.
4. **Consumo de presupuesto** = Σ gastos de esa categoría en el mes ÷ límite × 100.
5. **Disparo de alerta presupuesto**: si consumo ≥ 90% → alerta.
6. **Disparo de alerta balance**: si saldo < umbral configurado → alerta crítica.
7. **Cuenta vencida**: si hoy > dueDate y status = PENDIENTE → VENCIDA (color rojo).
8. **Flujo de caja en riesgo (CxP)**: si saldo + total_por_cobrar < total_por_pagar próximo → banner de advertencia.
9. **Permisos**: rol CAJERO no ve KPIs globales ni Reportes ni Usuarios; solo Registrar y su propio historial.
10. **Tiempo real (simulado)**: al registrar una transacción, el Dashboard y KPIs se actualizan al instante (patrón Observer del proyecto).

---

## 9. PATRONES DE DISEÑO DEL PROYECTO (contexto técnico, no UI)

- **Strategy** → exportación de reportes intercambiable (PDF / Excel / futuro CSV) vía interfaz `IExportStrategy.execute(data)`. En el prototipo se refleja en los botones de exportación que "delegan" según formato.
- **Observer** → la UI (Dashboard, KPIs, gráficas, alertas) se suscribe a cambios en transacciones; al insertar un movimiento, se re-renderiza todo lo afectado. En el prototipo: actualización instantánea tras Guardar.

---

## 10. STACK OBJETIVO (referencia, el prototipo lo simula)

React 18 + TypeScript + Vite · Tailwind CSS · Recharts (gráficas) · Zustand/Context (estado) · Supabase (PostgreSQL 15, Auth, Realtime, Storage) · Vercel (hosting Edge) · PWA (Service Worker + manifest) · jsPDF + XLSX (exportación).

---

## 11. REQUERIMIENTOS NO FUNCIONALES (que el diseño debe respetar)

- **Mobile-First**, responsive a tablet/desktop.
- Cualquier acción en **≤ 3 toques**.
- Dashboard percibido como rápido (< 2s); usar skeletons/loaders.
- **Modo oscuro** disponible (fondo `#1A1A1A`, cards `#2D2D2D`, texto crema `#F5F1E8`, acentos verdes/teal más brillantes).
- Accesibilidad WCAG AA: contraste suficiente, labels en inputs, foco visible (`#2B8A8A` 2px), mensajes de error claros.
- Funciona offline (caché) — indicar visualmente cuando está sin conexión.

---

## 12. PRIORIDADES PARA EL PROTOTIPO

**P0 — construir primero (núcleo demostrable):**
1. Login → Dashboard
2. Registrar Transacción (modal funcional)
3. Transacciones (lista con filtros)
4. Reportes (con gráficas + botones exportar)
5. Alertas (toggles funcionales)

**P1 — alta:**
6. Presupuestos (barras de progreso)
7. Cuentas por Cobrar / por Pagar
8. Gestión de Usuarios
9. Configuración + Modo Oscuro

**P2 — opcional/futuro:** Onboarding, 2FA, integración WhatsApp, análisis predictivo, importar CSV.

---

## 13. CHECKLIST DE ENTREGA DEL PROTOTIPO

- [ ] Navegación funcional entre todas las pantallas P0
- [ ] FAB ➕ abre Registrar Transacción desde cualquier pantalla
- [ ] Paleta oficial aplicada en todos los componentes
- [ ] Ingresos en verde, gastos en marrón, alertas en naranja, crítico en rojo
- [ ] Dashboard con 4 KPIs + 2 gráficas + widget de alertas
- [ ] Registrar Transacción con validación y toast de éxito
- [ ] Lista de Transacciones con filtros Todos/Ingresos/Gastos
- [ ] Presupuestos con barras y umbrales de color
- [ ] Alertas con toggles ON/OFF y campos configurables
- [ ] Reportes con resumen, desglose y botones de exportación
- [ ] Responsive: bottom-nav en mobile, sidebar en desktop
- [ ] Estados de carga (skeletons) y mensajes de error/éxito
- [ ] Modo oscuro (al menos en Dashboard y Config)

---

**FinanZen — Proyecto Integrador II · UNIBE**
**Equipo:** José Alonso · David Beltrán · Eduardo Alba · **Docente:** Julissa Mateo
**Versión del brief:** 1.0 — 21 de junio de 2026

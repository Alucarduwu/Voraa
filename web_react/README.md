<h1 align="center">VORAA Web Portal</h1>

<p align="center">
  <b>Panel responsive para staff de restaurante y administradores</b><br/>
  <i>React + TypeScript + Vite + Firebase + Tailwind CSS</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.5-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-12.13-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

---

## Que hace

El portal web es la herramienta del restaurante y del administrador. Desde aqui el staff valida el QR del cliente, revisa los cupones activos, abre cuentas, agrega productos y cierra la cuenta con descuentos y propinas sugeridas.

Tambien incluye vistas administrativas para revisar usuarios, restaurantes, cupones, cuentas y reportes de friccion.

---

## Stack

| Area | Tecnologia |
|---|---|
| Framework | React 19 |
| Lenguaje | TypeScript |
| Build tool | Vite |
| Rutas | react-router-dom |
| Datos | Firebase Firestore |
| QR scanner | html5-qrcode |
| QR render | qrcode.react |
| Iconos | lucide-react |
| Estilos | Tailwind CSS + CSS custom properties |
| Motion | framer-motion |
| Calidad | ESLint + TypeScript build |

---

## Pantallas principales

| Ruta | Vista |
|---|---|
| `/dashboard` | Panel del restaurante con metricas y accesos rapidos |
| `/scanner` | Scanner QR/codigo y cupones activos del cliente |
| `/bills` | Listado de cuentas activas |
| `/bill/:id` | Detalle de cuenta, productos, totales y cierre |
| `/products` | Menu digital del restaurante |
| `/reports` | Reportes de friccion |
| `/admin` | Dashboard global de administrador |
| `/admin/users` | Directorio de usuarios |
| `/admin/venues` | Restaurantes |
| `/admin/coupons` | Beneficios por restaurante |

---

## Flujo del scanner

```txt
Staff entra a /scanner
        |
Escanea el QR del cliente o escribe su codigo
        |
scannerService busca el usuario en Firestore
        |
scannerService trae cupones requested del venue actual
        |
Filtra cupones activos y vigentes
        |
La UI muestra "Cupones activos"
        |
Staff abre la cuenta con esos beneficios
```

Un cupon se considera activo para redimir cuando:

- Pertenece al usuario escaneado.
- Pertenece al restaurante actual.
- Esta en `savedCoupons` con estado `requested`.
- El documento de `coupons` tiene `active: true`.
- Esta dentro de la ventana `validFrom` / `validUntil`, cuando esas fechas existen.

---

## Estructura

```txt
src/
|-- App.tsx                 # Layout, sidebar responsive y rutas
|-- index.css               # Tokens visuales, componentes Tailwind y base responsive
|-- firebase/
|   |-- firebase.ts         # Configuracion Firebase
|   `-- seedFirestore.ts    # Datos demo
|-- pages/
|   |-- Scanner.tsx         # Validacion QR y cupones activos
|   |-- BillDetail.tsx      # Cuenta activa y cierre
|   |-- AllBills.tsx        # Listado de cuentas
|   |-- RestaurantDashboard.tsx
|   |-- AdminDashboard.tsx
|   |-- Reports.tsx
|   `-- Products.tsx
|-- services/
|   |-- scannerService.ts
|   |-- billService.ts
|   |-- productService.ts
|   `-- adminService.ts
`-- types/
    `-- index.ts
```

---

## Comandos

### Instalar

```bash
npm install
```

### Desarrollo

```bash
copy .env.example .env
npm run dev
```

Servidor local:

```txt
http://localhost:5173
```

### Lint

```bash
npm run lint
```

### Type check

```bash
npx tsc -b
```

### Build

```bash
npm run build
```

---

## Firebase

La configuracion vive en:

```txt
src/firebase/firebase.ts
```

Los valores reales se leen desde `web_react/.env`, que no debe subirse a Git:

```txt
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

El proyecto usa Firestore directamente desde el cliente para:

- Leer usuarios por codigo QR.
- Leer cupones guardados y solicitados.
- Crear cuentas activas.
- Actualizar productos, totales y estados.
- Crear y resolver reportes.

---

## Notas de UI

El estilo actual busca una lectura clara para operacion real:

- Base blanca con morado como acento de marca.
- Componentes responsive para escritorio, tablet y movil.
- Acciones importantes siempre visibles, especialmente cerrar cuenta y controles CRUD.
- Scanner con camara integrado y fallback manual por codigo.
- Tarjetas de informacion compactas para que el staff pueda actuar rapido.

---

## Validacion recomendada

```bash
npx tsc -b
npm run lint
npm run build
```

El build puede mostrar una advertencia de bundle grande por el scanner QR y dependencias del dashboard. No bloquea la ejecucion.

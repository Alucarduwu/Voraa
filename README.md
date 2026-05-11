<h1 align="center">VORAA Smart Redemption</h1>

<p align="center">
  <b>Plataforma full stack para redimir beneficios en restaurantes sin friccion</b><br/>
  <i>React dashboard + Flutter app + Firebase Firestore en tiempo real</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Web-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Mobile-Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Database-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

---

## Resumen

**VORAA** es un ecosistema para restaurantes donde los clientes guardan cupones, eligen cuales quieren redimir y muestran un QR desde la app movil. El staff escanea ese pase desde el panel web, ve los cupones activos para esa cuenta y abre una cuenta en tiempo real con los beneficios aplicados.

La plataforma esta pensada para resolver tres momentos clave:

- El cliente necesita saber que beneficios tiene listos para usar.
- El restaurante necesita validar el QR y ver exactamente que cupones estan activos.
- La cuenta debe calcular descuentos, total final y propinas sugeridas con claridad para evitar friccion.

---

## Stack principal

| Capa | Tecnologia |
|---|---|
| Web staff/admin | React 19, TypeScript, Vite 8 |
| Mobile cliente | Flutter, Dart |
| Backend | Firebase |
| Base de datos | Cloud Firestore |
| Tiempo real | Firestore snapshots / streams |
| Estilos web | Tailwind CSS, CSS custom properties |
| Estilos movil | Material 3, Google Fonts|
| Iconos web | lucide-react |
| Iconos movil | lucide_icons |
| QR web | html5-qrcode |
| QR movil | qr_flutter |

---

## Funcionalidades

### App movil del cliente

- Muestra el QR unico del cliente para que el staff lo escanee.
- Permite guardar cupones y activar los que se van a redimir.
- En la tarjeta de estado del QR, muestra cuantos beneficios estan listos.
- Al tocar esa tarjeta, abre el detalle de cupones a redimir con imagen, restaurante, descuento y estado.
- Muestra historial de cuentas, ahorro acumulado, reportes y perfil del usuario.

### Panel web de restaurante

- Valida clientes por codigo o escaneo de QR con camara.
- Lista los cupones activos del cliente para el restaurante actual.
- Abre cuentas con los cupones aplicados.
- Permite agregar productos, ajustar cantidades y calcular totales.
- Muestra subtotal, descuentos, total final y propina sugerida.
- Permite cerrar o reportar cuentas desde un boton visible tambien en pantallas pequenas.

### Panel administrador

- Visualiza metricas generales de usuarios, restaurantes, cupones, cuentas y reportes.
- Administra usuarios, venues y beneficios.
- Muestra acciones CRUD visibles en el directorio de usuarios.
- Centraliza reportes de friccion para dar seguimiento.

---

## Flujo principal

```txt
Cliente guarda cupones en Flutter
          |
Cliente activa los cupones que quiere redimir
          |
App movil muestra QR + beneficios listos
          |
Staff escanea QR desde React
          |
Web muestra cupones activos para ese restaurante
          |
Staff abre cuenta con beneficios aplicados
          |
Firestore sincroniza cuenta, totales y reportes
```

---

## Estructura del proyecto

```txt
VORAA/
|-- README.md
|-- web_react/
|   |-- src/
|   |   |-- pages/          # Vistas de staff, admin, scanner y cuentas
|   |   |-- services/       # Logica Firebase y reglas de negocio
|   |   |-- firebase/       # Configuracion y seed demo
|   |   |-- types/          # Tipos compartidos del frontend web
|   |   |-- App.tsx         # Rutas y layout responsive
|   |   `-- index.css       # Sistema visual web
|   |-- package.json
|   `-- README.md
|
`-- mobile_flutter/
    |-- lib/
    |   |-- screens/        # Login, home, reportes y tabs de cliente
    |   |-- services/       # Streams y escrituras a Firestore
    |   |-- models/         # Modelos de datos Flutter
    |   |-- theme/          # Tema, colores y helpers responsive
    |   `-- main.dart       # Bootstrap de Flutter + Firebase
    |-- pubspec.yaml
    `-- README.md
```

---

## Colecciones Firestore

| Coleccion | Uso |
|---|---|
| `users` | Perfiles, codigo QR, rol, ahorro y metricas del usuario |
| `venues` | Restaurantes, ciudad, tipo y estado operativo |
| `coupons` | Beneficios disponibles por restaurante |
| `savedCoupons` | Cupones guardados, solicitados, aceptados o redimidos por cliente |
| `activeBills` | Cuentas abiertas, totales, productos y cupones aplicados |
| `reports` | Reportes de friccion del cliente o restaurante |

---

## Instalacion

### Requisitos

- Node.js y npm
- Flutter SDK
- Firebase project con Firestore habilitado
- Chrome o un emulador/dispositivo para probar Flutter

### Web

```bash
cd web_react
npm install
copy .env.example .env
npm run dev
```

La app web corre normalmente en:

```txt
http://localhost:5173
```

### Mobile

```bash
cd mobile_flutter
flutter pub get
flutter run -d chrome --dart-define=FIREBASE_API_KEY=your_api_key --dart-define=FIREBASE_APP_ID=your_app_id --dart-define=FIREBASE_MESSAGING_SENDER_ID=your_sender_id --dart-define=FIREBASE_PROJECT_ID=your_project_id
```

Para dispositivo fisico o emulador:

```bash
flutter run
```

---

## Validacion

## Secretos y variables

Las credenciales de Firebase no se guardan en Git.

Para web, crea `web_react/.env` a partir de `web_react/.env.example` y coloca ahi tus valores reales.

Para Flutter, pasa los valores con `--dart-define` al ejecutar o crea una configuracion de launch local en tu IDE.

Si alguna clave ya fue subida por accidente, rota o restringe esa clave desde Google Cloud Console antes de seguir usandola.

### Web

```bash
cd web_react
npx tsc -b
npm run lint
npm run build
```

### Mobile

```bash
cd mobile_flutter
dart analyze lib/screens/home_screen.dart
flutter analyze
```

---

## Estado actual

| Area | Estado |
|---|---|
| Scanner QR web | Implementado |
| Cupones activos al escanear | Implementado |
| Modal movil de cupones a redimir | Implementado |
| Cuentas activas y calculos | Implementado |
| Reportes de friccion | Implementado |
| UI responsive web | En mejora continua |
| UI responsive movil | En mejora continua |

---

## Autor

**Anahi Lozano**

- Portfolio: https://portafolioanahi.vercel.app/
- GitHub: https://github.com/Alucarduwu
- LinkedIn: https://www.linkedin.com/in/anahi-lozano-de-lira-a4213a187/
- Email: anahydlira@gmail.com

---

<p align="center">
  <b>VORAA</b> une restaurante, cliente y cuenta en una experiencia clara, sincronizada y lista para redimir.
</p>

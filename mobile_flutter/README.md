<h1 align="center">VORAA Mobile App</h1>

<p align="center">
  <b>App movil del cliente para guardar, activar y redimir cupones</b><br/>
  <i>Flutter + Dart + Firebase Firestore + QR Pass</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Flutter-SDK-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
  <img src="https://img.shields.io/badge/Dart-3.7-0175C2?style=for-the-badge&logo=dart&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Core-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Firestore-Streams-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/QR-qr__flutter-6C4DFF?style=for-the-badge" />
</p>

---

## Que hace

La app movil es la experiencia del cliente. Desde aqui el usuario ve su pase QR, guarda cupones, activa los beneficios que quiere redimir y revisa sus cuentas, ahorros y reportes.

El punto central del flujo es el tab **Mi QR**:

- Muestra el codigo QR unico del cliente.
- Indica cuantos beneficios estan listos para usar.
- Al tocar la tarjeta de estado, abre el detalle de cupones a redimir.
- El restaurante escanea ese QR desde la web y ve esos mismos cupones activos.

---

## Stack

| Area | Tecnologia |
|---|---|
| Framework | Flutter |
| Lenguaje | Dart |
| Backend | Firebase |
| Base de datos | Cloud Firestore |
| Streams | StreamBuilder + Firestore snapshots |
| QR | qr_flutter |
| Scanner dependency | mobile_scanner |
| Tipografia | google_fonts |
| Iconos | lucide_icons + Material Icons |
| Fechas / formato | intl |
| Tema | Material 3 + `lib/theme/app_theme.dart` |

---

## Pantallas y tabs

| Seccion | Funcion |
|---|---|
| Login | Acceso demo a la experiencia del cliente |
| Inicio | Cupones disponibles para guardar |
| Guardados | Cupones guardados y switch para activar redencion |
| Mi QR | Pase QR y cupones listos para redimir |
| Cuenta | Historial de cuentas, totales y feedback |
| Perfil | Ahorro, interacciones y reportes del cliente |
| Reporte | Crear reporte de friccion |

---

## Flujo de redencion

```txt
Cliente entra a Guardados
        |
Activa los cupones que quiere usar
        |
Firestore marca savedCoupons.status = requested
        |
Mi QR muestra "beneficios listos para usar"
        |
Cliente toca la tarjeta y ve el detalle de cupones
        |
Staff escanea el QR desde la web
        |
El panel web muestra esos cupones activos
```

---

## Estructura

```txt
lib/
|-- main.dart
|-- models/
|   `-- models.dart          # UserProfile, Coupon, ActiveBill, FrictionCase
|-- screens/
|   |-- login_screen.dart
|   |-- home_screen.dart     # Tabs principales y QR pass
|   `-- report_screen.dart
|-- services/
|   `-- firebase_service.dart
`-- theme/
    `-- app_theme.dart       # Colores, ThemeData y helpers responsive
```

---

## Modelo de datos clave

### `savedCoupons`

El documento conecta un usuario con un cupon:

```txt
saved      -> guardado, no se va a usar todavia
requested  -> seleccionado por el cliente para redimir
accepted   -> aceptado por el restaurante al abrir cuenta
redeemed   -> redimido despues de cerrar la cuenta
expired    -> vencido
```

La tarjeta del tab **Mi QR** cuenta los cupones `requested` y `accepted` como beneficios a redimir.

### `activeBills`

Guarda cuentas abiertas y cerradas:

- Productos consumidos.
- Cupones aplicados.
- Subtotal original.
- Descuento total.
- Total final.
- Propinas sugeridas.
- Feedback del cliente.

---

## Comandos

### Instalar dependencias

```bash
flutter pub get
```

### Correr en Chrome

```bash
flutter run -d chrome --dart-define=FIREBASE_API_KEY=your_api_key --dart-define=FIREBASE_APP_ID=your_app_id --dart-define=FIREBASE_MESSAGING_SENDER_ID=your_sender_id --dart-define=FIREBASE_PROJECT_ID=your_project_id
```

### Correr en dispositivo o emulador

```bash
flutter run
```

### Analizar codigo

```bash
flutter analyze
```

Para revisar solo la pantalla principal:

```bash
dart analyze lib/screens/home_screen.dart
```

---

## Firebase

La app inicializa Firebase en:

```txt
lib/main.dart
```

Los streams y escrituras estan centralizados en:

```txt
lib/services/firebase_service.dart
```

El servicio maneja:

- Perfil del usuario.
- Cupones disponibles.
- Cupones guardados.
- Solicitud de redencion.
- Cuentas activas e historial.
- Confirmacion de cuentas.
- Creacion de reportes.

### Variables de Firebase

La app no guarda credenciales en el codigo fuente. Pasa la configuracion con `--dart-define`:

```bash
flutter run -d chrome ^
  --dart-define=FIREBASE_API_KEY=your_api_key ^
  --dart-define=FIREBASE_APP_ID=your_app_id ^
  --dart-define=FIREBASE_MESSAGING_SENDER_ID=your_sender_id ^
  --dart-define=FIREBASE_PROJECT_ID=your_project_id ^
  --dart-define=FIREBASE_AUTH_DOMAIN=your_auth_domain ^
  --dart-define=FIREBASE_STORAGE_BUCKET=your_storage_bucket ^
  --dart-define=FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Si usas VS Code o Android Studio, puedes guardar esos `dart-define` en una configuracion local que no se suba al repositorio.

---

## UI y responsive

El tema vive en:

```txt
lib/theme/app_theme.dart
```

Incluye:

- Paleta blanco + morado con acentos de estado.
- `AppTheme.lightTheme()` para Material 3.
- Helpers responsive para limitar ancho en pantallas grandes.
- Tarjetas limpias, estados claros y estructura pensada para movil.

La pantalla `home_screen.dart` usa esos helpers para que la experiencia funcione en telefono, tablet y web demo.

---

## Validacion recomendada

```bash
flutter pub get
flutter analyze
flutter run -d chrome
```

Si solo estas ajustando el flujo del QR:

```bash
dart analyze lib/screens/home_screen.dart
```

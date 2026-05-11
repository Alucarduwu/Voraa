<h1 align="center">✨ VORAA Smart Redemption Pass</h1>

<p align="center">
  <b>Realtime loyalty & redemption ecosystem for restaurants</b><br/>
  <i>Flutter + React + Firebase Firestore</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Web-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Mobile-Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Database-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Realtime-Live_Synchronization-7C3AED?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Architecture-Event_Driven-8B5CF6?style=for-the-badge" />
</p>

---

# 🧩 Description | Descripción

## 🇺🇸 EN

**VORAA Smart Redemption Pass** is a FullStack real-time platform designed to reduce friction during restaurant coupon redemption and payment experiences.

The ecosystem connects:
- a **Flutter mobile app** for customers,
- a **React dashboard** for restaurants and administrators,
- and **Firebase Firestore** as a synchronized real-time backend.

The platform introduces a shared-bill experience where:
- customers activate benefits,
- restaurants validate discounts,
- totals and savings are synchronized live,
- and both sides can confirm or report the interaction.

---

## 🇲🇽 ES

**VORAA Smart Redemption Pass** es una plataforma FullStack en tiempo real diseñada para reducir fricción durante la redención de beneficios y el cierre de cuentas en restaurantes.

El ecosistema conecta:
- una **app móvil Flutter** para clientes,
- un **dashboard React** para restaurantes y administración,
- y **Firebase Firestore** como backend sincronizado en tiempo real.

La plataforma introduce una experiencia de cuenta compartida donde:
- el cliente activa beneficios,
- el restaurante valida descuentos,
- los totales y ahorros se sincronizan en vivo,
- y ambas partes pueden confirmar o reportar la interacción.

---

# 🎯 Problem | Problema

<p align="center">
  <img src="https://img.shields.io/badge/Pain_Point-Redemption_Friction-EF4444?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/UX-Issue-Tip_Conflicts-F59E0B?style=for-the-badge"/>
</p>

## 🇺🇸 EN

One of the main issues detected was the decrease in coupon redemption usage caused by friction between restaurant staff and customers.

A recurring issue appeared during payment:
- some users calculated tips using the discounted total,
- while restaurants expected tips based on the original subtotal.

This generated:
- uncomfortable interactions,
- distrust,
- lower retention,
- and lower discount usage recurrence.

---

## 🇲🇽 ES

Uno de los principales problemas detectados fue la disminución en el uso de descuentos debido a fricción entre clientes y staff del restaurante.

El conflicto aparecía principalmente al pagar:
- algunos usuarios calculaban la propina usando el total con descuento,
- mientras que el restaurante esperaba propina sobre el subtotal original.

Esto generaba:
- experiencias incómodas,
- desconfianza,
- menor retención,
- y menor recurrencia de uso.

---

# 💡 Solution | Solución

<p align="center">
  <img src="https://img.shields.io/badge/Solution-Shared_Bill_Experience-22C55E?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Realtime-Synchronized_Flow-3B82F6?style=for-the-badge"/>
</p>

## 🇺🇸 EN

The solution was designed as a synchronized redemption workflow between:
- customer,
- restaurant,
- and administration.

The system allows:
- customers to save and activate coupons,
- restaurants to validate and apply benefits,
- and both sides to share a synchronized bill in real time.

The platform transparently displays:
- applied discounts,
- subtotal,
- final total,
- savings,
- suggested tips,
- and redemption status.

---

## 🇲🇽 ES

La solución fue diseñada como un flujo sincronizado de redención entre:
- cliente,
- restaurante,
- y administración.

El sistema permite:
- que el cliente guarde y active beneficios,
- que el restaurante valide y aplique descuentos,
- y que ambas partes compartan una cuenta sincronizada en tiempo real.

La plataforma muestra de forma transparente:
- descuentos aplicados,
- subtotal,
- total final,
- ahorro generado,
- propinas sugeridas,
- y estado de la redención.

---

# 🧠 Architecture | Arquitectura

```txt
 ┌────────────────────┐
 │ Flutter Mobile App │
 └─────────┬──────────┘
           │
           ▼
 ┌────────────────────┐
 │ Firebase Firestore│
 │  Real-time Sync   │
 └─────────┬──────────┘
           │
 ┌─────────▼──────────┐
 │ React Dashboard    │
 │ Restaurant / Admin │
 └────────────────────┘
```

---

# 🔁 Real-Time Flow | Flujo en tiempo real

```txt
Cliente guarda beneficios
          ↓
Cliente selecciona cupones
          ↓
Flutter genera QR unico
          ↓
React valida QR del cliente
          ↓
Restaurante abre cuenta
          ↓
Firestore sincroniza datos live
          ↓
Cliente visualiza productos y descuentos
          ↓
Cliente confirma o reporta experiencia
          ↓
Admin monitorea friccion y metricas
```

---

# ⚙️ Technical Highlights | Aspectos técnicos

<p align="center">
  <img src="https://img.shields.io/badge/Realtime-onSnapshot()-0EA5E9?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Database-NoSQL_Modeling-9333EA?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Frontend-Reactive_UI-EC4899?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Mobile-Cross_Platform-2563EB?style=for-the-badge"/>
</p>

### 🔹 Real-time synchronization
Firestore streams and snapshots synchronize:
- active bills,
- coupon status,
- reports,
- totals,
- and customer feedback.

### 🔹 Shared bill system
Both customer and restaurant interact with the same bill document in Firestore.

### 🔹 Consistent NoSQL modeling
Even using Firestore, entities were modeled with relational consistency:
- references,
- linked IDs,
- reusable services,
- normalized business flows.

### 🔹 Role-based architecture
The platform separates:
- customer flows,
- restaurant operations,
- administrative monitoring.

---

# 🚀 Core Functionalities | Funcionalidades principales

## 📱 Flutter Mobile App

- QR-based customer identification
- Coupon discovery and saving
- Coupon activation before redemption
- Real-time shared bill visualization
- Savings tracking
- Suggested tip calculations
- Positive/negative interaction feedback
- Friction reporting system
- Redemption history
- Loyalty metrics dashboard

---

## 💻 React Restaurant Dashboard

- Customer QR validation
- Active coupon validation
- Shared bill generation
- Product and item management
- Automatic discount application
- Suggested tip calculation
- Real-time bill synchronization
- Bill closing workflow
- Operational reporting system
- Active/open/closed bill management

---

## 🛠️ Admin Dashboard

- Users CRUD
- Restaurants CRUD
- Coupons CRUD
- Reports monitoring
- Friction analytics
- Redemption metrics
- Operational overview dashboard
- Report resolution workflows

---

# 🗂️ Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | Profiles, QR codes, loyalty metrics |
| `venues` | Restaurants and operational data |
| `products` | Products linked to restaurants |
| `coupons` | Available restaurant benefits |
| `savedCoupons` | Customer saved/requested coupons |
| `bills` | Shared realtime restaurant bills |
| `reports` | Customer/staff operational reports |

---

# 🧪 Business Rules | Reglas de negocio

- Customers save and activate coupons before payment.
- Restaurants only apply coupons selected by the customer.
- Suggested tips are ALWAYS calculated using the original subtotal.
- Both customer and restaurant can report incidents.
- Positive interactions increase loyalty metrics.
- Reports are centralized for administrative follow-up.

---

# 🔐 Security | Seguridad

### ✅ Firebase-ready authentication
The architecture was designed to support Firebase Authentication.

Passwords are NOT stored manually in Firestore.

### ✅ Firestore as source of truth
Critical operations are persisted in Firestore:
- coupons,
- active bills,
- reports,
- savings,
- and feedback.

### ⚠️ Demo rules
Current Firestore rules are configured for demo/development environments only.

---

# 📂 Project Structure

```txt
VORAA/
|-- README.md
|-- web_react/
|   |-- src/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- firebase/
|   |   |-- components/
|   |   |-- types/
|   |   `-- App.tsx
|
`-- mobile_flutter/
    |-- lib/
    |   |-- screens/
    |   |-- services/
    |   |-- models/
    |   |-- theme/
    |   `-- main.dart
```

---

# ⚡ Installation

## Web

```bash
cd web_react
npm install
npm run dev
```

---

## Flutter

```bash
cd mobile_flutter
flutter pub get
flutter run
```

---

# 🧠 What I Learned | Qué aprendí

## 🇺🇸 EN

During this challenge I reinforced:
- Firestore real-time synchronization,
- FullStack coordination between Flutter and React,
- role-based CRUD systems,
- NoSQL modeling with relational consistency,
- shared bill workflows,
- and UX focused on operational friction reduction.

---

## 🇲🇽 ES

Durante este reto reforcé:
- sincronización en tiempo real con Firestore,
- coordinación FullStack entre Flutter y React,
- sistemas CRUD por roles,
- modelado NoSQL con consistencia relacional,
- flujos de cuentas compartidas,
- y UX enfocada en reducir fricción operativa.

---

# 🔮 Future Improvements | Mejoras futuras

- 🔔 Push notifications
- 💳 Real payment integrations
- 📈 Advanced analytics
- 🧠 AI-driven recommendations
- 📍 Geolocation-based promotions
- 🏆 Loyalty gamification
- 🔐 Role-based Firestore rules
- 📊 Churn prediction

---

# ⚙️ SYSTEM DATA (DO NOT EDIT FORMAT)

<!--
Portfolio parsing metadata
Project classification: FullStack SaaS / Realtime System / Product Engineering
-->

## 🧠 PROJECT_OVERVIEW

```yaml
name:
  en: VORAA Smart Redemption Pass
  es: VORAA Smart Redemption Pass

tagline:
  en: Realtime loyalty and redemption ecosystem for restaurants
  es: Ecosistema de fidelización y redención en tiempo real para restaurantes

status:
  en: MVP Completed
  es: MVP Completado

type:
  - FullStack Platform
  - SaaS MVP
  - Realtime System
  - Product Engineering
  - Loyalty Ecosystem

priority_focus:
  - UX Optimization
  - Operational Friction Reduction
  - Real-time Synchronization
  - Shared Bill Experience
  - Coupon Redemption Flow
```

---

## 🎯 PRODUCT_CONTEXT

```yaml
problem:
  en: >
    Restaurants and customers experienced friction during coupon redemption,
    especially during payment and tip calculation.

  es: >
    Restaurantes y clientes experimentaban fricción durante la redención
    de beneficios y el cálculo de propinas.

solution:
  en: >
    A synchronized shared-bill ecosystem connecting Flutter, React and
    Firestore in real time.

  es: >
    Un ecosistema sincronizado de cuenta compartida conectando Flutter,
    React y Firestore en tiempo real.

business_goal:
  en: >
    Reduce operational friction and increase redemption recurrence.

  es: >
    Reducir fricción operativa y aumentar recurrencia de uso.
```

---

## 🏗️ TECH_STACK

```yaml
frontend_web:
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS

frontend_mobile:
  - Flutter
  - Dart
  - Material 3

backend:
  - Firebase
  - Cloud Firestore

architecture:
  - Realtime Synchronization
  - Event Driven Flows
  - Shared State Architecture
  - Role-Based CRUD

database:
  - Firestore NoSQL Modeling
  - Relational Consistency Patterns
```

---

## 🚀 PORTFOLIO_TAGS

```yaml
tags:
  - FullStack
  - React
  - Flutter
  - Firebase
  - Firestore
  - SaaS
  - Realtime
  - Product Design
  - UX
  - Dashboard
  - CRUD
  - Mobile Development
  - Web Development
```

---

# 👩‍💻 Author | Autor

**Anahi Lozano**

- 🌐 Portfolio: https://portafolioanahi.vercel.app/
- 💻 GitHub: https://github.com/Alucarduwu
- 🔗 LinkedIn: https://www.linkedin.com/in/anahi-lozano-de-lira-a4213a187/
- 📩 Email: anahydlira@gmail.com

---

<p align="center">
  <b>✨ VORAA Smart Redemption Pass</b><br/>
  Synchronizing restaurants, customers and loyalty experiences in real time.
</p>

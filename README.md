# Finance Tracker

> Aplicación web de control financiero personal — construida con **Angular 20**, **Tailwind CSS** y un backend **ASP.NET Core**.

---

## ✨ Características

| Módulo | Descripción |
|---|---|
| **Dashboard** | KPIs del mes (presupuesto, ingresos, gastos, balance), gráfico de barras diarias, gastos por categoría y transacciones recientes |
| **Transacciones** | Historial completo con filtros por tipo, categoría, mes y búsqueda. Vista tabla en desktop, tarjetas en móvil |
| **Categorías** | CRUD de categorías de ingresos y gastos con ícono y color personalizados |
| **Presupuesto** | Presupuesto mensual global y límites individuales por categoría con barras de progreso |
| **Ajustes** | Exportar/importar datos en JSON |
| **Autenticación** | Login con JWT — cada usuario ve únicamente sus propios datos |
| **Responsive** | Diseño adaptado para móvil, tablet y escritorio con sidebar deslizable en móvil |

---

## 🖥️ Stack tecnológico

**Frontend**
- [Angular 20](https://angular.dev) — standalone components, Signals, zoneless
- [Tailwind CSS](https://tailwindcss.com) — utilidades CSS
- [Angular Material](https://material.angular.io) — componentes UI
- [@tabler/icons](https://tabler.io/icons) — sistema de íconos SVG

**Backend** *(repositorio separado)*
- ASP.NET Core — REST API con autenticación JWT
- Patrón de respuesta genérico `ApiResponse<T>`

**Infraestructura**
- Docker + Docker Compose — despliegue en contenedores
- Nginx — servidor de archivos estáticos + proxy inverso a la API

---

## 🚀 Inicio rápido (desarrollo local)

### Requisitos
- Node.js 20+
- Angular CLI `npm i -g @angular/cli`
- Backend corriendo en `http://localhost:5197`

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/finance-tracker.git
cd finance-tracker

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```

Abre `http://localhost:4200` en el navegador.

---

## 🐳 Despliegue con Docker

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_PASSWORD=TuPasswordSegura123!
```

### Levantar los servicios

```bash
docker compose up -d --build
```

La aplicación estará disponible en `http://tu-servidor:1995`.

### Arquitectura de red

```
Navegador → :1995 → Nginx
                      ├── /          → Angular SPA (index.html)
                      ├── /api/*     → proxy → backend:8080
                      └── *.js/css   → archivos estáticos (caché 1 año)
```

Nginx actúa como proxy inverso hacia el backend, por lo que **no hay configuración de URL en el frontend para producción** ni problemas de CORS.

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar/          # Barra lateral con navegación
│   │   │   └── topbar/           # Barra superior móvil
│   │   └── shared/
│   │       ├── icon/             # Sistema de íconos Tabler SVG
│   │       ├── kpi-card/         # Tarjeta de indicador clave
│   │       ├── category-bar/     # Barra de progreso por categoría
│   │       ├── circular-progress/# Indicador circular de presupuesto
│   │       ├── transaction-modal/# Modal de nueva/editar transacción
│   │       ├── category-modal/   # Modal de nueva/editar categoría
│   │       ├── date-picker/      # Selector de fecha personalizado
│   │       └── toast/            # Notificaciones
│   ├── core/
│   │   ├── guards/               # AuthGuard
│   │   ├── interceptors/         # JWT interceptor
│   │   └── services/             # LayoutService
│   ├── models/                   # Interfaces TypeScript
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budget/
│   │   ├── settings/
│   │   └── login/
│   └── services/
│       ├── auth.service.ts       # Estado de autenticación (Signals)
│       ├── finance.ts            # Datos financieros y llamadas a API
│       └── toast.service.ts
├── environments/
│   ├── environment.ts            # Desarrollo
│   └── environment.prod.ts      # Producción
└── styles.scss                   # Estilos globales y tokens de diseño
```

---

## 📡 API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/register` | Registrar usuario |
| `GET` | `/api/auth/me` | Usuario actual |
| `GET` | `/api/transactions` | Listar transacciones |
| `POST` | `/api/transactions` | Crear transacción |
| `PUT` | `/api/transactions/:id` | Actualizar transacción |
| `DELETE` | `/api/transactions/:id` | Eliminar transacción |
| `GET` | `/api/categories` | Listar categorías |
| `POST` | `/api/categories` | Crear categoría |
| `PUT` | `/api/categories/:id` | Actualizar categoría |
| `DELETE` | `/api/categories/:id` | Eliminar categoría |
| `GET` | `/api/budget` | Obtener presupuesto |
| `POST` | `/api/budget` | Guardar presupuesto |
| `GET` | `/api/budget/limits` | Obtener límites por categoría |
| `POST` | `/api/budget/limits` | Guardar límite de categoría |

Todas las respuestas siguen el formato:

```json
{
  "status": 200,
  "errors": null,
  "data": { }
}
```

---

## 👨‍💻 Autor

**Julio Poveda** — Senior .NET Developer · Medellín, Colombia
[juliopoveda.com](https://juliopoveda.com)

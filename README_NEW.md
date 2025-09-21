# WMS Admin Dashboard

Aplikasi dashboard admin untuk Warehouse Management System (WMS) yang dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS.

## 🚀 Fitur

- **Authentication System**: Login dengan integrasi API endpoint
- **Responsive Design**: Optimized untuk desktop dan mobile
- **Modern UI/UX**: Interface yang clean dan modern
- **Dashboard Analytics**: Overview metrics dan statistik
- **Navigation System**: Sidebar navigation dengan multiple menu items
- **API Integration**: Koneksi ke backend API dengan logging response

## 🛠️ Teknologi

- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Authentication**: Custom authentication dengan localStorage

## 📦 Instalasi

1. Clone atau download project ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
4. Buka [http://localhost:3000](http://localhost:3000) di browser

## 🔐 Login

Aplikasi menggunakan API endpoint: `https://apigo.fahrurrozi.web.id/api/v1/auth/login`

- Coba login dengan email dan password apapun untuk testing API integration
- Response dari API akan ter-log di browser console
- Setelah login berhasil, akan redirect ke dashboard

## 📱 Responsive Design

Dashboard telah dioptimalkan untuk berbagai ukuran layar:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Overlay sidebar dengan gesture

## 🎨 Komponen

### Layout Components
- `DashboardLayout`: Main layout wrapper
- `Sidebar`: Navigation sidebar
- `Header`: Top navigation bar
- `ProtectedRoute`: Route protection wrapper

### Pages
- `/login`: Halaman login
- `/dashboard`: Dashboard utama dengan analytics
- `/`: Redirect ke login atau dashboard

### Authentication
- `AuthProvider`: Context provider untuk authentication state
- `useAuth`: Custom hook untuk mengakses auth state
- Auto-redirect berdasarkan authentication status

## 🔧 API Integration

```typescript
// Login endpoint
POST https://apigo.fahrurrozi.web.id/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response dan error handling ter-log di console untuk debugging.

## 🚦 Status

✅ **Completed**:
- Login page dengan API integration
- Dashboard layout responsive
- Authentication flow
- Navigation system
- UI/UX modern design

🔄 **Ready to Extend**:
- Inventory management pages
- Order management
- Reports & analytics
- User management
- Settings panel

## 📄 Scripts

- `npm run dev`: Development server
- `npm run build`: Production build
- `npm start`: Production server
- `npm run lint`: Code linting

## 🌟 Preview

1. **Login Page**: Form login yang modern dengan validasi
2. **Dashboard**: Overview dengan statistics cards, recent orders, dan low stock alerts
3. **Navigation**: Sidebar menu dengan multiple sections
4. **Responsive**: Seamless experience di semua device

---

**Dibuat dengan ❤️ menggunakan Next.js dan Tailwind CSS**
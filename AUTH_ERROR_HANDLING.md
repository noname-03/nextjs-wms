# Authentication Error Handling

## Overview

Sistem sekarang memiliki penanganan otomatis untuk error 401 (Unauthorized) dari API.

## Fitur Baru

### 1. `fetchWithAuth` Helper (lib/fetchWithAuth.ts)

Helper function yang otomatis menangani:

- ✅ Menambahkan Authorization header dengan Bearer token
- ✅ Mendeteksi error 401 dari API
- ✅ Menghapus token yang invalid
- ✅ Redirect otomatis ke halaman login

### 2. Response Error yang Ditangani

Ketika API mengembalikan response seperti ini:

```json
{
  "code": 401,
  "message": "Invalid token",
  "error": "invalid token"
}
```

Sistem akan otomatis:

1. Log error ke console
2. Hapus token dari localStorage dan cookie
3. Redirect user ke `/login`

## Penggunaan

### Menggunakan fetchWithAuth

```typescript
import { fetchWithAuth } from "./fetchWithAuth";

// GET request
const response = await fetchWithAuth("/brands", {
  method: "GET",
});

// POST request
const response = await fetchWithAuth("/brands", {
  method: "POST",
  body: JSON.stringify(data),
});

// PUT request
const response = await fetchWithAuth(`/brands/${id}`, {
  method: "PUT",
  body: JSON.stringify(data),
});

// DELETE request
const response = await fetchWithAuth(`/brands/${id}`, {
  method: "DELETE",
});
```

### Convenience Methods

```typescript
import { fetchGet, fetchPost, fetchPut, fetchDelete } from "./fetchWithAuth";

// GET
const response = await fetchGet("/brands");

// POST
const response = await fetchPost("/brands", brandData);

// PUT
const response = await fetchPut(`/brands/${id}`, brandData);

// DELETE
const response = await fetchDelete(`/brands/${id}`);
```

### Skip Auth Check (Optional)

Jika Anda tidak ingin auto-redirect pada 401:

```typescript
const response = await fetchWithAuth("/some-endpoint", {
  skipAuthCheck: true,
});
```

## File yang Sudah Diupdate

- ✅ `lib/fetchWithAuth.ts` - Helper function baru
- ✅ `lib/brands.ts` - Menggunakan fetchWithAuth
- ⏳ `lib/categories.ts` - Perlu diupdate
- ⏳ `lib/products.ts` - Perlu diupdate
- ⏳ `lib/purchaseOrders.ts` - Perlu diupdate
- ⏳ File lib lainnya...

## Todo

Untuk file lib lainnya yang belum diupdate, ganti:

**Sebelum:**

```typescript
import { getAuthToken } from "./auth";
import { API_BASE_URL } from "./config";

function getAuthHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const response = await fetch(`${API_BASE_URL}/endpoint`, {
  method: "GET",
  headers: getAuthHeaders(),
});
```

**Sesudah:**

```typescript
import { fetchWithAuth } from "./fetchWithAuth";

const response = await fetchWithAuth("/endpoint", {
  method: "GET",
});
```

## Testing

### Test Case 1: Token Valid

1. Login dengan credentials yang valid
2. Akses halaman dashboard/brands/dll
3. ✅ Harus berfungsi normal

### Test Case 2: Token Expired/Invalid

1. Login dengan credentials yang valid
2. Manual ubah/rusak token di localStorage atau server-side expire token
3. Refresh halaman atau lakukan aksi yang trigger API
4. ✅ Harus otomatis redirect ke `/login`

### Test Case 3: Token Dihapus Manual

1. Login dengan credentials yang valid
2. Buka DevTools → Application → localStorage
3. Hapus `auth_token`
4. Refresh halaman
5. ✅ Harus otomatis redirect ke `/login`

## Keuntungan

1. **DRY Principle** - Tidak perlu duplicate auth checking di setiap API call
2. **Consistent Behavior** - Semua API endpoint handle 401 dengan cara yang sama
3. **Better UX** - User otomatis di-redirect tanpa stuck atau error UI
4. **Easier Maintenance** - Auth logic terpusat di satu tempat
5. **Security** - Token invalid langsung dihapus dan user di-logout

## Console Logs

Ketika terjadi 401 error, Anda akan melihat:

```
🌐 Fetch: https://api.g-synergy.com/api/v1/brands
❌ 401 Unauthorized - Invalid or expired token
🔒 Auth error: {code: 401, message: "Invalid token", error: "invalid token"}
🚪 Removing invalid token and redirecting to login...
🗑️ Removing auth token
✅ Token removed successfully
```

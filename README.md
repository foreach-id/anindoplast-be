# 📦 Order Management System API

Backend REST API untuk sistem manajemen pesanan (Order Management System) yang dirancang untuk mengelola produk, pelanggan, ekspedisi, dan transaksi pesanan. Dibangun menggunakan **Express, TypeScript, Prisma, dan MySQL**.

---

## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** MySQL
* **ORM:** Prisma
* **Auth:** JWT (Access & Refresh Token) - *Stateless*
* **Validation:** Zod
* **Logging:** Custom Logger (Winston/Morgan based)

---

## 🚀 Fitur Utama

* **Authentication:** Login, Register, Refresh Token, Logout.
* **User Management:** CRUD User, Role management (Super Admin & Admin), Soft Delete.
* **Product Management:** Pengelolaan data produk dan stok (Coming Soon).
* **Order Processing:** Pencatatan pesanan, status pesanan, dan kalkulasi biaya (Coming Soon).
* **Customer & Address:** Manajemen data pelanggan dan alamat pengiriman (Coming Soon).

---

## ⚙️ Cara Menjalankan Project

### 1. Prerequisites (Persyaratan)

* [Node.js](https://nodejs.org/) (v18+)
* [MySQL](https://www.mysql.com/)
* [Git](https://git-scm.com/)

### 2. Instalasi

Clone repository dan install dependencies:

```bash
git clone https://github.com/username/order-mgmt-be.git
cd order-mgmt-be
npm install
```

### 3. Konfigurasi Environment

Duplikasi file `.env.example` menjadi `.env`, lalu sesuaikan isinya dengan konfigurasi database lokal Anda.

```bash
cp .env.example .env
```

Pastikan konfigurasi di dalam file `.env` sudah benar, terutama bagian:

* `DATABASE_URL`: Koneksi ke MySQL.
* `JWT_SECRET`: Secret key untuk keamanan token.

### 4. Setup Database

Jalankan perintah berikut untuk membuat tabel dan mengisi data awal (seeding):

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Migrasi Database (Membuat Tabel)
npx prisma migrate dev --name init

# 3. Seeding Data (Membuat User Admin Default)
npx prisma db seed
```

### 5. Menjalankan Server

```bash
# Mode Development (Hot-reload)
npm run dev

# Build & Start Production
npm run build
npm start
```

Server akan berjalan di: **http://localhost:3000**

---

## 🔐 Default Credentials (Seed)

Gunakan akun berikut untuk login pertama kali setelah menjalankan seeding:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@admin.com | password123 |
| Admin Gudang | admin.gudang@store.com | password123 |

---

## 🗄️ Database Commands (Prisma)

Project ini menggunakan Prisma ORM. Berikut adalah perintah penting yang sering digunakan:

**Generate Client:**
```bash
npx prisma generate
```
*(Wajib dijalankan setiap kali ada perubahan di `schema.prisma`)*

**Migrasi Database:**
```bash
npx prisma migrate dev --name nama_perubahan
```
*(Gunakan saat mengubah struktur database/tabel)*

**Reset Database:**
```bash
npx prisma migrate reset
```
*(Menghapus semua data dan tabel, lalu menjalankan migrasi & seed ulang)*

**Prisma Studio:**
```bash
npx prisma studio
```
*(Membuka dashboard GUI di browser untuk melihat data)*

---

## 📚 Dokumentasi API

File `api.http` tersedia di root folder untuk testing menggunakan VS Code REST Client.

### Endpoint Utama

#### 1. Authentication (`/api/auth`)

* `POST /login` - Masuk aplikasi (Dapatkan Token)
* `POST /refresh-token` - Perbarui Access Token
* `POST /logout` - Keluar aplikasi

#### 2. User Management (`/api/users`) - Butuh Token

* `GET /profile` - Lihat profil sendiri
* `PATCH /profile` - Update profil sendiri
* `GET /` - List semua user (Super Admin only)
* `POST /` - Buat user admin baru (Super Admin only)
* `DELETE /:id` - Nonaktifkan user (Soft Delete)
* `PATCH /:id/restore` - Aktifkan kembali user

---

## 📂 Struktur Folder

```
src/
├── config/         # Konfigurasi DB & Environment
├── constants/      # Status Code & Pesan Response
├── middleware/     # Auth, Validation, Error Handling
├── modules/        # Fitur Utama (Controller, Service, Route, Schema)
│   ├── auth/       # Login/Logout Logic
│   └── user/       # Manajemen User
├── utils/          # Helper (Token, Logger)
├── app.ts          # Setup Express App
└── server.ts       # Entry Point
```

---

## 📝 Lisensi

MIT License

---

## 👨‍💻 Kontributor

Dibuat dengan ❤️ oleh Tim Development
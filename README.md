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
git clone [https://github.com/username/order-mgmt-be.git](https://github.com/username/order-mgmt-be.git)
cd order-mgmt-be
npm install

### **Project Folder Structure Overview**

The project follows a **feature-based** folder structure, where each feature is encapsulated within its own folder. Each feature folder contains everything related to that feature, including the controller, routes, schema, and models (if applicable). This structure promotes modularity and separation of concerns, making it easy to add new features or modify existing ones without affecting other parts of the application.

---

#### **1. `src/` Folder (Main Application Logic)**

The `src` folder contains all the application logic and configurations. it is found on the root of the project. it contains the following folders

- **`features/` Folder**  
  This folder contains individual feature folders. Each feature represents a specific business domain in your application, such as "categories," "products," or "suppliers." Within each feature folder, the following subfolders and files are defined:

  - **`controller/`**  
    Contains the business logic for that feature. Controllers handle the operations and data manipulations for that feature. Controllers interact with the models and return appropriate responses.

    Example:
    - `categoryController.ts` – Logic for managing categories (e.g., adding, updating, deleting categories).
    - `productController.ts` – Logic for handling product-related operations.

  - **`routes/`**  
    Contains route definitions for that feature. Routes define the HTTP request paths (e.g., GET, POST, PUT, DELETE) and link them to the controller methods. 

    Example:
    - `categoryRoutes.ts` – Defines routes for category operations (e.g., `/categories`, `/categories/:id`).
    - `productRoutes.ts` – Routes for managing products (e.g., `/products`, `/products/:id`).

  - **`schema/`**  
    Contains Joi validation schemas for the data used in that feature. These schemas are used to validate incoming request data (such as body parameters, query parameters, etc.) before any logic is executed.

    Example:
    - `categorySchema.ts` – Joi validation schema for validating category data (e.g., name, description).
    - `productSchema.ts` – Joi schema for validating product data (e.g., price, name, stock quantity).

  - **`models/`**  
    Contains the database models (if applicable). These models represent the structure of the data in the database, often using an ORM like Prisma.

    Example:
    - `categoryModel.ts` – Prisma model or database interaction for the category.
    - `productModel.ts` – Database model for managing product data.

---

#### **2. Other Configuration Files in `src/`**

- **`setup-database.ts`**  
  Responsible for checking and establishing the database connection when the app starts. It ensures that the database is available before initializing the app.

- **`setup-server.ts`**  
  Contains all configurations related to setting up the server, such as middlewares, routes, and server initialization. It imports route handlers from each feature folder and connects them to the server.

- **`app.ts`**  
  The main entry point of the application. It imports the necessary setup files (`setup-database`, `setup-server`, etc.), handles errors during startup, and runs the application.

---

#### **3. `prisma/` Folder (Outside `src`)**

This folder contains Prisma-related files and is responsible for managing the database schema and migrations.

- **`schema.prisma`**  
  Defines the database schema using Prisma ORM. This schema is used to generate database tables and Prisma models.
  
- **`migrations/` Folder**  
  Contains database migration files that define schema changes over time (e.g., adding new tables or columns).

---

### **Visual Folder Structure Example**

Here’s a visual representation of the folder structure based on the updated organization:

```
project-root/
├── src/
│   ├── features/
│   │   ├── categories/
│   │   │   ├── controller/
│   │   │   │   └── categoryController.ts
│   │   │   ├── routes/
│   │   │   │   └── categoryRoutes.ts
│   │   │   ├── schema/
│   │   │   │   └── categorySchema.ts
│   │   │   ├── models/
│   │   │   │   └── categoryModel.ts
│   │   ├── products/
│   │   │   ├── controller/
│   │   │   │   └── productController.ts
│   │   │   ├── routes/
│   │   │   │   └── productRoutes.ts
│   │   │   ├── schema/
│   │   │   │   └── productSchema.ts
│   │   │   ├── models/
│   │   │   │   └── productModel.ts
│   │   ├── suppliers/
│   │   │   ├── controller/
│   │   │   │   └── supplierController.ts
│   │   │   ├── routes/
│   │   │   │   └── supplierRoutes.ts
│   │   │   ├── schema/
│   │   │   │   └── supplierSchema.ts
│   │   │   ├── models/
│   │   │   │   └── supplierModel.ts
│   ├── setup-database.ts
│   ├── setup-server.ts
│   ├── app.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
└── tsconfig.json
```

---

### **How the Project Works**



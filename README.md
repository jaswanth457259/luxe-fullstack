# LUXE Full-Stack E-Commerce Platform

LUXE is a monorepo for a full-stack e-commerce application built with Spring Boot, React, and MySQL. The codebase supports customer shopping flows, JWT-based authentication, order management, and admin catalog operations including CSV-based product import.

## Tech Stack

- Frontend: React 18, Vite, React Router, Axios, React Hot Toast, React Icons
- Backend: Spring Boot 3.2, Spring Web, Spring Data JPA, Spring Security, JWT, Validation, Lombok, Apache Commons CSV
- Database: MySQL 8
- DevOps: Docker Compose, GitHub Actions, Railway, Vercel

## Repository Structure

```text
luxe-fullstack/
|-- .github/
|   `-- workflows/
|       |-- ci.yml
|       |-- deploy-production.yml
|       |-- deploy-staging.yml
|       `-- pr-checks.yml
|-- backend/
|   |-- src/main/java/com/luxe/ecommerce/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- model/
|   |   |-- repository/
|   |   |-- security/
|   |   `-- service/
|   |-- src/main/resources/application.properties
|   |-- pom.xml
|   `-- Dockerfile
|-- frontend/
|   |-- public/product-import-template.csv
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- styles/
|   |   `-- utils/
|   |-- package.json
|   |-- vite.config.js
|   `-- vercel.json
|-- docker/
|   `-- docker-compose.yml
|-- docs/
|   |-- CONTRIBUTING.md
|   `-- DEPLOYMENT.md
|-- scripts/
|   `-- setup.sh
|-- product-import-template.csv
`-- README.md
```

## Architecture, UML, and Workflow Diagrams

The structural UML diagrams below use PlantUML and are embedded as rendered SVGs in the README. The sequence and workflow diagrams remain in Mermaid for direct GitHub rendering.

### 1. Structural Component Diagram

![PlantUML structural component diagram](https://www.plantuml.com/plantuml/svg/NL91JiCm4Bpx5QkSGAZY1wXjf4eWa4eZk007axZfgeuTsHlQ2l5trdRI6YxDpCwkFJlkt9DqD7HQQBKb80iEsnr1WqxLXDO8lqVJIoSxg6tNMwCCLNJI2aA3DArMGjPa7HJbuCbsoi4jB9eEJG7ImujNJXZRA2YMpXwOnVA8HI_hlMnPN3bhI9a6hZQApuCRU4LIrmLy2u2tDVVuZp0OKIWj1jgLOUP8KSXua4jUAvSp7gUFQ7bcVG-bHbuf7T4ZQuqa-IazUzAsbhhYtVZEw7h4ukVYUyaWsgvwXwQ5fRKqkQvKFJYa4z-xnVRTF1mek5oX9kNYZLD7TCpkdDLQkRHfnjDXxWlhCOM9166ZUkkHdU4evWMsUjddwLGzFyP58XBXRM0skpk_nlYDjHHq_8qyp_TIpMFDEj84nvdfvzh_lYbLrXAVGfb0kYcB8yFZn1Z716BrJmuvYMgAOCvln__-Nm00)

<details>
<summary>PlantUML source</summary>

```plantuml
@startuml
left to right direction
skinparam componentStyle rectangle
actor "Customer / Admin" as User
node "Browser" as Browser
package "Frontend (React + Vite)" {
  [Pages] as Pages
  [AuthContext] as AuthContext
  [CartContext] as CartContext
  [Axios API Client] as Api
  database "localStorage" as Storage
}
package "Backend (Spring Boot)" {
  [SecurityConfig\nJwtAuthFilter] as Security
  [Controllers] as Controllers
  [Services] as Services
  [Repositories] as Repositories
}
database "MySQL" as MySQL
User --> Browser
Browser --> Pages
Pages --> AuthContext
Pages --> CartContext
AuthContext --> Api
CartContext --> Api
AuthContext --> Storage
Api --> Security
Security --> Controllers
Controllers --> Services
Services --> Repositories
Repositories --> MySQL
@enduml
```

</details>

### 2. Use Case Diagram

```mermaid
flowchart LR
    Customer((Customer))
    Admin((Admin))

    subgraph LuxeSystem[LUXE system]
        UC1([Register or login])
        UC2([Browse products])
        UC3([View product details])
        UC4([Manage cart])
        UC5([Checkout and place order])
        UC6([View order history])
        UC7([View admin dashboard])
        UC8([Create, update, or soft-delete products])
        UC9([Import products from CSV])
        UC10([Update order status])
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6

    Admin --> UC1
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
```

### 3. Structural Domain Class Diagram

![PlantUML structural domain class diagram](https://www.plantuml.com/plantuml/svg/hLHDZzem4BtdLrWSA-rgzvf3jIcXRIJ88YYzE_OqMCHsQeyNqQh_lHF3WabPgL9xodmyZz-ypFZ98tSOT9TjbGIc0RTM-iplbEcvuvg9ZdjV83hL18HAMBDMFu0zP1cOeDdATi1-PenjrhCLVOfoKTNPhrFssKbmQ-GOV0GjPtLPrP_8cZxN7wlLObQIlVvSBPVHAcVpwkji5UrfKKzdypdPL2soO1iFBjPHCcTpQreoGNFLvMnD1AFV4t1ldKn2tqBNrLn3YjfQa_fSIWVU9n57ZUMnlU4ImviEg6PZAS0DXOG3ZY0B79W8tfNaVL5wG8TUtawT6rawAuF0SI_ccgG4BvpgKLcJKdTA4Eg3QaiGIlEEOjQfLXdUBM_aF5gnorbb45fm0tEYqrftI6esZfjKCRyBYKSAcqhp5ZOkLPeBL2-GQk8uKYfdfGrDrCt1YuBzr0Q3Lmp-WtQHq5X0DMPvFZMbAQyGzFZ4zy0DAZnSw9sFnE4Tuz4Yxmfzx6Yayp3cUJhpGtIh-fwO57yCMCyF6WmkuiObSNHSqFQrTT0Dk2JnJwf5LdydmAqHepfn-UxktXztuYZEuARzHipaSK89DdcultytkGYVCxitDo77MZdhEox0Pw_BSGsw-kqvs_AtWCc5oj2mEpoHVOKzNYuzuUXHGvhnjogcq3uuGNU3P4JW2Ooaf_Ct)

<details>
<summary>PlantUML source</summary>

```plantuml
@startuml
hide methods
skinparam classAttributeIconSize 0

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

class User {
  id: Long
  email: String
  password: String
  fullName: String
  phone: String
  address: String
  role: Role
  enabled: boolean
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}

class Product {
  id: Long
  name: String
  description: String
  price: BigDecimal
  originalPrice: BigDecimal
  stock: Integer
  category: String
  brand: String
  sku: String
  mainImageUrl: String
  active: boolean
  rating: Double
  reviewCount: Integer
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}

class ProductImage {
  id: Long
  imageUrl: String
}

class CartItem {
  id: Long
  quantity: Integer
}

class Order {
  id: Long
  totalAmount: BigDecimal
  status: OrderStatus
  shippingAddress: String
  paymentMethod: String
  trackingNumber: String
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}

class OrderItem {
  id: Long
  quantity: Integer
  price: BigDecimal
}

User --> Role
Order --> OrderStatus
User "1" -- "0..*" CartItem : owns
User "1" -- "0..*" Order : places
Product "1" -- "0..*" ProductImage : has
Product "1" -- "0..*" CartItem : in cart
Order "1" -- "1..*" OrderItem : contains
Product "1" -- "0..*" OrderItem : purchased as
@enduml
```

</details>

### 4. Authentication Sequence Diagram

```mermaid
sequenceDiagram
    actor Customer
    participant UI as React UI
    participant Controller as AuthController
    participant Service as AuthService
    participant Auth as AuthenticationManager
    participant Repo as UserRepository
    participant JWT as JwtUtil
    participant Store as localStorage

    Customer->>UI: Submit register or login form
    UI->>Controller: POST /auth/register or /auth/login
    Controller->>Service: register(request) or login(request)

    alt Register flow
        Service->>Repo: existsByEmail(email)
        Service->>Repo: save(user with encoded password)
    else Login flow
        Service->>Auth: authenticate(email, password)
        Service->>Repo: findByEmail(email)
    end

    Service->>JWT: generateToken(email)
    Service-->>Controller: AuthResponse(token, user metadata)
    Controller-->>UI: 200 OK
    UI->>Store: save luxe_token and luxe_user
    UI-->>Customer: Redirect as authenticated user
```

### 5. Checkout and Order Placement Sequence Diagram

```mermaid
sequenceDiagram
    actor Customer
    participant UI as CheckoutPage
    participant Controller as OrderController
    participant Service as OrderService
    participant CartRepo as CartItemRepository
    participant ProductRepo as ProductRepository
    participant OrderRepo as OrderRepository
    participant DB as MySQL

    Customer->>UI: Confirm shipping address and payment method
    UI->>Controller: POST /orders
    Controller->>Service: placeOrder(email, request)
    Service->>CartRepo: findByUser(user)

    alt Cart is empty
        Service-->>Controller: error
        Controller-->>UI: failure response
    else Cart has items
        loop For each cart item
            Service->>ProductRepo: validate active product and stock
            Service->>ProductRepo: deduct stock
        end
        Service->>OrderRepo: save order and order items
        OrderRepo->>DB: persist order data
        Service->>CartRepo: deleteByUser(user)
        Service-->>Controller: OrderResponse
        Controller-->>UI: 200 OK
        UI-->>Customer: Redirect to order details page
    end
```

### 6. Order State Diagram

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> CONFIRMED
    CONFIRMED --> SHIPPED
    SHIPPED --> DELIVERED

    PENDING --> CANCELLED
    CONFIRMED --> CANCELLED
    SHIPPED --> CANCELLED

    note right of CANCELLED
        When an existing order moves to CANCELLED,
        stock is restored for each order item.
    end note
```

### 7. Customer Shopping Workflow

```mermaid
flowchart TD
    Start([Start]) --> Browse[Browse product catalog]
    Browse --> Filter[Search, filter, or sort products]
    Filter --> Detail[Open product details]
    Detail --> SignedIn{Signed in?}
    SignedIn -- No --> Auth[Register or login]
    SignedIn -- Yes --> Add[Add product to cart]
    Auth --> Add
    Add --> Cart[Review cart and update quantity]
    Cart --> Checkout[Open checkout page]
    Checkout --> Validate{Cart valid and stock available?}
    Validate -- No --> Cart
    Validate -- Yes --> Order[Place order]
    Order --> Pending[Order saved with PENDING status]
    Pending --> Track[View order history and details]
    Track --> End([End])
```

### 8. Admin Catalog Workflow

```mermaid
flowchart TD
    AdminStart([Admin login]) --> Dashboard[Open admin panel]
    Dashboard --> Task{Choose task}
    Task --> Stats[Review dashboard stats]
    Task --> Manual[Create or edit product]
    Task --> Delete[Soft-delete product]
    Task --> Csv[Upload CSV file]

    Manual --> SaveProduct[POST or PUT /products]
    Delete --> SoftDelete[DELETE /products/:id sets active=false]
    Csv --> ImportApi[POST /admin/products/import-csv]
    ImportApi --> Parse[Parse CSV rows]
    Parse --> Upsert[Upsert product by SKU]
    Upsert --> SaveImages[Normalize main image and gallery images]
    SaveProduct --> SaveImages
    SoftDelete --> Refresh[Refresh product list and stats]
    SaveImages --> Refresh
    Stats --> Refresh
```

### 9. CI/CD Workflow

```mermaid
flowchart LR
    Feature[feature/* branch] --> PR[Pull request]
    PR --> Gates[PR quality gates]
    Gates --> Dev[dev branch]
    Dev --> CI[CI build and test workflow]
    CI --> Staging[staging branch]
    Staging --> StagingDeploy[Deploy staging]
    StagingDeploy --> Main[main branch]
    Main --> ProdDeploy[Deploy production]
    ProdDeploy --> Vercel[Vercel frontend]
    ProdDeploy --> Railway[Railway backend]
```

### 10. Structural Deployment Diagram

![PlantUML structural deployment diagram](https://www.plantuml.com/plantuml/svg/NP91JyCm38Nl-HNMxjFkEw1rGZ0ca4exSKzRTuiMwYZ9g2h4VyTDlR9nYkFtnNf-xIP4xUFbqogBROH8uCtn5A4n7kjeg5EwZkJX4R_GaaClz_94Rhnrr20idatSNIeeq54mB0yBq06cxZsIfQ4XwL8BiFNK1_H9aLgK3_GrsYHC9Nmh0BPjMZO3YmB7eyopX3nvwY9sJUQS-f49XJQsrvChgV_DA9qttH6sH16o_6LoeUlpFAZHKLSw_0s3jw5yVqrWgjGS4IoN3x8yhC5Tmad9RHHaQrOYHtral2T_RYrlhAxQoCcgQsZGMHgWbRtkeAkNcQecpqg-JuAkQSgPUZSfyMDBkW7DUzwsqzCv0gPsXqDUmaexesxw8vO2O6AVPx22COmDg_nN_G80)

<details>
<summary>PlantUML source</summary>

```plantuml
@startuml
left to right direction
actor Developer
actor Shopper
node "GitHub Repository" as GitHub
node "GitHub Actions" as Actions
node "Browser" as Browser
node "Vercel" as Vercel {
  artifact "React SPA" as FrontendApp
}
node "Railway" as Railway {
  artifact "Spring Boot API" as BackendApp
}
database "Railway MySQL" as MySQL
Developer --> GitHub : push
GitHub --> Actions : trigger workflows
Actions --> Vercel : deploy frontend
Actions --> Railway : deploy backend
Shopper --> Browser
Browser --> FrontendApp : load app
FrontendApp --> BackendApp : HTTPS /api
BackendApp --> MySQL : JPA / SQL
@enduml
```

</details>

## Key Business Rules Captured in the Code

- JWT tokens are created on login and registration, then stored in `localStorage` by the frontend.
- Product listing and product details are public; cart, checkout, orders, and admin endpoints require authentication.
- Admin-only routes are guarded with Spring Security role checks.
- Product deletion is a soft delete: `DELETE /products/{id}` sets `active=false`.
- Inactive products are pruned from carts the next time the cart is loaded or updated.
- Placing an order validates stock, deducts inventory, creates order items, and clears the cart.
- Cancelling an existing order restores stock for each order item.
- CSV imports upsert products by `sku` and build image galleries from the `images` column.

## API Overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google` |
| Products | `GET /api/products`, `GET /api/products/{id}`, `GET /api/products/categories`, `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}` |
| Cart | `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/{itemId}?quantity={n}`, `DELETE /api/cart` |
| Orders | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/{id}`, `GET /api/orders/admin/all`, `PATCH /api/orders/{id}/status` |
| Admin | `GET /api/admin/stats`, `POST /api/admin/products/import-csv` |

## Local Development

### Prerequisites

- Java 17
- Maven 3.8+
- Node.js 18+
- npm
- Docker Desktop or Docker Engine

### Option 1: Setup Script

The repository includes `scripts/setup.sh` for bash-based environments such as Linux, macOS, Git Bash, or WSL.

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option 2: Manual Setup

```bash
docker compose -f docker/docker-compose.yml up -d mysql
cd backend
mvn spring-boot:run
```

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

### Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`
- CSV template: `http://localhost:3000/product-import-template.csv`

### Google Sign-In Configuration

To enable Google login and registration, configure the same Google OAuth client in both apps:

- Backend env: `GOOGLE_CLIENT_ID`
- Frontend env: `VITE_GOOGLE_CLIENT_ID`

The frontend sends the Google ID token to `POST /api/auth/google`, and the backend verifies it against the configured Google client ID before issuing the app's own JWT.

## Deployment Targets

| Environment | Frontend | Backend API |
|---|---|---|
| Production | `https://luxe.vercel.app` | `https://luxe-api.railway.app/api` |
| Staging | `https://luxe-staging.vercel.app` | `https://luxe-api-staging.railway.app/api` |

## Useful Commands

```bash
# Backend tests
cd backend
mvn test

# Backend package
cd backend
mvn clean package

# Frontend development
cd frontend
npm run dev

# Frontend production build
cd frontend
npm run build
```

## Related Docs

- `docs/DEPLOYMENT.md`
- `docs/CONTRIBUTING.md`

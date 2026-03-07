// Example API test cases for Postman or curl

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Register User
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}

// Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64a7f8b9c1d2e3f4g5h6i7j8",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

---

// Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

---

// ============================================
// FOOD ENDPOINTS
// ============================================

// Get All Foods
GET /api/foods

// Get Foods with Filters
GET /api/foods?category=biryani&veg=false&priceMin=200&priceMax=400&sort=rating

// Get Single Food
GET /api/foods/64a7f8b9c1d2e3f4g5h6i7j8

// Get Featured Foods
GET /api/foods/featured

// Get Bestsellers
GET /api/foods/bestsellers

---

// ============================================
// CATEGORY ENDPOINTS
// ============================================

// Get All Categories
GET /api/categories

// Create Category (Admin Only)
POST /api/admin/categories
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Biryani",
  "slug": "biryani",
  "description": "Traditional biryani dishes",
  "icon": "🍚",
  "displayOrder": 1
}

---

// ============================================
// CART ENDPOINTS
// ============================================

// Add to Cart
POST /api/cart/add
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "foodId": "64a7f8b9c1d2e3f4g5h6i7j8",
  "quantity": 2,
  "selectedSize": "Large",
  "selectedAddOns": ["Extra Cheese", "Garlic"],
  "specialInstructions": "Extra spicy"
}

// Get Cart
GET /api/cart
Authorization: Bearer TOKEN

// Update Cart Item
PUT /api/cart/update/ITEM_ID
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "quantity": 3
}

// Remove from Cart
DELETE /api/cart/remove/ITEM_ID
Authorization: Bearer TOKEN

// Clear Cart
DELETE /api/cart/clear
Authorization: Bearer TOKEN

---

// ============================================
// ADDRESS ENDPOINTS
// ============================================

// Add Address
POST /api/users/addresses
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "label": "home",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apartment 4B",
  "city": "Hyderabad",
  "state": "Telangana",
  "zipCode": "500001",
  "location": {
    "type": "Point",
    "coordinates": [78.4744, 17.3850]
  },
  "phoneNumber": "9876543210"
}

// Get Addresses
GET /api/users/addresses
Authorization: Bearer TOKEN

// Update Address
PUT /api/users/addresses/ADDRESS_ID
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "addressLine1": "456 New Street"
}

// Delete Address
DELETE /api/users/addresses/ADDRESS_ID
Authorization: Bearer TOKEN

---

// ============================================
// ORDER ENDPOINTS
// ============================================

// Create Order
POST /api/orders
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "deliveryType": "delivery",
  "deliveryAddressId": "64a7f8b9c1d2e3f4g5h6i7j8",
  "paymentMethod": "razorpay",
  "couponCode": "WELCOME10"
}

// Response:
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "64a7f8b9c1d2e3f4g5h6i7j8",
    "orderId": "ORD-1697234567890-123",
    "user": "64a7f8b9c1d2e3f4g5h6i7j8",
    "items": [...],
    "subtotal": 560,
    "tax": 28,
    "deliveryFee": 30,
    "total": 618,
    "ordersStatus": "placed",
    "statusTimeline": [
      {
        "status": "placed",
        "timestamp": "2024-10-13T12:34:56.789Z"
      }
    ]
  }
}

// Get User Orders
GET /api/orders
Authorization: Bearer TOKEN

// Get Order Details
GET /api/orders/ORDER_ID
Authorization: Bearer TOKEN

---

// ============================================
// PAYMENT ENDPOINTS
// ============================================

// Create Payment Order
POST /api/payments/create-order
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "orderId": "64a7f8b9c1d2e3f4g5h6i7j8",
  "amount": 618
}

// Verify Payment
POST /api/payments/verify
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "paymentId": "64a7f8b9c1d2e3f4g5h6i7j8",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}

---

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get All Orders (Admin)
GET /api/admin/orders
Authorization: Bearer ADMIN_TOKEN

// Update Order Status (Admin)
PUT /api/admin/orders/ORDER_ID/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "preparing",
  "notes": "Order started being prepared"
}

// Create Food (Admin)
POST /api/admin/foods
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Hyderabadi Biryani",
  "category": "CATEGORY_ID",
  "price": 280,
  "discount": 10,
  "description": "Traditional Hyderabadi biryani with basmati rice",
  "image": "https://images.unsplash.com/...",
  "isVegetarian": false,
  "ingredients": ["Rice", "Chicken", "Spices"],
  "preparationTime": 30,
  "spiceLevel": "medium",
  "calories": 450,
  "sizes": [
    { "size": "Regular", "price": 280 },
    { "size": "Large", "price": 380 }
  ],
  "addOns": [
    { "name": "Extra Chicken", "price": 100 },
    { "name": "Raita", "price": 40 }
  ]
}

// Update Food (Admin)
PUT /api/admin/foods/FOOD_ID
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "price": 300,
  "isAvailable": true
}

// Delete Food (Admin)
DELETE /api/admin/foods/FOOD_ID
Authorization: Bearer ADMIN_TOKEN

---

// ============================================
// CURL EXAMPLES
// ============================================

// Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'

// Get all foods with filters
curl "http://localhost:5000/api/foods?category=biryani&veg=false&priceMin=200&priceMax=400"

// Create food (admin)
curl -X POST http://localhost:5000/api/admin/foods \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paneer Tikka",
    "category": "CATEGORY_ID",
    "price": 220,
    "isVegetarian": true
  }'

// Add to cart
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foodId": "FOOD_ID",
    "quantity": 2
  }'

// Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryType": "delivery",
    "deliveryAddressId": "ADDRESS_ID",
    "paymentMethod": "razorpay"
  }'

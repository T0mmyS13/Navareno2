# API Documentation

This document provides detailed information about all API endpoints in the Navařeno application.

*Last updated: 2025-06-26T05:54:16.986Z*

## Base URL
```
http://localhost:3000
```

## Endpoints

### /api/auth\change-password

**Description:** API endpoint

#### POST /api/auth\change-password

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `401`: Error response: 401
- `400`: Error response: 400
- `400`: Error response: 400
- `404`: Error response: 404
- `400`: Error response: 400
- `500`: Error response: 500

---

### /api/auth\profile

**Description:** API endpoint

#### GET /api/auth\profile

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `401`: Error response: 401
- `404`: Error response: 404
- `500`: Error response: 500
- `401`: Error response: 401
- `400`: Error response: 400
- `400`: Error response: 400
- `500`: Error response: 500

#### POST /api/auth\profile

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `401`: Error response: 401
- `404`: Error response: 404
- `500`: Error response: 500
- `401`: Error response: 401
- `400`: Error response: 400
- `400`: Error response: 400
- `500`: Error response: 500

---

### /api/auth\register

**Description:** API endpoint

#### POST /api/auth\register

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `400`: Error response: 400
- `400`: Error response: 400
- `500`: Error response: 500

---

### /api/favorites

**Description:** GET: Vrátí všechny oblíbené recepty přihlášeného uživatele

#### GET /api/favorites

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `401`: Error response: 401
- `401`: Error response: 401
- `401`: Error response: 401

#### POST /api/favorites

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `401`: Error response: 401
- `401`: Error response: 401
- `401`: Error response: 401

#### DELETE /api/favorites

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `401`: Error response: 401
- `401`: Error response: 401
- `401`: Error response: 401

---

### /api/recipes

**Description:** src/app/api/recipes/route.ts

#### GET /api/recipes

**Parameters:**
- `category` (query): Query parameter: category

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `500`: Error response: 500
- `400`: Error response: 400
- `409`: Error response: 409
- `500`: Error response: 500
- `400`: Error response: 400
- `404`: Error response: 404
- `500`: Error response: 500

#### POST /api/recipes

**Parameters:**
- `category` (query): Query parameter: category

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `500`: Error response: 500
- `400`: Error response: 400
- `409`: Error response: 409
- `500`: Error response: 500
- `400`: Error response: 400
- `404`: Error response: 404
- `500`: Error response: 500

#### PUT /api/recipes

**Parameters:**
- `category` (query): Query parameter: category

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `500`: Error response: 500
- `400`: Error response: 400
- `409`: Error response: 409
- `500`: Error response: 500
- `400`: Error response: 400
- `404`: Error response: 404
- `500`: Error response: 500

---

### /api/recipes\[category]\[recipe]\rating

**Description:** API endpoint

#### PATCH /api/recipes\[category]\[recipe]\rating

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `403`: Error response: 403
- `400`: Error response: 400
- `404`: Error response: 404
- `500`: Error response: 500

---

### /api/recipes\[category]\[recipe]

**Description:** API endpoint

#### GET /api/recipes\[category]\[recipe]

**Responses:**
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `200`: Success response
- `404`: Error response: 404
- `500`: Error response: 500

---


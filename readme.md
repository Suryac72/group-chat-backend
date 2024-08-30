# Group Chat Application - Assignment Solution

## Overview
This Node.js application provides group chat functionalities, including user management by an admin, group management, and messaging features.

## Features
- **Admin**: Create and edit users.
- **Users**: 
  - Authentication (Login/Logout)
  - Group Management (Create, delete, search, add members)
  - Messaging (Send messages, like messages)

## Tech Stack
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Swagger** for API documentation

## Setup Instructions

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd assignment-solution
   ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Add Environment Variables in .env file at root level**

    ```
    MONGO_URI=<your-mongodb-uri>
    JWT_SECRET=<your-jwt-secret>
    ```
    ## Note:

    - Environment Variables content attached with email along with repository link 



4. **For Running Application (DEV Mode)**

    ```
    npm run dev
    ```

5. **For Running Application (App Mode)**

    ```
    npm run start
    ```

6. **For Running Application E2E Tests**

    ```
    npm run test
    ```
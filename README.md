# Social Calendar

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/) (optional, for cloning the repository)

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/social-calendar.git
   ```

   Navigate to the project directory:

   ```bash
   cd social-calendar
   ```
2. **Install dependencies**

   Run the following command to install all necessary packages:

   ```bash
   npm install
   ```
3. **Environment Variables**

  To run the project, you need to configure environment variables in a `.env` file.
  ```env
  # Secret key for signing JWTs
  JWT_SECRET=your_secret_key_here

  # Port for the backend server
  PORT=5000
  ```

4. **Firebase Service Account Key**

   Place your Firebase service account key file (`firebaseServiceAccountKey.json`) in the `backend/firebase-admin` directory. This file is required for Firebase Admin SDK functionalities.

---

## Usage

### Run the development server

Start the development server with:

```bash
npm start
```

### Build for production

To create an optimized production build, run:

```bash
npm run build
```

The output will be stored in the `build/` directory.

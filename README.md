# Fronend Setup Instructions

Follow these steps to run the project locally:

### 1. Clone the project
```bash
https://github.com/sagard214/learning-management-system.git

```
### 2. Move into the directory
```bash
cd frontend
```
### 3. Install dependencies
```bash
npm i
```
### 4. Run the server
```bash
npm run dev
```
### How to setup taildinw in your project [Link](https://tailwindcss.com/docs/guides/vite)

1. Install tailwind and other dependencies
```
    npm install -D tailwindcss postcss autoprefixer
```

2. Create the `tailwind.config.js` file
```
    npx tailwindcss init -p
```

3. Add the files and extensions to tailwind config in the content property
```
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
```

4. Add the tailwind directives on the top of index.css file
```
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
```

5. Then run the server, tailwind should be integrated....


### Adding plugins and dependencies

```
    npm install @reduxjs/toolkit react-redux react-router-dom react-icons react-chartjs-2 chart.js daisyui axios react-hot-toast @tailwindcss/line-clamp
```
# Backend Setup Instructions
### 1. Clone the project
```bash
git clone https://github.com/sagard214/learning-management-system.git
```
### 2. Move into the directory
```bash
cd backend
```
### 3. Install dependencies
```bash
npm i
```
### 4. Run the server
```bash
npm run dev
```
### 5. Backend dependencies
```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer cloudinary morgan nodemailer razorpay cookie-parser
npm install --save-dev nodemon

```




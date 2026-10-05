import dotenv from 'dotenv';
dotenv.config();
export const config={port:process.env.PORT||5000,mongo:process.env.MONGO_URI||'mongodb://127.0.0.1:27017/cocogrow',jwt:process.env.JWT_SECRET||'dev_secret',client:process.env.CLIENT_URL||'http://localhost:5173',transactions:process.env.MONGO_TRANSACTIONS==='true'};

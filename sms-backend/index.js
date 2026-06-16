import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/route.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(router);
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
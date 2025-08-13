import express from 'express'
import cors from 'cors';
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json())


import userRoutes from './routes/user.route.js'
import scrapedRoutes from './routes/scrape.route.js'    

app.use('/api/v1/users',userRoutes)
app.use('/api/v1/scrape',scrapedRoutes)

export default app;
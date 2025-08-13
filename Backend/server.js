import app from "./app.js"
import dotenv from 'dotenv';
dotenv.config();

const startApp = async () => {
    try {
        const port  = process.env.PORT
        app.listen(port,()=>{
            console.log(`Server is running at http://localhost:${port}`); 
        })
    } catch (error) {
        console.log("App cannot start",error);  
    }
}

startApp();
import express from 'express'
import userRouter from './routes/userRoutes.js'
import cors from 'cors'
import applicationError from './controllers/errorHandlerController.js'




const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/v2/user' , userRouter )
app.use(applicationError)



export default app
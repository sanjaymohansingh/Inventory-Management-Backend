import User from "../models/userModel.js";
import catchApiError from "../utils/catchApiError.js";
import { filterResponse } from "../utils/commonUtils.js";
import jwt  from "jsonwebtoken";
import AbstractApplicationError from "../utils/AbstractionApplicationError.js";

const signUp = catchApiError(async (req , res , next)=>{
    const {name , email , password , confirmPassword} = req.body
    const user = await User.create({
       name,
       email,
       password,
       confirmPassword
    })
    const token = jwt.sign({id : user._id} , process.env.SECRET_KEY , {
        expiresIn : process.env.EXPIRY_TIME
    })
    const finalResult = filterResponse( user , 'name' , 'email' , '_id' )

    res.status(201).json({
        status : 'success',
        token , 
        data : finalResult
    })
})

const signIn = catchApiError(async(req,res,next)=>{
    const { email , password} = req.body
    if(!password || !email) return next(new AbstractApplicationError('Credential Not Provided' , 400))
    const user = await User.findOne({email})
    if(!user || !(await user.validatePassword(password , user.password))){
        return next(new AbstractApplicationError('Credential are not Valid' , 401))
    }
    const token = jwt.sign({id : user._id} , process.env.SECRET_KEY , {
        expiresIn : process.env.EXPIRY_TIME
    })
    res.status(201).json({
        status : 'success',
        token ,
        data : user.email
    })
})

const authenticateUser = catchApiError( async (req,res,next)=>{
   let token = ''
   if (req.headers?.authorization?.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1]
   }
   if (!token) return next(new AbstractApplicationError('Not Authorized' , 401))

  const verifyToken = await jwt.verify(token , process.env.SECRET_KEY)
  console.log(verifyToken);
  const user = await User.findById(verifyToken.id)
  if(!user) {
    return next(new AbstractApplicationError('User Does Not Exist' , 401))
  }

  if (!user.tokenPasswordValidation(verifyToken.iat)){
    return next(new AbstractApplicationError('Password Has been Changed' ,401))
  }

  req.user = user
  next()
})

const authorizedUser = (...roles) => catchApiError( async(req,res,next)=>{
   if(!roles.includes(req.user.role)){
    return next(new AbstractApplicationError('No access to perform this task' , 403))
   }
   next()
})

const updateUserRole = catchApiError(async(req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.params.id , req.body ,{
        new :true
    })
    res.status(201).json({
        status : 'success',
        user
    })
})

const deleteUser = catchApiError(async(req,res,next)=>{
    if(!req.body.role) return next(AbstractApplicationError('Bad response', 400))
    const user= await User.findByIdAndDelete(req.params.id , {active : false}, {new:true})
    res.status(200).json({
        status:"success" 
    })
})

export { signUp , signIn , authenticateUser , authorizedUser , updateUserRole , deleteUser}
import mongoose from "mongoose"
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name : {
        type : String , 
        required : [true , 'name is required']
    },
    email : {
        type : String,
        required : [true , 'email is required'],
        unique : true
    },
    password : {
        type : String,
        required : [true , 'password is required']
    },
    confirmPassword : {
        type : String,
        required : [true , 'confirmPassword is required'],
        validate : {
            validator : function(el){
               return el === this.password
            },
            message : `Password Didn't Match`
        }
    },
    role:{
       type: String,
       enum : {
        values: ['admin' , 'user' , 'merchant' , 'moderator'],
        message : 'enter the correct role'
       },
       default : 'user'

    },
    active:{
        type : Boolean,
        default : true
    },
    passwordChangedTimeStamp : Date
})


userSchema.pre('save' , async function(next){
    if ( !this.isModified('password'))  return next()
    this.password = await bcrypt.hash(this.password , 12)
    this.passwordChangedTimeStamp = Date.now() - 1000
    this.confirmPassword = undefined
    next()
})


userSchema.methods.validatePassword = async function(clientPassword , dbPassword){
   return await bcrypt.compare(clientPassword , dbPassword)
}

userSchema.methods.tokenPasswordValidation = async function(tokenIssueDate){
    if(this.passwordChangedTimeStamp){
        const passwordChange =  Math.floor(this.passwordChangedTimeStamp.getTime())/100
        return tokenIssueDate > passwordChange
    }
}

const User = mongoose.model('User' , userSchema)

export default User
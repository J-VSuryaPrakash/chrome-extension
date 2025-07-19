import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    username: {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    blockedSites : [
        {
            sitename: {
                type: String
            },
            siteurl: {
                type: String,
                required: true
            }
        }
    ],
    reports: [{
        type: Schema.Types.ObjectId,
        ref: 'DailyReport'
    }]
})

userSchema.pre("save", async function(next){
    
    if(!this.isModified("password"))
        return next()

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.getRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            username: this.username,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.getAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User' , userSchema)
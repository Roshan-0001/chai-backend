import  mongoose , { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username:{
            type: "string",
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type: "string",
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName:{
            type: "string",
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: "string" // cloudinary url 
        },
        coverImage: {
            type: "string", //cloudinary url
        },
        watchhistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "video"
            }
        ],
        password: {
            type: "string",
            require: [true, "password is require"]
        },
        refreshToken:{
            type: "string"
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generaterefreshToken = function(){
    jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)
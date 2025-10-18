import { Schema, model} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { type } from "os";

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [ true, `Name is required`],
        minLength: [5, `Name must be at-least 5 character`],
        maxLength: [50, `Name must be less than 50 characters`],
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, `email is required`],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
             `Please fill in a valid email address`,  // regex email validator
        ]
    },
    password: {
        type: String,
        required: [true, `Password is required`],
        minLength: [8, `Password must be atleast 8 character`],
        select: false
    },
    role: {
        type: String,
        enum: [`USER`, `ADMIN`],
        default: `USER`
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    }
}, {
    timestamps: true
});

userSchema.pre(`save`, async function(next){
    if(!this.isModified(`password`)){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
    comparePassword: async function ( plainTextPassword){
        return await bcrypt.compare(plainTextPassword, this.password);
    },
    generateJWTToken: function(){
        return jwt.sign(
            {id: this.id, role: this.role, email: this.email, subscription: this.subscription},
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        )
    },
    generatePasswordToken: async function() {                //  For forgot password
        const resetToken = crypto.randomBytes(20).toString(`hex`);

        this.forgotPasswordToken = crypto
            .createHash(`sha256`)
            .update(resetToken)
            .digest(`hex`)
        ;
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;  // 15min from now

        return resetToken ;
    }
}

const User = model(`User`, userSchema);   // User is name of collestion

export default User;
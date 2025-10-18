import User from "../model/user.model.js";
import  appError  from "../utils/appError.js";  
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { log } from "console";

const cookieOptions = {
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
    httpOnly: true
}

const register = async (req , res, next) =>{
   try{ 
    const { fullName , email, password} = req.body

    if (!fullName || !email || !password){
        return next(new appError(`All fields are required`, 400));
    }
    console.log(req.body);
    
    console.log(fullName , email , password);
    
    const userExists = await User.findOne({ email });

    if(userExists){
        return next(new appError(`Email already exists`, 400))
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: `https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drgxv.jpg`
        }
    })

    if (!user){ //User
        return next(new appError(`User registration failed, please try again`, 400))
    }

    //TODO: upload user picture

    if(req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: `LMS`,
                width: 250,
                height: 250,
                gravity: `faces`,
                crop: `fill`
            });

            if(result){
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (e) {
            return next(new appError( e.message || `File not uploaded, please try again`, 500))
        }
    }
   
    
    await user.save();

    // TODO: set JWT token in cookie

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: `User registerd successfully`,
        user
    })
}catch(e){
    console.log(e);
    
}
}

const login = async (req , res) =>{
    const {email, password } = req.body;

    if(!email || !password) {
        return next(new appError(`All fields are required`, 400));
    }

    const user = await User.findOne({
        email
    }).select(`+password`);

    if (!user || !user.comparePassword(password)) { //TODO
        return next(new appError(`Email or password do not match`, 400)); 
    }

    const token = await user.generateJWTToken();
    user.password = undefined;
    
    res.cookie(`token`, token,  cookieOptions)

    res.status(201).json({
        success: true,
        message: `User register successfully`,
        user
    })
}

const logout = (req, res, next) => {
    res.cookie('token', null, {
      secure: true, // set to false if not using HTTPS locally
      maxAge: 0,
      httpOnly: true,
      sameSite: 'Lax', // optional, helps prevent CSRF
    });
  
    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  };
  

// const getProfile = (req , res) =>{
//     const user = User.findById(req.user.id)

//     res.status(200).json({
//         success: true,
//         message: `User details`,
//         user
//     })
// }

const getProfile = async (req, res, next) => {
  try {
    // Ensure middleware attached user
    if (!req.user || !req.user.id) {
      return next(new appError("Unauthorized access - user not found", 401));
    }

    // Wait for DB query
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new appError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return next(new appError("Failed to fetch user details", 500));
  }
};


const forgotPassword = async (req, res, next) =>{
    const { email } = req.body;

    if (!email) {
        return next(
            new appError(`Email is required`, 400)
        )
    }

    const user = await User.findOne({email});

    if (!user) {
        return next(
            new appError(`Email is not registered`, 400)
        )
    }

    const resetToken = await user.generatePasswordToken();

    await user.save();

    const resetPasswordUrl = `${process.env.FRONTED_URL}/reset-password/${resetToken}`;
    const subject = `Reset Password`;
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank"> Reset your Password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;
    

    console.log(resetPasswordUrl);
    
    try {
        //  TODO: create sendEmail
        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully!`
        });

    } catch (e) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();
        return next( new appError(e.message , 500));
    }
}

const resetPassword = async (req, res, next) =>{
    const { resetToken } = req.params;
    const { password } = req.body;
    
    const forgotPasswordToken = crypto
        .createHash(`sha256`)
        .update(resetToken) 
        .digest(`hex`)

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        new appError(`Token is invalid or expired, please try again `, 400)
    }

    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: `Password changed successfully`
    })
}

const  changePassword = async function(req, res, next){
    const { oldPassword, newPassword} = req.body;
    const { id } = req.body   // authMiddelware provide id

    if( !oldPassword || !newPassword) {
        return next(
            new  appError(`All fields are manddatory`, 400)
        )
    }

    const user = await User.findById(id).select(`+password`);

    if (!user){
        return next(
            new appError(`User does not exist`, 400)
        )
    }

    const isPasswordValid = await user.comparePassword(password)  // comparePassword medthod defined in usermodel

    if (!isPasswordValid) {
        return next(
            new appError(`Invalid old password`, 400)
        )
    }

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: ` Password changed successfully`
    })
};

const updateUser = async function(req, res, next){
    const { fullName } = req.body;
    const { id } = req.user
    // const { id } = req.params   //  middelware

    const user = await User.findById(id);

    if (!user){
        return next(
            new appError(`User does not exist`, 400)
        )
    }

    if ( fullName) {
        user.fullName = fullName;
    }

    if (req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: `LMS`,
            width: 250,
            hight: 250,
            gravity: `faces`,
            crop: `fill`
        });

        if(result){
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;

            fs.rm(`uploads/${req.file.filename}`)
        }
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: `User updated successfully`
    })
}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";

const generateRefreshAndAccessToken = async(userId) =>{
    try {
        
        const user = await User.findById(userId);
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500 , "Failed to generate refresh token and access token");
    }  
}

const registerUser = asyncHandler(async(req,res) => {

    const {name , email , username , password} = req.body;

    if(
        [name, email, username, password].some((field) => field?.trim() === "")  
    ){
        throw new ApiError(400 , "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{email}, {username}]
    })

    if(existingUser){
        throw new ApiError(400 , "User already exists");
    }

    const user = await User.create({
        name,
        username : username.toLowerCase(),
        email,
        password
    })

    if(!user){
        throw new ApiError(500 , "Registration failed");
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500 , "Registration failed");
    }

    return res.status(200).json(new ApiResponse(200 , "User registered successfully" , createdUser));
})

const loginUser = asyncHandler(async(req,res) => {

    const {email, username, password}  = req.body;

    if(!(email || username)){
        throw new ApiError(400 , "Email or username is required");
    }

    if(!password){
        throw new ApiError(400 , "Password is required");
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if(!user){
        throw new ApiError(400 , "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(400 , "Password is incorrect");
    }

    const {accessToken , refreshToken} = await generateRefreshAndAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if(!loggedInUser){
        throw new ApiError(500 , "Login failed");
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(new ApiResponse(200 , "User logged in successfully" ,{
        user: {
            loggedInUser,
            accessToken,
            refreshToken
        }
        }
    ));
})

const logoutUser = asyncHandler(async(req,res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken : 1 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

export {registerUser,loginUser,logoutUser, getCurrentUser};
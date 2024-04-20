import { asyncHandler} from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/ApiResponse.js";


// generating acess and refresh tokens
const generateAccessAndRefreshTokens = async(userId) =>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false})

        return { accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}

//for registration of the user 

const registerUser = asyncHandler(async (req, res) =>{
    
    // get user details from frontend
    const {fullName, email, username, password} =req.body
    // console.log("Email : ", email);

    // validation - not empty
    if(
        [fullName, username, email, password].some((field) => field?.trim() ==="")
    ) {
        throw new ApiError(400, "All fields are required") 
    }

    // check if user already exists: username , email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with this email or username is already exists")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path 
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar in required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar in required")
    }
    // create user object - create entry in db

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    // remove password and refresh token feild from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    // return response
    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )





})

// for login
const loginUser = asyncHandler(async (req, res) => {

    //request body -> data
    const{email, username, password} = req.body

    //check username or email
    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    //find the user 
    const user = await  User.findOne({
        $or:[{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    //password check
    const isPasswordvalid = await  user.isPasswordCorrect(password)
    if(!isPasswordvalid){
        throw new ApiError(401, "invalid credentials")
    }

    //access and refresh token
    const {accessToken, refreshToken} =await generateAccessAndRefreshTokens(user._id)

    //send cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User loggedin successfully"
        )
    )
    


})

// for logout
const logoutUser = asyncHandler(async (req,res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)    
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out"))
})



export {
    registerUser,
    loginUser,
    logoutUser
    }

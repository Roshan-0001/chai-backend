import { asyncHandler} from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User, user } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) =>{
    
    // get user details from frontend
    const {fullName, email, username, password} =req.body
    console.log("Email : ", email);

    // validation - not empty
    if(
        [fullName, username, email, password].some((field) => field?.trim() ==="")
    ) {
        throw new ApiError(400, "All fields are required") 
    }

    // check if user already exists: username , email
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with this email or username is already exists")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
    const userCreated = await User.findOne(user._id).select(
        "-password refreshToken"
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



export {registerUser}

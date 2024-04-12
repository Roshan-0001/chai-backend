import mongoose, {Mongoose, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videoFile:{
            type: string, //cloudinary url
            required: true
        },
        tumbnail: {
            type: string, //cloudinary url
            required: true
        },
        title: {
            type: string, 
            required: true
        },
        description: {
            type: string, 
            required: true
        },
        duration: {
            type: Number, //cloudinary
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = Mongoose.model("Video" ,videoSchema)
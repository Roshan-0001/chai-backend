import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema (
    {
        subscriber: {
            type: Schema.Types.ObjectId, //the one who is subscribing
            ref: "User"
        },

        channel: {
            type: Schema.Types.ObjectId, //the one who is getting subscribed
            ref: "User"
        }
    } 
    ,{ timestamps: true })


export const subscription = mongoose.model("Subscription", subscriptionSchema)
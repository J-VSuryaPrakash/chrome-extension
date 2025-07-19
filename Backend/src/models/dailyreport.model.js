import mongoose, {Schema} from "mongoose";

const dailyReportSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date : {
        type : Date,
        default: Date.now
    },
    visitedSite: [
        {
            siteName: {
                type: String
            },
            siteUrl: {
                type: String
            },
            timeSpent: {
                type: Number
            }
        }
    ]
    
})

export const DailyReport = mongoose.model('DailyReport' , dailyReportSchema)
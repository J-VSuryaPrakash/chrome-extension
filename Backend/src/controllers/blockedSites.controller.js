import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addSiteToBlockList = asyncHandler(async(req, res) => {

    const {sitename, siteurl} = req.body;

    if(!(sitename || siteurl)){
        throw new ApiError(400 , "Site name or site url is required");
    }

    const user = await User.findById(req.user._id);

    if(!user){
        throw new ApiError(400 , "User not found");
    }

    user.blockedSites.push({
        sitename,
        siteurl
    })

    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(new ApiResponse(200, "Site added to block list",{ blockedSites: user.blockedSites }))
})

const getBlockedSitesList = asyncHandler(async(req, res) => {
    
    const user = await User.findById(req.user._id);

    if(!user){
        throw new ApiError(400 , "User not found");
    }

    const blockedSites = user.blockedSites.map((site) => ({
        sitename: site.sitename
    }));

    if(!blockedSites){
        throw new ApiError(400 , "Blocked sites not found");
    }

    return res.status(200)
    .json(new ApiResponse(200, "Blocked sites list", blockedSites))
})


const removeSiteFromBlockList = asyncHandler(async(req, res) => {

    const {sitename, siteurl} = req.body;

    if(!(sitename || siteurl)){
        throw new ApiError(400 , "Site name or site url is required");
    }

    const user = await User.findById(req.user._id);

    if(!user){
        throw new ApiError(400 , "User not found");
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: {
                blockedSites: {
                    ...(sitename && { sitename }),
                    ...(siteurl && { siteurl })
                }
            }
        },
        { new: true }
    );

    return res.status(200)
    .json(new ApiResponse(200, {}, "Site removed from block list"))
});

export {addSiteToBlockList, getBlockedSitesList, removeSiteFromBlockList}
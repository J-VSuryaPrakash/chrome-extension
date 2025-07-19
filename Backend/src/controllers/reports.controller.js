import {User} from "../models/user.model.js";
import {DailyReport} from "../models/dailyreport.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const logTimeForSite = asyncHandler(async (req, res) => {
  const { sitename, siteurl, timeSpent } = req.body;

  if (!(sitename || siteurl)) {
    throw new ApiError(400, "Site name or site url is required");
  }

  if (!timeSpent) {
    throw new ApiError(400, "Time Spent is required");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsedTimeSpent = Number(timeSpent);

  let report = await DailyReport.findOne({
    user: req.user._id,
    date: today
  });

  if (report) {
    const site = report.visitedSite.find(
      (site) => site.siteName === sitename && site.siteUrl === siteurl
    );

    if (site) {
  
      site.timeSpent = (Number(site.timeSpent) || 0) + (Number(timeSpent) || 0);

    } else {
      report.visitedSite.push({
        siteName: sitename,
        siteUrl: siteurl,
        timeSpent: parsedTimeSpent
      });
    }

    await report.save({ validateBeforeSave: false });
  } else {
    report = await DailyReport.create({
      user: req.user._id,
      date: today,
      visitedSite: [
        {
          siteName: sitename,
          siteUrl: siteurl,
          timeSpent: parsedTimeSpent
        }
      ]
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { reports: report._id }
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Time logged for site"));
});

const getDailyReport = asyncHandler(async (req, res) => {
    
    const dateParam = req.query.date;

    if (!dateParam) {
        throw new ApiError(400, "Date is required");
    }

    const reportDate = dateParam ? new Date(dateParam) : new Date();
    reportDate.setHours(0, 0, 0, 0);

    const report = await DailyReport.findOne({
        user: req.user._id,
        date: reportDate
    }).select("-user").lean();

    if (!report) {
        throw new ApiError(400, "Daily Report not found");
    }

    const totalTimeSpent = report.visitedSite.reduce((acc, site) => acc + site.timeSpent, 0);

    return res.status(200).json(new ApiResponse(200, "Daily Report",{...report, totalTimeSpent}));
});

export {
    logTimeForSite, 
    getDailyReport
}

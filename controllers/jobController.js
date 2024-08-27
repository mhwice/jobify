import "express-async-errors";
import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import day from "dayjs";

export const getAllJobs = async (req, res) => {
  const { search, jobStatus, jobType, sort } = req.query;
  const queryObject = { createdBy: req.user.userId };
  if (search) queryObject.$or = [
    { position: { $regex: search, $options: "i" } },
    { company: { $regex: search, $options: "i" } },
  ];

  if (jobStatus && jobStatus !== "all") queryObject.jobStatus = jobStatus;
  if (jobType && jobType !== "all") queryObject.jobType = jobType;

  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    "a-z": "position",
    "z-a": "-position"
  }

  const sortKey = sortOptions[sort] || sortOptions.newest;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(queryObject).sort(sortKey).limit(limit).skip(skip);
  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);
  res.status(StatusCodes.OK).json({ totalJobs, numOfPages, currentPage: page,jobs });
};

export const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

export const getSingleJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  res.status(StatusCodes.OK).json({ job });
};

export const updateJob = async (req, res) => {
  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(StatusCodes.OK).json({ msg: "job modified", job: updatedJob });
};

export const deleteJob = async (req, res) => {
  const { id } = req.params;
  const removedJob = await Job.findByIdAndDelete(id);
  res
    .status(StatusCodes.OK)
    .json({ msg: "deleted successfully", job: removedJob });
};

export const showStats = async (req, res) => {
  // mongo magic
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, x) => {
    const { _id: title, count } = x;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
    {
      $limit: 6
    }
  ]);

  monthlyApplications = monthlyApplications.map((x) => {
    const { _id: { year, month }, count } = x;
    const obj = { count };
    obj.date = day().month(month - 1).year(year).format("MMM YY");
    return obj;
  });

  monthlyApplications.reverse();

  // let monthlyApplications = [
  //   { date: "May 23", count: 12 },
  //   { date: "Jun 23", count: 1 },
  //   { date: "Jul 23", count: 22 },
  //   { date: "Aug 23", count: 3 },
  //   { date: "Sep 23", count: 11 },
  //   { date: "Nov 23", count: 5 },
  // ];

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

import { StatusCodes } from "http-status-codes";
import User from "../models/UserModel.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { UnauthenticatedError } from "../errors/customErrors.js";
import { createJWT } from "../utils/tokenUtils.js";

export const register = async (req, res) => {

  req.body.password = await hashPassword(req.body.password);

  const isFirstUser = await User.countDocuments() === 0;
  req.body.role = isFirstUser ? "admin" : "user";
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "user created" });
}

export const login = async (req, res) => {
  // req.body.password = await hashPassword(req.body.password);
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new UnauthenticatedError("invalid credentials");
  const isPasswordCorrect = await comparePassword(req.body.password, user.password);
  if (!isPasswordCorrect) throw new UnauthenticatedError("invalid credentials");
  const token = createJWT({ userId: user._id, role: user.role });
  const oneDayInMS = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDayInMS),
    secure: process.env.NODE_ENV === "production"
  });
  res.status(StatusCodes.OK).json({ msg: "user logged in" });
}

export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now())
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out" });
}
import { UnauthenticatedError, UnauthorizedError, BadRequestError } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";

export const authenticateUser = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) throw new UnauthenticatedError("authentication invalid");
  try {
    const { userId, role } = verifyJWT(token);
    const isTestUser = userId === "66c784718637beeda1457813";
    req.user = { userId, role, isTestUser };
    next();
  } catch (e) {
    throw new UnauthenticatedError("authentication invalid");
  }
}

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("unauthorized to access this role");
    }
    next();
  }
}

export const checkForTestUser = (req, res, next) => {
  if (req.user.isTestUser) throw new BadRequestError("demo user, read only");
  next();
}
import  appError  from "../utils/appError.js";
import jwt from "jsonwebtoken";

 // make sure this path is correct

const isLoggedIn = async (req, res, next) => {
  try {

    const { token } = req.cookies;

    if (!token) {
      return next(new appError("Unauthenticated, Please login", 401));
    }

    const tokenDetails = jwt.verify(token, process.env.JWT_SECRET);

    req.user = tokenDetails;

    next();
  } catch (error) {
    return next(new appError("Invalid or expired token", 401));
  }
};




const authorizedRoles = (...roles) => (req, res, next) => {
    const currentRole = req.user.role;
    if (!roles.includes(currentRole)) {
        return next(
            new appError(`You do not has permission to access this route`, 403)
        )
    }

    next();
}


const authorizedSubscriber = async (req, res, next) => {
    const subscriptionStatus = req.user.subscription.status ;
    const currentRole = req.user.role;
    if ( currentRole !== `ADMIN` && subscriptionStatus !== `active`) {
        return next(
            new appError(
                `Please subscribe to access this route`, 403
            )
        )
    }
    next();
}

export {
    isLoggedIn,
    authorizedRoles,
    authorizedSubscriber
}
   

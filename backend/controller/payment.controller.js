import { json } from "express"
import Payment from "../model/payment.model.js"
import User from "../model/user.model.js"
import { razorpay } from "../server.js"
import appError from "../utils/appError.js"
import crypto from "crypto"

// export const getRazorpayApiKey = async (_req, res, _next) => {
//     try {
//         res.status(200).json({
//             success: true,
//             message: `Razorpay API Key`,
//             key: process.env.RAZORPAY_KEY_ID
//         })
//     } catch (e) {
//         return next(
//             new appError(e.message, 500)
//         )
//     }
// }

  export const getRazorpayApiKey = async (req, res, next) => {
    try {
      console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
  
      if (!process.env.RAZORPAY_KEY_ID) {
        throw new Error("RAZORPAY_KEY_ID is undefined");
      }
  
      res.status(200).json({
        success: true,
        message: "Razorpay API Key",
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (e) {
      console.error("Error in getRazorpayApiKey:", e.message);
      next(new appError(e.message, 500));
    }
  };
  

// export const buySubscription = async (req, res, next) => {
//     try {
//         const { id } = req.user;
//         const user = await User.findById(id);
        
//         if (!user) {
//             return next(
//                 new appError(`Unauthorized, please login`, 500)
//             )
//         }

//         if (user.role === `ADMIN`) {
//             return next(
//                 new appError(`Admin cannot purchese a subscription`, 400)
//             )
//         }

//         const subscription = await razorpay.subscriptions.create({
//             plan_id: process.env.RAZORPAY_PLAN_ID,
//             customer_notify: 1,
//             total_count: 12,
//         });

//  // Update user model with subscription
//         user.subscription.id = subscription.id;
//         user.subscription.status = subscription.status;

//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: `Subscribed Successfully`
//         })

//     } catch (e) {
//         return next(
//             new appError(e.message, 500)
//         )
//     }
// }

export const buySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
        
    if (!user) {
      return next(new appError("Unauthorized, please login", 500));
    }

    if (user.role === "ADMIN") {
      return next(new appError("Admin cannot purchase a subscription", 400));
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 12, // ✅ Required field to define duration
    });

    // Update user model with subscription info
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscribed Successfully",
      subscription_id: subscription.id, // Added for frontend
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};


// export const verifySubscription = async (req, res, next) => {
//     try {
//         const { id } = req.user;
//         const user = await User.findById(id);
        
//         if (!user) {
//             return next(
//                 new appError(`Unauthorized, please login`, 500)
//             )
//         }

//         const {
//             razorpay_payment_id, razorpay_signature, razorpay_subscription_id
//         } = req.body;

//         const generatedSignature = crypto
//             .createHmac(`sha256`, process.env.RAZORPAY_SECRET)
//             .update(`${razorpay_payment_id} | ${razorpay_subscription_id}`);

//         if( generatedSignature !== razorpay_signature) {
//             return next(
//                 new appError(`Payment not verified, please try again`, 500)
//             )
//         }

//         // Record payment details in payment collection 

//         await Payment.create({
//             razorpay_payment_id,
//             razorpay_signature,
//             razorpay_subscription_id
//         });

//         // Update user record with subscription status

//         user.subscription.status = `active`;
//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: `Payment verified successfully`
//         });

//     } catch (e) {
//         return next(
//             new appError(e.message, 500)
//         )
//     }
// }

export const verifySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
      return next(new appError("Unauthorized, please login", 401));
    }

    const {
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_signature || !razorpay_subscription_id) {
      return next(new appError("Missing Razorpay payment details", 400));
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return next(new appError("Payment not verified, please try again", 400));
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });

    if (!user.subscription) user.subscription = {};
    user.subscription.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};



export const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        
        if (!user) {
            return next(
                new appError(`Unauthorized, please login`, 500)
            )
        }

        if (user.role === `ADMIN`) {
            return next(
                new appError(`Admin cannot cancel the subscription`, 403)
            )
        }

        const subscriptionId = user.subscription.id;
        
        const subscription = await razorpay.subscriptions.cancel(
            subscriptionId 
        );

        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: `Subscription cancelled`
        });

    } catch (e) {
        return next(
            new appError(e.message, 500)
        )
    }
}

export const getAllPayments = async (req, res, next) => {
    try {
        const { count } = req.query;

        const subscriptions = await razorpay.subscriptions.all({
            count: count || 10,
        });

        res.status(200).json({
           success: true,
           message: `All payments`,
           payments: subscriptions
        })
    } catch (e) {
        return next(
            new appError(e.message, 500)
        )
    }
}
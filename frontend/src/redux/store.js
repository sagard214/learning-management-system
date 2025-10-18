import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import courseReducer from './slices/coureSlice';
import razorpayReducer from './slices/razorPaySlice';
import lectureReducer from './slices/lectureSlice';

const store = configureStore ({
    reducer: {
        auth: authReducer,
        course: courseReducer,
        razorpay: razorpayReducer,
        lecture: lectureReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    devTools: true
})

export default store;
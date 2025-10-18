import { Router } from "express";
import { addLectureToCourseByID, createCourse, deleteCourse, getAllCoures, getLecturesByCourseId, removeLectureFromCourse, updateCourse } from "../controller/coures.controller.js";
import { authorizedRoles, authorizedSubscriber, isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router
    .route(`/`)
    .get(getAllCoures)
    .post(
        // isLoggedIn,
        // authorizedRoles(`ADMIN`),
        upload.single(`thumbnail`),
        createCourse
    )
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeLectureFromCourse);

router
    .route(`/:courseId`)
    .get(
        isLoggedIn,
        // authorizedSubscriber,
        getLecturesByCourseId
    )
    .put(
        isLoggedIn,
        authorizedRoles(`ADMIN`),
        updateCourse
    )
    .delete(
        isLoggedIn,
        authorizedRoles(`ADMIN`),
        deleteCourse
    )
    .post(
        isLoggedIn,
        authorizedRoles(`ADMIN`),
        upload.single(`lecture`),
        addLectureToCourseByID
    )

export default router;
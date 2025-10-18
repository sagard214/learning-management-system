// import { fstat } from "fs";
import mongoose from "mongoose";
import Course from "../model/course.model.js";
import appError from "../utils/appError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

export const getAllCoures = async (req, res, next) =>{

    try {
        const courses = await Course.find({}).select(`-lectures`);
        res.status(200).json({
            success: true,
            message: `All courses`,
            courses,
        })
    } catch (e) {
        return next(
            new appError(e.message, 500)
        )
    }
}

export const getLecturesByCourseId = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const coures = await Course.findById(courseId);

        if (!coures) {
            return next(
                new appError(`Invalid coure Id`, 400)
            )
        }

        res.status(200).json({
            success: true,
            message: `course lectures fetched successfully`,
            lectures: coures.lectures
        })
    } catch (e) {
        return next(
            new appError(e.message, 500)
        )
    }
}

export const createCourse = async (req, res, next) => {
    try {
        const { title, description, category, createdBy } = req.body;

        if(!title || !description || !category || !createdBy) {
            return next(
                new appError(`All fields are required`, 400)
            )
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail: {
                public_id: `DUMMY`,
                secure_url: `DUMMY`
            },
        })

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: `LMS`
            });
            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`)
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: `Course created successfully`,
            course
        })

    } catch (e) {
        return next(
            new appError(e.message, 500)
        )
    }
};

export const updateCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: req.body
            },
            {
                runValidators: true
            }
        )

        if (!course) {
            return next(
                new appError(`Course does not exists`, 400)
            )
        }

        res.status(200).json({
            success: true,
            message: `Course updated successfully`,
            course
        })
    } catch (e) {
        return next(
            new appError(e.message, 500)
        )
    }
}

export const deleteCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if(!course){
            return next (
                new appError(`Course does not exist with given id `, 500)
            )
        }

        await Course.findByIdAndDelete(courseId);

        res.status(200).json({
            success: true,
            message: `Course deleted successfully`
        })
    } catch (e) {
        return next(
            new appError(e.message, 500)
        )
    }
}

export const addLectureToCourseByID = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { courseId } = req.params;

    if (!title || !description) {
      return next(new appError("All fields are required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return next(new appError("Invalid course ID format", 400));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new appError("Course with given ID does not exist!", 400));
    }

    const lectureData = { title, description, lecture: {} };

    if (req.file && req.file.path) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "LMS",
        resource_type: "video",
      });

      if (result) {
        lectureData.lecture.public_id = result.public_id;
        lectureData.lecture.secure_url = result.secure_url;
      }

      await fs.rm(`uploads/${req.file.filename}`);
    }

    course.lectures.push(lectureData);
    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture added successfully",
      course,
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};

export const removeLectureFromCourse = async (req, res, next) => {
  // Grabbing the courseId and lectureId from req.query
  const { courseId, lectureId } = req.query;

  console.log(courseId);

  // Checking if both courseId and lectureId are present
  if (!courseId) {
    return next(new appError('Course ID is required', 400));
  }

  if (!lectureId) {
    return next(new appError('Lecture ID is required', 400));
  }

  // Find the course uding the courseId
  const course = await Course.findById(courseId);

  // If no course send custom message
  if (!course) {
    return next(new appError('Invalid ID or Course does not exist.', 404));
  }

  // Find the index of the lecture using the lectureId
  const lectureIndex = course.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId.toString()
  );

  // If returned index is -1 then send error as mentioned below
  if (lectureIndex === -1) {
    return next(new appError('Lecture does not exist.', 404));
  }

  // Delete the lecture from cloudinary
  await cloudinary.v2.uploader.destroy(
    course.lectures[lectureIndex].lecture.public_id,
    {
      resource_type: 'video',
    }
  );

  // Remove the lecture from the array
  course.lectures.splice(lectureIndex, 1);

  // update the number of lectures based on lectres array length
  course.numberOfLectures = course.lectures.length;

  // Save the course object
  await course.save();

  // Return response
  res.status(200).json({
    success: true,
    message: 'Course lecture removed successfully',
  });
};


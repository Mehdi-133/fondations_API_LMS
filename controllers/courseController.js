const Course = require("../models/Course");

const getCourses = async (req, res, next) => {
    try {
        const { category, level, keyword, sortBy } = req.query;

        const filter = {
            status: "published"
        };

        if (category) {
            filter.category = category;
        }

        if (level) {
            filter.level = level;
        }

        if (keyword) {
            filter.$or = [
                {
                    title: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
            ];
        }

        let sort = {
            createdAt: -1
        };

        if (sortBy === "publishedAt") {
            sort = {
                publishedAt: -1
            };
        }

        const courses = await Course.find(filter).sort(sort);

        res.status(200).json({
            count: courses.length,
            data: courses
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCourses
};
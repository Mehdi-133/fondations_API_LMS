const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const Module = require("../models/Module");

dotenv.config();

const courses = [
    {
        title: "JavaScript pour débutants",
        description: "Apprendre les bases de JavaScript.",
        objectives: [
            "Comprendre les variables",
            "Utiliser les fonctions",
            "Manipuler les tableaux"
        ],
        level: "beginner",
        category: "JavaScript",
        estimatedDuration: 20,
        status: "published",
        publishedAt: new Date()
    },

    {
        title: "Node.js avec Express",
        description: "Créer une API REST avec Node.js et Express.",
        objectives: [
            "Créer un serveur Express",
            "Créer des routes",
            "Manipuler les requêtes HTTP"
        ],
        level: "intermediate",
        category: "Backend",
        estimatedDuration: 30,
        status: "published",
        publishedAt: new Date()
    },

    {
        title: "MongoDB avancé",
        description: "Découvrir les fonctionnalités avancées de MongoDB.",
        objectives: [
            "Utiliser MongoDB",
            "Comprendre les requêtes",
            "Optimiser les données"
        ],
        level: "advanced",
        category: "Database",
        estimatedDuration: 40,
        status: "draft"
    }
];

const seed = async () => {
    try {
        await connectDB();

        await Course.deleteMany();
        await Module.deleteMany();

        const createdCourses = await Course.insertMany(courses);

        const nodeCourse = createdCourses.find(
            course => course.title === "Node.js avec Express"
        );

        const javascriptCourse = createdCourses.find(
            course => course.title === "JavaScript pour débutants"
        );

        const modules = [
            {
                course: nodeCourse._id,
                title: "Introduction à Node.js",
                description: "Découvrir Node.js et son fonctionnement.",
                order: 1,
                estimatedDuration: 10,
                status: "published"
            },
            {
                course: nodeCourse._id,
                title: "Créer un serveur Express",
                description: "Créer un serveur avec Express.",
                order: 2,
                estimatedDuration: 15,
                status: "published"
            },
            {
                course: nodeCourse._id,
                title: "Créer des routes",
                description: "Créer et organiser les routes Express.",
                order: 3,
                estimatedDuration: 15,
                status: "published"
            },
            {
                course: javascriptCourse._id,
                title: "Les variables JavaScript",
                description: "Comprendre les variables en JavaScript.",
                order: 1,
                estimatedDuration: 10,
                status: "published"
            }
        ];

        await Module.insertMany(modules);

        console.log("Courses and modules seeded successfully");

        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error.message);

        process.exit(1);
    }
};

seed();
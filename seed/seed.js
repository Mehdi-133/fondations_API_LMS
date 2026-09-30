const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Course = require("../models/Course");

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

        await Course.insertMany(courses);

        console.log("Courses seeded successfully");

        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error.message);

        process.exit(1);
    }
};

seed();
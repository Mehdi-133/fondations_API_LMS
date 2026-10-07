const bcrypt = require("bcrypt");
const User = require("../models/User");

const SALT_ROUNDS = 10;

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                status: 409,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await User.create({
            email,
            password: hashedPassword,
            role: "learner"
        });

        return res.status(201).json({
            status: 201,
            message: "Account created successfully",
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register
};

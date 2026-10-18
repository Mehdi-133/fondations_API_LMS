
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcrypt");



describe("Role Authorization", () => {
    //verifier qu'un learner ne peut pas accéder aux routes trainer.
    test("should return 403 when learner accesses trainer route", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: "learner@test.com",
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
    });

    //verifier qu'un trainer peut accéder aux routes trainer.
    test("should allow trainer to access trainer route", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: "kordi@example.com",
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });

    // verifier qu'un admin ne peut pas accéder à une route réservée au trainer.
    test("should return 403 when admin accesses trainer route", async () => {
        const email = `admin-test-${Date.now()}@example.com`;
        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: "Admin Test",
            email,
            password: hashedPassword,
            role: "admin",
            status: "active"
        });

        try {
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email, password });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.data.token;

            const response = await request(app)
                .get("/api/trainer/courses")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(403);
        } finally {
            await User.deleteOne({ _id: user._id });
        }
    });



});

const request = require("supertest");
const app = require("../app");



describe("Authentcation", () => {



    //verifie l acces sans token

    test('should return 401 when no token is provided', async () => {
        const response = await request(app).get("/api/trainer/courses");

        expect(response.statusCode).toBe(401);

    });


    // verifie le rejet d'un token invalide 
    test("should return 401 when token is invalid", async () => {
        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", "Bearer invalid-token");

        expect(response.statusCode).toBe(401);
    });


    //verifier q'un lerner ne peut pas acceder aux route trainer
    test("should return 403 when learner accesses trainer route", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: "learner@test.com",
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const learnerToken = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", `Bearer ${learnerToken}`);

        expect(response.statusCode).toBe(403);
    });



    //verifier le rejet d'un mot de passe incorrect
    test("should return 401 when login credentials are invalid", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "learner@test.com",
                password: "WrongPassword123"
            });

        expect(response.statusCode).toBe(401);
    });


    //verifier le rejet de données d'inscription invalides
    test("should return 400 when registration data is invalid" , async()=>{
        const response = await request(app)
        .post("/api/auth/register")
        .send({
            email: "invalid-email",
            password: "123"
        });

    expect(response.statusCode).toBe(400);
    });




});



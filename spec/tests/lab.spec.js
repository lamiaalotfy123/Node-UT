const request = require("supertest");
const app = require("../..");
const { clearDatabase } = require("../../db.connection");

const req = request(app);
fdescribe("lab testing:", () => {
    let user, user3, user2, Todo, token, token2, id;
    beforeAll(async() => {
        user = { name: "lamiaa", email: "lamiaa@gmail.com", password: "33rd" };
        user2 = { name: "nancy", email: "nancy@gmail.com", password: "12ffg" };
        user3 = { name: "mohamed", email: "mahmoud@gmail.com", password: "ty554" };
        Todo = { title: "Test Todo" };
        await req.post("/user/signup").send(user);
        await req.post("/user/signup").send(user2);
        token = (
            await req
            .post("/user/login")
            .send({ email: user.email, password: user.password })
        ).body.data;
        token2 = (
            await req
            .post("/user/login")
            .send({ email: user2.email, password: user2.password })
        ).body.data;

        const TodoRes = await req
            .post("/todo")
            .send({...Todo, userId: user._id })
            .set({ authorization: token }); //headers

        id = TodoRes.body.data._id;
    });

    describe("users routes:", () => {
        // Note: user name must be sent in req query not req params
        it("req to get(/user/search) ,expect to get the correct user with his name", async() => {
            let res = await req.get(`/user/search?name=${user.name}`);
            expect(res.status).toBe(200);
            expect(res.body.data.name).toEqual(user.name);
        });
        it("req to get(/user/search) with invalid name ,expect res status and res message to be as expected", async() => {
            let res = await req.get(`/user/search?name=koko`);
            expect(res.status).toBe(200);
            expect(res.body.message).toContain("There is no user with name:");
        });
    });

    describe("Todos routes:", () => {
        it("req to patch( /Todo/) with id only ,expect res status and res message to be as expected", async() => {
            const res = await req
                .patch(`/Todo/${Todo._id}`)
                .set({ authorization: token });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("must provide title and id to edit Todo");
        });
        it("req to patch( /Todo/) with id and title ,expect res status and res to be as expected", async() => {
            const NewTitle = "Updated Todo Title";
            const res = await req
                .patch(`/Todo/${id}`)
                .send({ title: updatedTitle })
                .set({ authorization: token });
            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe(NewTitle);
        });

        it("req to get( /Todo/user) ,expect to get all user's Todos", async() => {
            const res = await req.get(`/Todo/user`).set({ authorization: token });
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveSize(1);
        });
        it("req to get( /Todo/user) ,expect to not get any Todos for user hasn't any Todo", async() => {
            const res = await req.get(`/Todo/user`).set({
                authorization: token2,
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toContain("Couldn't find any Todos for");
        });
    });

    afterAll(async() => {
        await clearDatabase();
    });
});
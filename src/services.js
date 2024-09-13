const express = require("express");
const path = require("path");
const collection = require("./mongodb");
const session = require("express-session");

const app = express();

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.static("public"));

// Home Route
app.get("/", (req, res) => {
    res.render("index", { user: req.session.user });
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password,
        };

        const existingUser = await collection.findOne({ name: data.name });
        if (existingUser) {
            res.send("User already exists.");
        } else {
            // Insert the new user into the collection
            await collection.insertMany(data); // Change to insertMany for a single document

            // Store user info in session
            req.session.user = { name: data.name };

            // Redirect to the user's page
            res.redirect(`/${data.name}`);
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred during sign-up");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("User not found");
        }

        if (req.body.password === check.password) {
            // Store user info in session
            req.session.user = { name: req.body.username };
            res.redirect(`/${req.body.username}`);
        } else {
            res.send("Incorrect password");
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred during login");
    }
});

function isLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    }
    // Redirect to login if user is not logged in
    res.redirect('/login');
}

app.get("/services", (req, res) => {
    res.render("services")
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on PORT ${port}`);
});

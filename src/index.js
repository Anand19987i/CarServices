const express = require("express");
const collection = require("./mongodb"); // Assuming this is your user collection
const session = require("express-session");
const Appointment = require("./config"); // This should be your appointment model
require("dotenv").config();

const app = express();

// Middleware for session handling
app.use(session({
    secret: 'your_secret_key', // Use environment variable for production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false} // Secure cookies only in production
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.static("public"));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect("/login");
};

// Route handlers
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
            return res.send("User already exists.");
        } else {
            await collection.insertOne(data); // Changed to insertOne
            req.session.user = { name: data.name };

            req.session.save((err) => {
                if (err) return res.send("An error occurred while saving session.");
                return res.redirect("/");
            });
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
        const user = await collection.findOne({ name: req.body.username });
        if (!user) {
            return res.send("User not found");
        }

        if (req.body.password === user.password) {
            req.session.user = { name: req.body.username };

            req.session.save((err) => {
                if (err) return res.send("An error occurred while saving session.");
                return res.redirect("/");
            });
        } else {
            return res.send("Incorrect password");
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred during login");
    }
});

app.post("/appointment", isAuthenticated, async (req, res) => {
    try {
        const newAppointment = {
            name: req.body.username, // Ensure this matches your form input
            email: req.body.email,
            mobile_no: req.body.mobile_no,
            service: req.body.service,
            time: req.body.time,
            days: req.body.days,
        };

        const appointment = new Appointment(newAppointment); 
        await appointment.save(); 

        res.render("confirm", {
            service: req.body.service,
            time: req.body.time,
            days: req.body.days,
            name: req.body.username,
            message: "Your appointment has been successfully booked!"
        });
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).send("An error occurred while booking the appointment.");
    }
});

app.get("/services", isAuthenticated, (req, res) => {
    res.render("services");
});

app.get("/appointment", isAuthenticated, (req, res) => {
    res.render("appointment");
});

app.get("/confirm", isAuthenticated, (req, res) => {
    res.render("confirm");
});

// Export the app for Vercel
module.exports = app;

// Vercel handles the port, so you don't need to listen on a specific port

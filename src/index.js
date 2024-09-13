const express = require("express"); 
const collection = require("./mongodb"); // Assuming this is your user collection
const session = require("express-session");
const Appointment = require("./config"); // This should be your appointment model
require("dotenv").config();

const app = express();

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.static("public"));

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect("/login");
};

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
            await collection.insertMany(data); // Use insertOne instead of insertMany
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
            service: req.body.service, // Ensure this matches the enum values in the schema
            time: req.body.time,
            days: req.body.days, // Ensure this matches the enum values in the schema
        };

        // Create a new appointment instance
        const appointment = new Appointment(newAppointment); 
        await appointment.save(); // Save the instance

        // Render the confirmation page with appointment details
        res.render("confirm", {
            service: req.body.service,
            time: req.body.time,
            days: req.body.days,
            name: req.body.username, // Ensure you pass the correct name
            message: "Your appointment has been successfully booked!" // Optional confirmation message
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

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on PORT ${port}`);
});

const express = require("express");
const { User, Appointment } = require("./mongodb"); // Import User and Appointment models
const session = require("express-session");
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

        const existingUser = await User.findOne({ name: data.name }); // Use User model
        if (existingUser) {
            return res.send("User already exists.");
        } else {
            await User.create(data); // Use create instead of insertMany
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
        const user = await User.findOne({ name: req.body.username }); // Use User model
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
        // Create a new appointment object from the request body
        const newAppointment = {
            username: req.body.username, // Ensure this is the correct field name
            email: req.body.email,
            mobile_no: req.body.mobile_no,
            services: req.body.services, 
            time: req.body.time,
            days: req.body.days,
        };
        console.log('Received data:', req.body); 


        const appointment = new Appointment(newAppointment);
        await appointment.save(); 

        res.redirect("/confirm")

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).send("An error occurred while booking the appointment.");
    }
});


app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.send("An error occurred while logging out.");
        }
        res.redirect("/");
    });
});

app.get("/about", (req, res) => {
    res.render("about",  { user: req.session.user });
})

app.get("/services", isAuthenticated, (req, res) => {
    res.render("services", { user: req.session.user });
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

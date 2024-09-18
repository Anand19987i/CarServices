const express = require("express");
const { User, Appointment, Admin } = require("./mongodb"); // Import User and Appointment models
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
    if (req.session.user && req.session.user.role === 'user') {
        return next();
    }
    res.redirect("/login");
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect("/admin-login");
}

app.post("/admin-login", async (req, res) => {
    try {
        const admin = await Admin.findOne({ adminName: req.body.username });
        if (!admin) {
            return res.send("Admin not found");
        }

        if (req.body.password === admin.adminPassword) {
            req.session.user = { adminName: req.body.username, role : 'admin' };

            req.session.save((err) => {
                if (err) return res.send("An error occurred while saving the session.");
                return res.redirect("/admin");
            });
        } else {
            return res.send("<h1>Incorrect password</h1>");
        }
    } catch (err) {
        console.log(err);
        return res.send("An error occurred during login.");
    }
});

app.get("/admin", isAdmin, async (req, res) => {
    try {
        const totalAppointments = await Appointment.countDocuments();
        const recentAppointments = await Appointment.find().sort({ time: -1 }).limit(10);

        res.render("admin", {
            totalAppointments,
            recentAppointments
        });
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        res.status(500).send("Error loading admin dashboard.");
    }
});



app.delete('/delete-appointment/:id', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const result = await Appointment.findByIdAndDelete(appointmentId);

        if (!result) {
            return res.status(404).send({ message: 'Appointment not found' });
        }
        res.send({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).send({ message: 'Server error' });
    }
});



app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ name: req.body.username }); // Use User model
        if (!user) {
            return res.send("User not found");
        }

        if (req.body.password === user.password) {
            req.session.user = { name: req.body.username, role : 'user' };

            req.session.save((err) => {
                if (err) return res.send("An error occurred while saving session.");
                return res.redirect("/");
            });
        } else {
            return res.send("<h1>Incorrect password</h1>");
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred during login");
    }
});

app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password,
        };

        const existingUser = await User.findOne({ name: data.name }); // Use User model
        if (existingUser) {
            return res.send("<h1>User already exists.</h1>");
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

app.get("/Logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.send("An error occurred while logging out.");
        }
        res.redirect("/admin-login");
    });
});

app.get("/", (req, res) => {
    res.render("index", { user: req.session.user });
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/about", (req, res) => {
    res.render("about", { user: req.session.user });
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

app.get("/admin-login", (req, res) => {
    res.render("admin-login");
})

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on PORT ${port}`);
});

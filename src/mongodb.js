const mongoose = require("mongoose");

// Replace <password> with your actual password
const mongoURI = "mongodb+srv://anandpandey1765:AYv5hDWMmvcJ4Ziz@carservicesdb.iijjd.mongodb.net/?retryWrites=true&w=majority&appName=CarServicesDB";

mongoose.connect(mongoURI)
.then(() => {
    console.log("MongoDB connected");
})
.catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
});

// Define the User schema
const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

// Create the User model
const User = mongoose.model("User", LogInSchema);

// Define the Appointment schema
const AppointmentSchema = new mongoose.Schema({
    username: {
        type: String, // For the name field
        required: true,
        minlength: 3, // Minimum length as per your form
    },
    email: {
        type: String, // For the email field
        required: true,
        match: /.+\@.+\..+/, // Regex for validating email format
    },
    mobile_no: {
        type: String, // Change to String to accommodate different phone number formats
        required: true,
    },
     services: {
        type: [String], // Array of strings for multiple selected services
        required: true,
    },
     time: {
        type: String, // Time as a string (e.g., "09:00") to match input type="time"
        required: true,
    },
    days: {
        type: String, // For the days field
        enum: ["monday", "wednesday", "friday"], // Restricting to specific days
        required: true,
    }
});

// Create the Appointment model
const Appointment = mongoose.model("Appointment", AppointmentSchema);


// Export both models
module.exports = { User, Appointment };

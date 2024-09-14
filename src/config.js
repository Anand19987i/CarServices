// db.js or mongodb.js
const mongoose = require("mongoose");
require("dotenv").config();

// Use the MongoDB URI from the environment variable or default to local connection
const mongoURI = "mongodb+srv://anandpandey1765:AYv5hDWMmvcJ4Ziz@carservicesdb.iijjd.mongodb.net/?retryWrites=true&w=majority&appName=CarServicesDB";

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1); // Exit the application on connection failure
    }
};

// Define Appointment Schema
const AppointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile_no: {
        type: String,
        required: true,
    },
    service: {
        type: String,
        required: true,
        enum: ['air_filter', 'car_washing', 'brakes_inspection', 'spark_plugs', 'tire_rotation', 'full_service'],
    },
    time: {
        type: String,
        required: true,
    },
    days: {
        type: String,
        required: true,
        enum: ['monday', 'wednesday', 'friday'],
    },
});

// Create Appointment Model
const Appointment = mongoose.model("Appointment", AppointmentSchema); // Model name in singular form

// Export the connection function and the Appointment model
module.exports = { connectDB, Appointment };

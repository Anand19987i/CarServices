const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/Login", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("MongoDB connected");
})
.catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
});

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
module.exports = Appointment;

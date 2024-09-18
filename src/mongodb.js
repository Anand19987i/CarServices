const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://anandpandey1765:AYv5hDWMmvcJ4Ziz@carservicesdb.iijjd.mongodb.net/?retryWrites=true&w=majority&appName=CarServicesDB";

mongoose.connect(mongoURI)
.then(() => {
    console.log("MongoDB connected");
})
.catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
});

const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength : 3,
    },
    password: {
        type: String,
        required: true,
    }
});
const User = mongoose.model("User", LogInSchema);

const AppointmentSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true,
        minlength: 3, 
    },
    email: {
        type: String, 
        required: true,
        match: /.+\@.+\..+/, 
    },
    mobile_no: {
        type: String,
        required: true,
    },
     services: {
        type: [String],
        required: true,
    },
     time: {
        type: String, 
        required: true,
    },
    days: {
        type: String, 
        enum: ["monday", "wednesday", "friday"],
        required: true,
    }
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

const AdminSchema = new mongoose.Schema({
    adminName : {
        type : String,
        required : true,
        minlength : 3,
    },
    adminPassword : {
        type : String,
        required : true,
        minlength: 3,
    }
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = { User, Appointment, Admin };

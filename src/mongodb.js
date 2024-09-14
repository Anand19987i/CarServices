const mongoose = require("mongoose");

// Replace <Momdad> with your actual password
const mongoURI = "mongodb+srv://anandpandey1765:AYv5hDWMmvcJ4Ziz@carservicesdb.iijjd.mongodb.net/?retryWrites=true&w=majority&appName=CarServicesDB";

mongoose.connect(mongoURI)
.then(() => {
    console.log("MongoDB connected");
})
.catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
});

// Define the schema
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

// Create the model
const Collection1 = mongoose.model("Collection1", LogInSchema);

// Export the model
module.exports = Collection1;

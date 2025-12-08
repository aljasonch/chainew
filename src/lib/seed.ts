import bcrypt from "bcryptjs";
import dbConnect from "./db";
import User from "../models/User";

async function seed() {
    console.log("Connecting to database...");
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
        console.log("Admin user already exists");
        return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 12);

    await User.create({
        email: "admin@example.com",
        name: "Admin User",
        passwordHash,
        role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
}

seed()
    .then(() => {
        console.log("Seed completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    });

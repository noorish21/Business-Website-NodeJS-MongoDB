const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Serve static files (HTML, CSS, images, JS)
app.use(express.static(path.join(__dirname, "public")));

// ✅ MongoDB connection
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => console.log("✅ MongoDB connected"));
db.on("error", (err) => console.error("❌ MongoDB error:", err));

// ✅ Schema & Model
const userSchema = new mongoose.Schema({
  Name: String,
  phone: String,
  email: String,
  address: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// ✅ Routes
// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Registration page
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Registration
app.post("/register", async (req, res) => {
  try {
    const { Name, phone, email, address, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("⚠️ User already exists! Try logging in.");
    }

    const newUser = new User({ Name, phone, email, address, password });
    await newUser.save();

    // ✅ Redirect to login after registration
    res.redirect("/login");
  } catch (err) {
    res.status(400).send("❌ Error registering user: " + err.message);
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (user) {
      console.log(`🎉 ${user.Name} logged in successfully.`);
      // ✅ Redirect back to homepage after login success
      return res.redirect("/");
    } else {
      res.send("❌ Invalid email or password!");
    }
  } catch (err) {
    res.status(400).send("❌ Error logging in: " + err.message);
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});

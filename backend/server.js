const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set');
  process.exit(1);
}

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/faculties', require('./routes/facultyRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

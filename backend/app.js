const dotenv = require("dotenv");
dotenv.config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const connectDB = require("./config/db");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

var app = express();
app.set("trust proxy", 1);

connectDB();

const allowedStaticOrigins = new Set([
  "https://seva-ai-98f1.onrender.com",
  "http://localhost:5000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "ionic://localhost",
]);

if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => allowedStaticOrigins.add(o));
}

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Mobile WebView / native clients / curl
  if (allowedStaticOrigins.has(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)) return true;
  // Allow localhost, emulator (10.0.2.2), and local Wi-Fi LAN origins for dev/mobile
  return /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
    origin
  );
};

app.use(express.json());
app.use(
  cors((req, callback) => {
    const origin = req.header("Origin");
    const host = req.get("host");
    const isSameOrigin =
      origin &&
      host &&
      (origin === `https://${host}` || origin === `http://${host}`);

    if (!origin || isSameOrigin || isAllowedOrigin(origin)) {
      return callback(null, {
        origin: true,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      });
    }
    return callback(null, { origin: false });
  })
); // React frontend & Capacitor Android app
if (process.env.NODE_ENV === "development") app.use(logger("dev"));

// Sessions
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "hackathon_secret",
  resave: false,
  saveUninitialized: false,
  name: "connect.sid", // Explicitly set the session name
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    httpOnly: true, // Prevent XSS attacks
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site requests in production
  },
};

if (process.env.MONGO_URI) {
  sessionOptions.store = MongoStore.create({ mongoUrl: process.env.MONGO_URI });
} else {
  console.warn("⚠️ WARNING: MONGO_URI is not set. Falling back to default in-memory session store.");
}

app.use(session(sessionOptions));

require("./utils/eventPriorityUpdater");

// Passport
require("./config/passport")(passport);

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "SevaAI",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
// app.use("/auth", authRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", complaintRoutes);
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/users", usersRouter);
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));

const hodRoutes = require("./routes/hodRoutes");
app.use("/api/hod", hodRoutes);

// catch 404 and forward to error handler
// Serve React app for any other unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

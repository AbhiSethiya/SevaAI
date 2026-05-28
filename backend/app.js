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

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5000", "http://localhost:5173"],
    credentials: true,
  })
); // React frontend
if (process.env.NODE_ENV === "development") app.use(logger("dev"));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "hackathon_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    name: "connect.sid", // Explicitly set the session name
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent XSS attacks
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site requests in production
    },
  })
);

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

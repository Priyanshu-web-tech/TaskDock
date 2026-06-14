const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const {
  methodNotAllowed,
  genericErrorHandler,
} = require("./app/error-handler/error");

const app = express();
const env = process.env.NODE_ENV || "development";
const configs = require("./app/config/config")[env];
const morganFormat =
  ":method :url :status :response-time ms | " +
  ':date[iso] | IP=:remote-addr | UA=":user-agent"\n';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"] },
    },
    referrerPolicy: { policy: "no-referrer" },
  }),
);
app.disable("x-powered-by");
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || configs.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "text/plain" }));

app.use(morgan(morganFormat));

app.get("/health", (req, res) => res.send("Health check OK"));

// Error handling
app.use(methodNotAllowed);
app.use(genericErrorHandler);

module.exports = app;

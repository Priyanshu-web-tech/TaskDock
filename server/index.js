const http = require("http");
const { sequelize } = require("./app/models/index");
const app = require("./app");

http.createServer(app).listen(process.env.PORT, () => {
  console.info(`Server up successfully - port: ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) =>
  console.error("Unhandled rejection:", err.message),
);

process.on("SIGTERM", () => {
  sequelize.close(() => {
    console.log("Closing database connection.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  sequelize.close(() => {
    console.log("Closing database connection.");
    process.exit(0);
  });
});

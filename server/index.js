require("dotenv").config();
const app = require("./app");

app.listen(process.env.PORT, () => {
  console.info(`Server up successfully - port: ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) =>
  console.error("Unhandled rejection:", err.message),
);

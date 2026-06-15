const app = require("express")();

app.use("/auth", require("./auth"));
app.use("/tasks", require("./task"));

module.exports = app;

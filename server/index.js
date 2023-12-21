const path = require("path");
require("dotenv").config({
  path: process.env.STORAGE_DIR
    ? `${path.join(process.env.STORAGE_DIR, ".env")}`
    : `${path.join(__dirname, ".env")}`,
});

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { systemEndpoints } = require("./endpoints/system");
const { workspaceEndpoints } = require("./endpoints/workspaces");
const { chatEndpoints } = require("./endpoints/chat");
const { adminEndpoints } = require("./endpoints/admin");
const { inviteEndpoints } = require("./endpoints/invite");
const { utilEndpoints } = require("./endpoints/utils");
const { Telemetry } = require("./models/telemetry");
const { developerEndpoints } = require("./endpoints/api");
const setupTelemetry = require("./utils/telemetry");
const { extensionEndpoints } = require("./endpoints/extensions");
const app = express();
const apiRouter = express.Router();
const FILE_LIMIT = "3GB";

app.use(cors({ origin: true }));
app.use(bodyParser.text({ limit: FILE_LIMIT }));
app.use(bodyParser.json({ limit: FILE_LIMIT }));
app.use(
  bodyParser.urlencoded({
    limit: FILE_LIMIT,
    extended: true,
  })
);
app.use("/api", apiRouter);
systemEndpoints(apiRouter);
extensionEndpoints(apiRouter);
workspaceEndpoints(apiRouter);
chatEndpoints(apiRouter);
adminEndpoints(apiRouter);
inviteEndpoints(apiRouter);
utilEndpoints(apiRouter);
developerEndpoints(app, apiRouter);

app.all("*", function (_, response) {
  response.sendStatus(404);
});

app
  .listen(process.env.SERVER_PORT || 3001, async () => {
    await setupTelemetry();
    console.log(
      `[${
        process.env.NODE_ENV || "development"
      }] AnythingLLM Standalone Backend listening on port ${
        process.env.SERVER_PORT || 3001
      }`
    );
  })
  .on("error", function (err) {
    process.once("SIGUSR2", function () {
      Telemetry.flush();
      console.error(err);
      process.kill(process.pid, "SIGUSR2");
    });
    process.on("SIGINT", function () {
      Telemetry.flush();
      console.log("SIGINT");
      process.kill(process.pid, "SIGINT");
    });
  });

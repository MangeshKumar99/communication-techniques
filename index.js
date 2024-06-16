const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static("communication-techniques"));

let initialData = "First hello...";
let clients = [];

// Route to serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Endpoint to handle client long polling requests
app.get("/poll", (req, res) => {
  if (req.query.param !== initialData) {
    res.status(200).send({ data: initialData });
  } else {
    clients.push(res);
  }
});

app.get("/sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  let intervalId = setInterval(() => {
    res.write(`data: ${new Date().toLocaleTimeString()}\n\n`);
  }, 5000);
  req.on("close", () => {
    clearInterval(intervalId);
  });
});

// Endpoint to receive new messages
app.get("/update", (req, res) => {
  initialData = req.query.param;
  while (clients.length) {
    clients.pop().status(200).send({ data: initialData });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

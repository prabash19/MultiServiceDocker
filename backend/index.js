const keys = require("./keys");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const redis = require("redis");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPassword,
});

pgClient.on("error", () => console.log("lost connection"));

pgClient
  .query("CREATE TABLE IF NOT EXISTS values (number INT)")
  .catch((err) => console.log("error in db ", err));

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

app.get("/", (req, res) => {
  res.send("hi");
});
app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", (req, res) => {
  const index = req.body.index;
  if (parseInt(index) > 40) {
    return res.send("index too higjt");
  }
  redisClient.hset("values", index, "nothing");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);
  res.send("done");
});

app.listen(5000, (err) => {
  console.log("backend running on 5000");
});

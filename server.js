import "./config.js";
import app from "./app.js";
import mongoose from "mongoose";

const port = process.env.PORT;
const dbConnection = process.env.DATABASE_URL.replace(
  "<password>",
  process.env.PASSWORD
);

mongoose.connect(dbConnection).then((conn) => {
  console.log(conn.connection, "Connextion Established");
});

app.listen(port, () => {
  console.log(`Listning to  ${port}..`);
});

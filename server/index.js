import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./src/app.js");
const { connectDb } = await import("./src/config/db.js");

const port = process.env.PORT || 5000;

await connectDb();

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

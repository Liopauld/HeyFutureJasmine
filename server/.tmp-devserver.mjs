// Boots the real API on an in-memory Mongo + runs the seed, so the UI can be
// exercised without Docker.
import { MongoMemoryServer } from "mongodb-memory-server";

const mem = await MongoMemoryServer.create();
process.env.MONGODB_URI = mem.getUri("heyfuturejasmine");
process.env.JWT_ACCESS_SECRET = "dev_access_secret";
process.env.JWT_REFRESH_SECRET = "dev_refresh_secret";
process.env.NODE_ENV = "development";
process.env.ENABLE_DEV_ROUTES = "true";
process.env.CLIENT_URLS = "http://localhost:5199";
delete process.env.REDIS_HOST;

const { connectDb } = await import("/Users/pauldominic/Personal Projects/HeyFutureJasmine!/server/src/config/db.js");
await connectDb();
await import("/Users/pauldominic/Personal Projects/HeyFutureJasmine!/server/src/scripts/seed.js");

const { default: app } = await import("/Users/pauldominic/Personal Projects/HeyFutureJasmine!/server/src/app.js");
app.listen(5000, () => console.log("dev API on 5000"));

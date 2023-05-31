import app from "./server.js";
import dotenv from "dotenv";
import mondodb from "mongodb";
import ReviewsDAO from "./dao2/reviewsDAO.js";
import RestaurantsDAO from "./dao2/restaurantsDAO.js";

dotenv.config();

const port = process.env.PORT || 5000;

// Connect to MongoDB
const MongoClient = mondodb.MongoClient;

MongoClient.connect(process.env.RESTREVIEWS_DB_URI, {
  // poolSize: 50,
  // wtimeoutMS: 2500,
  useNewUrlParser: true,
})
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    app.listen(port, async () => {
      await ReviewsDAO.injectDB(client);
      await RestaurantsDAO.injectDB(client);
      console.log(`listening on port ${port}`);
    });
  });

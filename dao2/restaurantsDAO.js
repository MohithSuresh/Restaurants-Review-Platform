import mongodb, { ListCollectionsCursor } from "mongodb";
let restaurants;

const { ObjectId } = mongodb;

export default class RestaurantsDAO {
  static async injectDB(connectedMongoClient) {
    if (restaurants) {
      return;
    }
    try {
      restaurants = await connectedMongoClient
        .db(process.env.RESTREVIEWS_NS)
        .collection("restaurants");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in restaurantsDAO: ${e}`
      );
    }
  }

  static async getRestaurants({
    filters = null,
    page = 0,
    restaurantsPerPage = 20,
  } = {}) {
    let query;
    // if (filters) {
    //   if ("name" in filters) {
    //     query[$text] = { $search: filters["name"] };
    //   }
    //   if ("cuisine" in filters) {
    //     query[cuisine] = { $eq: filters["cuisine"] };
    //   }
    //   if ("zipcode" in filters) {
    //     query["address.zipcode"] = { $eq: filters["zipcode"] };
    //   }
    // }

    if (filters) {
      if ("name" in filters) {
        query = { $text: { $search: filters["name"] } };
      } else if ("cuisine" in filters) {
        query = { cuisine: { $eq: filters["cuisine"] } };
      } else if ("zipcode" in filters) {
        query = { "address.zipcode": { $eq: filters["zipcode"] } };
      }
    }

    let ListOfRestaurants;

    try {
      const cursor = await restaurants
        .find(query)
        .limit(restaurantsPerPage)
        .skip(restaurantsPerPage * page);
      ListOfRestaurants = await cursor.toArray();
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { restaurantsList: [], totalNumRestaurants: 0 };
    }

    // const displayCursor = cursor.map((doc) => {
    //   return {
    //     ...doc,
    //     _id: doc._id.toString(),
    //   };
    // });

    const totalNumRestaurants = await restaurants.countDocuments(query);

    return { restaurantsList: ListOfRestaurants, totalNumRestaurants };
  }

  static async getRestaurantByID(id) {
    try {
      const pipeline = [
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "reviews",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$restaurant_id", "$$id"],
                  },
                },
              },
              {
                $sort: {
                  date: -1,
                },
              },
            ],
            as: "reviews",
          },
        },
        {
          $addFields: {
            reviews: "$reviews",
          },
        },
      ];
      return await restaurants.aggregate(pipeline).next();
    } catch (e) {
      console.error(`Something went wrong in getRestaurantByID: ${e}`);
      throw e;
    }
  }

  static async getCuisines() {
    let cuisines = [];
    try {
      cuisines = await restaurants.distinct("cuisine");
      return cuisines;
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`);
    }
  }
}

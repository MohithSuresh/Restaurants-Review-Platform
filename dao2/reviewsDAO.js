import mongodb from "mongodb";
let reviews;

const { ObjectId } = mongodb;

export default class ReviewsDAO {
  static async injectDB(connectedMongoClient) {
    if (reviews) {
      return;
    }
    try {
      reviews = await connectedMongoClient
        .db(process.env.RESTREVIEWS_NS)
        .collection("reviews");

      console.log("reviewsDAO.js: reviews = ", reviews);
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in reviewsDAO: ${e}`
      );
    }
  }

  static async getReviews({ filters, page, reviewsPerPage } = {}) {
    let query;
    if (filters) {
      if ("cuisine" in filters) {
        query = { cuisine: { $eq: filters["cuisine"] } };
      } else if ("zipcode" in filters) {
        query = { "address.zipcode": { $eq: filters["zipcode"] } };
      } else if ("restaurant_id" in filters) {
        query = { restaurant_id: { $eq: filters["restaurant_id"] } };
      }
    }

    let cursor;

    try {
      cursor = await reviews
        .find(query)
        .limit(reviewsPerPage)
        .skip(reviewsPerPage * page)
        .toArray();
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { reviewsList: [], totalNumReviews: 0 };
    }

    const totalNumReviews = await reviews.countDocuments(query);

    return { reviewsList: cursor, totalNumReviews };
  }

  static async addReview(restaurantId, user, review, date) {
    try {
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date: date,
        text: review,
        restaurant_id: new ObjectId(restaurantId),
      };
      await reviews.insertOne(reviewDoc);
      // console.log("reviews", reviews);
      return reviews;
    } catch (e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }

  static async updateReview(reviewId, userId, text, date) {
    try {
      const updateResponse = await reviews.updateOne(
        { user_id: userId, _id: new ObjectId(reviewId) },
        { $set: { text: text, date: date } }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update review: ${e}`);
      return { error: e };
    }
  }

  static async deleteReview(reviewId, userId) {
    try {
      const deleteResponse = await reviews.deleteOne({
        _id: new ObjectId(reviewId),
        user_id: userId,
      });

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to delete review: ${e}`);
      return { error: e };
    }
  }
}

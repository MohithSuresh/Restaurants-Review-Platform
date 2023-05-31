import ReviewsDAO from "../../dao2/reviewsDAO.js";
import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

export default class ReviewsCtrl {
  static async apiGetReviews(req, res, next) {
    try {
      const reviewsPerPage = req.query.reviewsPerPage
        ? parseInt(req.query.reviewsPerPage, 10)
        : 20;
      const page = req.query.page ? parseInt(req.query.page, 10) : 0;

      let filters = {};
      if (req.query.restaurant_id) {
        filters.restaurant_id = req.query.restaurant_id;
      } else if (req.query.zipcode) {
        filters.zipcode = req.query.name;
      } else if (req.query.cuisine) {
        filters.cuisine = req.query.cuisine;
      }

      const { reviewsList, totalNumReviews } = await ReviewsDAO.getReviews({
        filters,
        page,
        reviewsPerPage,
      });

      let response = {
        reviews: reviewsList,
        page: page,
        filters: filters,
        entries_per_page: reviewsPerPage,
        total_results: totalNumReviews,
      };
      res.json(response);
    } catch (e) {
      console.log(`reviews api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiPostReview(req, res, next) {
    try {
      const restaurantId = req.body.restaurant_id;
      const review = req.body.text;
      const userInfo = {
        name: req.body.name,
        _id: req.body.user_id,
      };
      const date = new Date();

      const ReviewResponse = await ReviewsDAO.addReview(
        restaurantId,
        userInfo,
        review,
        date
      );
      console.log(req.body);
      console.log(restaurantId, userInfo, review, date);

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiUpdateReview(req, res, next) {
    try {
      const reviewId = req.body.review_id;
      const text = req.body.text;
      const date = new Date();

      const reviewResponse = await ReviewsDAO.updateReview(
        reviewId,
        req.body.user_id,
        text,
        date
      );

      var { error } = reviewResponse;
      if (error) {
        res.status(400).json({ error });
      }

      if (reviewResponse.modifiedCount === 0) {
        throw new Error(
          "unable to update review - user may not be original poster"
        );
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiDeleteReview(req, res, next) {
    try {
      const reviewId = req.body.review_id;
      const userId = req.body.user_id;
      console.log(reviewId);
      const reviewResponse = await ReviewsDAO.deleteReview(reviewId, userId);
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

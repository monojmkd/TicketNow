const router = require("express").Router();

const controller = require("../controllers/booking.controller");

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, role("customer"), controller.createBooking);

module.exports = router;

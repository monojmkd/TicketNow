const router = require("express").Router();

const controller = require("../controllers/event.controller");

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, role("organizer"), controller.createEvent);

router.put("/:id", auth, role("organizer"), controller.updateEvent);

router.get("/", controller.getEvents);

module.exports = router;

const router = require("express").Router();
const controller = require("../controllers/event.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { uploadImage } = require("../middleware/upload.middleware");

router.get("/", controller.getEvents);

router.post("/", auth, role("organizer"), uploadImage, controller.createEvent);
router.put(
  "/:id",
  auth,
  role("organizer"),
  uploadImage,
  controller.updateEvent,
);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  addOptions,
  getAllOptions,
  deleteOptionByField,
} = require("../controllers/optionController");

router.post("/add", addOptions);
router.get("/get", getAllOptions);
router.delete("/delete", deleteOptionByField);

module.exports = router;

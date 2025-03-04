const express = require("express");
const router = express.Router();
const percepteursController = require("../controllers/percepteursController");

router.get("/", percepteursController.getAllPercepteurs);
router.post("/", percepteursController.addPercepteur);
router.put("/:id/retirer", percepteursController.retirerPercepteur); // ✅ Route correcte pour retirer un percepteur
router.put("/:id/attaque", percepteursController.marquerPercepteurAttaque);
router.get("/actifs", percepteursController.getActivePercepteurs);

module.exports = router;
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const percepteursRoutes = require("./routes/percepteurs");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/percepteurs", percepteursRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

app.post("/percepteurs", (req, res) => {
    const { id_user, zone_pose, latitude, longitude, date_pose, sacochePods, coffre, coutSupplementaire } = req.body;

    if (!id_user || !zone_pose || latitude === undefined || longitude === undefined || !date_pose) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    console.log("📌 Données reçues :", req.body); // Debug

    const gain = -coutSupplementaire; // Déduit le coût des items

    db.query(
        "INSERT INTO percepteurs (id_user, zone_pose, latitude, longitude, date_pose, gain, sacoche_pods, coffre) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id_user, zone_pose, latitude, longitude, date_pose, gain, sacochePods, coffre],
        (err, result) => {
            if (err) {
                console.error("❌ Erreur MySQL :", err);
                return res.status(500).json({ error: "Erreur lors de l'ajout en base" });
            }
            res.json({ id: result.insertId, id_user, zone_pose, latitude, longitude, date_pose, gain, sacochePods, coffre });
        }
    );
});
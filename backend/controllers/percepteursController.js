const db = require("../db");
const { sendDiscordNotification } = require("../bot");

// 🔹 1. Récupérer tous les percepteurs
exports.getAllPercepteurs = (req, res) => {
    const query = `
        SELECT percepteurs.*, users.username, percepteurs.sacoche_pods, percepteurs.coffre, percepteurs.popo_price
        FROM percepteurs
                 JOIN users ON percepteurs.id_user = users.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Erreur lors de la récupération :", err);
            return res.status(500).json({ error: "Erreur de serveur" });
        }
        res.json(results);
    });
};

// 🔹 2. Ajouter un percepteur
exports.addPercepteur = (req, res) => {
    const {
        id_user,
        zone_pose,
        latitude,
        longitude,
        date_pose,
        gain,
        attaque,
        heure_attaque,
        sacoche_pods,
        coffre,
        popo_price
    } = req.body;

    db.query(
        `INSERT INTO percepteurs 
         (id_user, zone_pose, latitude, longitude, date_pose, gain, attaque, heure_attaque, sacoche_pods, coffre, popo_price) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id_user,
            zone_pose,
            latitude,
            longitude,
            date_pose,
            gain,
            attaque,
            heure_attaque,
            sacoche_pods ? 1 : 0,
            coffre ? 1 : 0,
            popo_price
        ],
        (err, result) => {
            if (err) {
                console.error("❌ Erreur lors de l'insertion :", err);
                return res.status(500).json({ error: "Erreur de serveur" });
            }

            // Notification Discord
            sendDiscordNotification({
                title: "📌 Nouveau percepteur posé !",
                description: `Le percepteur a été placé avec succès.`,
                color: 0x00ff00,
                fields: [
                    { name: "🌍 Zone", value: zone_pose, inline: true },
                    { name: "📍 Coordonnées", value: `[${latitude}, ${longitude}]`, inline: true },
                    { name: "💰 Prix de la popo", value: `${popo_price}`, inline: true },
                    { name: "🎒 Sacoche Pods", value: sacoche_pods ? "✅ Oui" : "❌ Non", inline: true },
                    { name: "📦 Coffre", value: coffre ? "✅ Oui" : "❌ Non", inline: true },
                ]
            });

            res.json({ message: "✅ Percepteur ajouté", id: result.insertId });
        }
    );
};

// 🔹 3. Marquer comme attaqué
exports.marquerPercepteurAttaque = (req, res) => {
    const percepteurId = req.params.id;
    const { heure_attaque } = req.body;

    db.query(
        "UPDATE percepteurs SET attaque = 1, heure_attaque = ? WHERE id = ?",
        [heure_attaque, percepteurId],
        (err) => {
            if (err) {
                console.error("❌ Erreur lors de la mise à jour d'attaque :", err);
                return res.status(500).json({ error: "Erreur de serveur" });
            }
            sendDiscordNotification(`⚠️ **Percepteur attaqué !** (ID: ${percepteurId}) à ${heure_attaque}`);
            res.json({ message: "Percepteur marqué comme attaqué", heure_attaque });
        }
    );
};

// controllers/percepteurs.js
exports.getActivePercepteurs = (req, res) => {
    const query = `
        SELECT percepteurs.*, users.username
        FROM percepteurs
        JOIN users ON percepteurs.id_user = users.id
        WHERE percepteurs.date_retrait IS NULL
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Erreur lors de la récupération des actifs :", err);
            return res.status(500).json({ error: "Erreur de serveur" });
        }
        res.json(results);
    });
};



// 🔹 4. Retirer un percepteur
exports.retirerPercepteur = (req, res) => {
    const { gain } = req.body;
    const percepteurId = req.params.id;

    db.query(
        `SELECT zone_pose, latitude, longitude, attaque, sacoche_pods, coffre, popo_price
         FROM percepteurs
         WHERE id = ?`,
        [percepteurId],
        (err, results) => {
            if (err) {
                console.error("❌ Erreur SQL lors de la récupération du percepteur :", err);
                return res.status(500).json({ error: "Erreur de serveur" });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Percepteur non trouvé" });
            }

            const percepteur = results[0];

            // Calcul des coûts perdus (popo + items)
            let totalCout = percepteur.popo_price || 0;
            if (percepteur.attaque) {
                if (percepteur.sacoche_pods === 1) totalCout += 180000;
                if (percepteur.coffre === 1) totalCout += 150000;
            }

            const gainFinal = gain - totalCout;
            const dateRetrait = new Date().toISOString().slice(0, 19).replace("T", " ");

            db.query(
                "UPDATE percepteurs SET gain = ?, date_retrait = ? WHERE id = ?",
                [gainFinal, dateRetrait, percepteurId],
                (err2) => {
                    if (err2) {
                        console.error("❌ Erreur SQL lors de la mise à jour :", err2);
                        return res.status(500).json({ error: "Erreur de serveur" });
                    }

                    // Notification Discord
                    sendDiscordNotification({
                        title: "✅ Percepteur retiré !",
                        description: `Le percepteur a été récupéré.`,
                        color: 0xffcc00,
                        fields: [
                            { name: "🌍 Zone", value: percepteur.zone_pose, inline: true },
                            { name: "📍 Coordonnées", value: `[${percepteur.latitude}, ${percepteur.longitude}]`, inline: true },
                            { name: "💰 Prix de la popo", value: `${percepteur.popo_price}`, inline: true },
                            { name: "🎒 Sacoche Pods", value: percepteur.sacoche_pods ? "✅ Oui" : "❌ Non", inline: true },
                            { name: "📦 Coffre", value: percepteur.coffre ? "✅ Oui" : "❌ Non", inline: true },
                            { name: "💵 Gain Réalisé", value: `${gainFinal}`, inline: false },
                        ]
                    });

                    res.json({
                        message: "Percepteur marqué comme retiré",
                        dateRetrait,
                        gainFinal
                    });
                }
            );
        }
    );
};
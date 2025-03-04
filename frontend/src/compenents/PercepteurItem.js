import { useState } from "react";

const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

const calculateDuration = (pose, retrait) => {
    if (!pose || !retrait) return "";

    const datePose = new Date(pose);
    const dateRetrait = new Date(retrait);
    const diffMs = dateRetrait - datePose;

    const heures = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${heures}h ${minutes}min`;
};

const PercepteurItem = ({ percepteur, onRetirer, onMarquerAttaque }) => {
    const [gain, setGain] = useState("");

    const handleRetirer = () => {
        if (!onRetirer) {
            console.error("❌ Erreur : `onRetirer` n'est pas défini !");
            return;
        }

        if (gain.trim() === "" || isNaN(gain)) {
            alert("Veuillez entrer un gain valide.");
            return;
        }

        onRetirer(percepteur.id, gain);
    };

    const handleAttaque = () => {
        if (!onMarquerAttaque) {
            console.error("❌ Erreur : `onMarquerAttaque` n'est pas défini !");
            return;
        }
        onMarquerAttaque(percepteur.id);
    };

    // ➡️ **Calcul du gain final**
    let gainFinal = percepteur.gain;
    let perte = 0;

    // 💥 Si le percepteur a été attaqué, on soustrait les objets (Sacoche Pods et Coffre)
    if (percepteur.attaque) {
        if (percepteur.sacoche_pods === 1) {
            perte += 180000;
        }
        if (percepteur.coffre === 1) {
            perte += 150000;
        }
        gainFinal -= perte;
    }

    return (
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-lg font-bold text-blue-300">{percepteur.username}</h2>

            <p className="text-gray-400">📍 <strong>{percepteur.zone_pose}</strong></p>
            <p className="text-gray-400">🌍 {percepteur.latitude}, {percepteur.longitude}</p>

            <p className="text-gray-300">⏳ <strong>Pose:</strong> {formatDate(percepteur.date_pose)}</p>

            {percepteur.date_retrait && (
                <p className="text-gray-300">
                    🔄 <strong>Retrait:</strong> {formatDate(percepteur.date_retrait)} ({calculateDuration(percepteur.date_pose, percepteur.date_retrait)})
                </p>
            )}

            {/* Affichage des options activées */}
            <div className="mt-2">
                {percepteur.sacoche_pods === 1 && <p className="text-yellow-400 font-semibold">🎒 Sacoche Pods</p>}
                {percepteur.coffre === 1 && <p className="text-orange-400 font-semibold">📦 Coffre</p>}
            </div>

            {/* ➡️ Affichage du gain ou de la perte */}
            {percepteur.date_retrait && (
                perte > 0 ? (
                    <p className="text-red-500 font-bold text-lg mt-2">
                        ❌ Perte : -{perte.toLocaleString()} Kamas
                    </p>
                ) : (
                    <p className="text-green-500 font-bold text-lg mt-2">
                        💰 Gain Final : {gainFinal.toLocaleString()} Kamas
                    </p>
                )
            )}

            {/* Boutons d'action */}
            <div className="mt-4 flex flex-col gap-2">
                {/* Bouton "Retirer" */}
                {!percepteur.date_retrait && !percepteur.attaque && (
                    <div>
                        <input
                            type="number"
                            placeholder="Entrez le gain"
                            value={gain}
                            onChange={(e) => setGain(e.target.value)}
                            className="w-full p-2 border rounded-md bg-gray-700 text-white"
                        />
                        <button
                            onClick={handleRetirer}
                            className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                        >
                            ✅ Retirer
                        </button>
                    </div>
                )}

                {/* Bouton "Marquer comme attaqué" (Uniquement si pas encore attaqué) */}
                {!percepteur.attaque && (
                    <button
                        onClick={handleAttaque}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                    >
                        ⚠️ Marquer comme attaqué
                    </button>
                )}
            </div>
        </div>
    );
};

export default PercepteurItem;
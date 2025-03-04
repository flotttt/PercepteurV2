"use client";
import { format, parseISO } from "date-fns";

const StatsPanel = ({ percepteurs }) => {
    const today = format(new Date(), "yyyy-MM-dd");

    // 🎯 Filtrer uniquement les percepteurs posés AUJOURD'HUI
    const percepteursDuJour = percepteurs.filter(
        (p) => format(parseISO(p.date_pose), "yyyy-MM-dd") === today
    );

    // 🎯 Filtrer uniquement les percepteurs retirés AUJOURD'HUI
    const percepteursRetires = percepteursDuJour.filter((p) => p.date_retrait && !p.attaque);
    const percepteursAttaques = percepteursDuJour.filter((p) => p.attaque);

    const totalGains = percepteursRetires.reduce((acc, p) => acc + p.gain, 0);

    const pertesItems = percepteursDuJour
        .filter((p) => p.date_retrait && p.attaque)
        .reduce((acc, p) => {
            let perte = 0;
            if (p.sacoche_pods) perte += 180000;
            if (p.coffre) perte += 150000;
            return acc + perte;
        }, 0);

    const totalPopo = percepteursDuJour.reduce((acc, p) => acc + (p.popo_price || 0), 0);
    const totalPertes = pertesItems + totalPopo;
    const gainNet = totalGains - totalPertes;

    const tauxReussite =
        percepteursDuJour.length > 0
            ? ((percepteursRetires.length / percepteursDuJour.length) * 100).toFixed(2)
            : 0;

    return (
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center">📊 Statistiques du Jour ({today})</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 🔹 Percepteurs */}
                <div className="bg-gray-800 p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">📍 Percepteurs posés</h3>
                    <p className="text-2xl font-bold">{percepteursDuJour.length}</p>
                </div>

                <div className="bg-gray-800 p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">🔄 Retirés</h3>
                    <p className="text-2xl font-bold">{percepteursRetires.length}</p>
                </div>

                <div className="bg-gray-800 p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">⚠️ Attaqués</h3>
                    <p className="text-2xl font-bold">{percepteursAttaques.length}</p>
                </div>

                {/* 🔹 Gains et Pertes */}
                <div className="bg-green-700 p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">💰 Gains du Jour</h3>
                    <p className="text-2xl font-bold">{totalGains.toLocaleString()} Kamas</p>
                </div>

                <div className="bg-red-700 p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">❌ Pertes (Objets & Popo)</h3>
                    <p className="text-2xl font-bold">-{totalPertes.toLocaleString()} Kamas</p>
                </div>

                {/* 🔹 Résultat final */}
                <div className={`p-5 rounded-lg shadow text-white ${gainNet >= 0 ? "bg-blue-600" : "bg-red-600"}`}>
                    <h3 className="text-lg font-semibold">💵 Gain Net</h3>
                    <p className="text-2xl font-bold">{gainNet.toLocaleString()} Kamas</p>
                </div>

                <div className="bg-purple-700 p-5 rounded-lg shadow col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold">🎯 Taux de réussite</h3>
                    <p className="text-2xl font-bold">{tauxReussite}%</p>
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;
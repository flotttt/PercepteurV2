"use client";
import { useState, useEffect } from "react";
import {
    BarChart, Bar, LineChart, Line, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { format, parseISO } from "date-fns";

export default function StatsGraphique({ percepteurs }) {
    const [statsParJour, setStatsParJour] = useState([]);
    const [globalStats, setGlobalStats] = useState({
        totalPercepteurs: 0,
        totalRetires: 0,
        totalAttaques: 0,
        totalGains: 0,
        totalPertes: 0,
        totalNet: 0
    });

    useEffect(() => {
        // ---------- 1) Logique de regroupement par jour ----------
        const stats = {};

        percepteurs.forEach((p) => {
            // Date de pose => popo
            const datePose = format(parseISO(p.date_pose), "yyyy-MM-dd");

            // Date de retrait => gains/pertes
            const dateRetrait = p.date_retrait
                ? format(parseISO(p.date_retrait), "yyyy-MM-dd")
                : null;

            // Init s'il n'existe pas
            if (!stats[datePose]) {
                stats[datePose] = {
                    date: datePose,
                    gains: 0,    // Gains sur percepteurs non attaqués retirés ce jour
                    itemCost: 0, // Coût sacoche/coffre si attaqué
                    popo: 0,     // Coût popo
                    net: 0       // Gains - (itemCost + popo)
                };
            }

            // + popo dans la date de pose
            stats[datePose].popo += (p.popo_price || 0);

            // Si percepteur retiré un autre jour => dateRetrait
            if (dateRetrait && dateRetrait !== datePose) {
                if (!stats[dateRetrait]) {
                    stats[dateRetrait] = {
                        date: dateRetrait,
                        gains: 0,
                        itemCost: 0,
                        popo: 0,
                        net: 0
                    };
                }
                // S'il n'est pas attaqué => Gains
                if (!p.attaque) {
                    stats[dateRetrait].gains += p.gain;
                } else {
                    let perteObjets = 0;
                    if (p.sacoche_pods) perteObjets += 180000;
                    if (p.coffre) perteObjets += 150000;
                    stats[dateRetrait].itemCost += perteObjets;
                }
            }
            // Retrait le même jour que la pose
            else if (dateRetrait && dateRetrait === datePose) {
                if (!p.attaque) {
                    stats[datePose].gains += p.gain;
                } else {
                    let perteObjets = 0;
                    if (p.sacoche_pods) perteObjets += 180000;
                    if (p.coffre) perteObjets += 150000;
                    stats[datePose].itemCost += perteObjets;
                }
            }
        });

        // Calcul du net = gains - (itemCost + popo)
        const statsArray = Object.values(stats).map((day) => {
            const net = day.gains - (day.itemCost + day.popo);
            return { ...day, net };
        });

        // Trier par date
        statsArray.sort((a, b) => (a.date < b.date ? -1 : 1));
        setStatsParJour(statsArray);

        // ---------- 2) Calcul des stats globales ----------
        // Gains => percepteur retiré non attaqué
        const totalGains = percepteurs
            .filter((p) => p.date_retrait && !p.attaque)
            .reduce((acc, p) => acc + p.gain, 0);

        // Pertes => si attaqué + items
        const totalItemCost = percepteurs
            .filter((p) => p.date_retrait && p.attaque)
            .reduce((acc, p) => {
                let perte = 0;
                if (p.sacoche_pods) perte += 180000;
                if (p.coffre) perte += 150000;
                return acc + perte;
            }, 0);

        // Popo => date de pose, donc pour tous
        const totalPopo = percepteurs.reduce(
            (acc, p) => acc + (p.popo_price || 0),
            0
        );

        const totalPertes = totalItemCost + totalPopo;

        setGlobalStats({
            totalPercepteurs: percepteurs.length,
            totalRetires: percepteurs.filter((p) => p.date_retrait).length,
            totalAttaques: percepteurs.filter((p) => p.attaque).length,
            totalGains,
            totalPertes,
            totalNet: totalGains - totalPertes
        });

    }, [percepteurs]);

    return (
        <div className="bg-gray-900 text-white p-8 rounded-xl shadow-xl mt-8 border border-gray-700">
            <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-400 drop-shadow-lg">
                📊 Stats Globales + Graphique (Gains, Pertes, Net)
            </h2>

            {/* 🔹 Panneau de stats globales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800 dark:text-gray-200">
                {/* Nombre total de percepteurs posés */}
                <div className="bg-gray-800 p-5 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-blue-400">📍 Total Percepteurs posés</h3>
                    <p className="text-3xl font-bold text-white">
                        {globalStats.totalPercepteurs.toLocaleString()}
                    </p>
                </div>

                {/* Retirés */}
                <div className="bg-gray-800 p-5 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-green-400">🔄 Retirés</h3>
                    <p className="text-3xl font-bold text-white">
                        {globalStats.totalRetires.toLocaleString()}
                    </p>
                </div>

                {/* Attaqués */}
                <div className="bg-gray-800 p-5 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-red-400">⚠️ Attaqués</h3>
                    <p className="text-3xl font-bold text-white">
                        {globalStats.totalAttaques.toLocaleString()}
                    </p>
                </div>

                {/* Gains totaux */}
                <div className="bg-green-800 p-5 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-green-200">💰 Gains totaux</h3>
                    <p className="text-3xl font-bold">
                        {globalStats.totalGains.toLocaleString()} Kamas
                    </p>
                </div>

                {/* Pertes totales (objets + popo) */}
                <div className="bg-red-800 p-5 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-red-200">❌ Pertes totales</h3>
                    <p className="text-3xl font-bold">
                        -{globalStats.totalPertes.toLocaleString()} Kamas
                    </p>
                </div>

                {/* Gain Net */}
                <div
                    className={`p-5 rounded-lg shadow text-white ${
                        globalStats.totalNet >= 0 ? "bg-blue-500" : "bg-red-500"
                    }`}
                >
                    <h3 className="text-lg font-semibold">💰 Gain Net</h3>
                    <p className="text-3xl font-bold">
                        {globalStats.totalNet.toLocaleString()} Kamas
                    </p>
                </div>
            </div>

            {/* 🔹 Graphique Gains, Pertes, Net par jour */}
            <div className="w-full h-80 mt-12 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-center mb-4 text-green-400">
                    📆 Gains, Pertes & Gain Net par Jour
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsParJour}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                        <XAxis dataKey="date" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip
                            wrapperStyle={{
                                backgroundColor: "#222",
                                borderRadius: "8px",
                                padding: "5px",
                                color: "#fff",
                            }}
                        />
                        <Legend />
                        {/* Gains sur percepteurs non attaqués */}
                        <Bar
                            dataKey="gains"
                            fill="#4CAF50"
                            name="Gains"
                            radius={[4, 4, 0, 0]}
                        />
                        {/* itemCost + popo => bar de Pertes */}
                        <Bar
                            dataKey={(day) => day.itemCost + day.popo}
                            fill="#F44336"
                            name="Pertes"
                            radius={[4, 4, 0, 0]}
                        />
                        {/* net => line */}
                        <Line
                            type="monotone"
                            dataKey="net"
                            stroke="#FFD700"
                            strokeWidth={3}
                            dot={false}
                            name="Gain Net"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
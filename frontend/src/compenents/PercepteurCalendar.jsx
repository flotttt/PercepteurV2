"use client";
import { useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

export default function PercepteurCalendar({ percepteurs }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [viewMode, setViewMode] = useState("mois"); // "jour", "semaine", "mois", "année"

    // 🎯 Grouper les percepteurs par date de retrait
    const percepteursByDate = percepteurs.reduce((acc, p) => {
        if (p.date_retrait) {
            const date = format(parseISO(p.date_retrait), "yyyy-MM-dd");
            if (!acc[date]) acc[date] = [];
            acc[date].push(p);
        }
        return acc;
    }, {});

    // 📅 Obtenir les périodes selon la vue sélectionnée
    const today = new Date();
    let timeIntervals = [];

    if (viewMode === "jour") {
        timeIntervals = eachDayOfInterval({ start: today, end: today });
    } else if (viewMode === "semaine") {
        timeIntervals = eachDayOfInterval({ start: startOfWeek(today), end: endOfWeek(today) });
    } else if (viewMode === "mois") {
        timeIntervals = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
    } else if (viewMode === "année") {
        timeIntervals = eachMonthOfInterval({ start: startOfYear(today), end: endOfYear(today) });
    }

    // 🖱️ Fonction pour ouvrir la modal avec les détails
    const openModal = (date) => {
        setSelectedDate(date);
        setModalData(percepteursByDate[date] || []);
    };

    return (
        <div className="mt-10 p-6 bg-black text-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">📆 Gains par {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</h2>

            {/* 🔽 Sélecteur de vue */}
            <div className="flex justify-center mb-4 space-x-4">
                {["jour", "semaine", "mois", "année"].map((mode) => (
                    <button
                        key={mode}
                        className={`px-4 py-2 rounded-lg ${viewMode === mode ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}
                        onClick={() => setViewMode(mode)}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
            </div>

            {/* 📅 Affichage du calendrier */}
            <div className={`grid ${viewMode === "année" ? "grid-cols-4" : "grid-cols-7"} gap-2 text-center`}>
                {timeIntervals.map((date) => {
                    const formattedDate = format(date, viewMode === "année" ? "yyyy-MM" : "yyyy-MM-dd");
                    const percepteursDuJour = percepteursByDate[formattedDate] || [];
                    const totalGain = percepteursDuJour.reduce((sum, p) => sum + p.gain, 0);

                    return (
                        <div
                            key={formattedDate}
                            className="p-3 border rounded-lg cursor-pointer transition hover:bg-gray-800"
                            onClick={() => openModal(formattedDate)}
                        >
                            <span className="block font-semibold">{format(date, viewMode === "année" ? "MMM yyyy" : "dd")}</span>
                            {totalGain > 0 ? (
                                <span className="block text-green-400 font-bold">{totalGain.toLocaleString()} 💰</span>
                            ) : (
                                <span className="block text-gray-500">-</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 🏆 Modal d'affichage des détails */}
            {selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-6">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md text-white">
                        <h3 className="text-lg font-bold text-center mb-4">📆 Détails du {selectedDate}</h3>
                        {modalData.length > 0 ? (
                            modalData.map((p, index) => (
                                <div key={index} className="p-3 border-b border-gray-700">
                                    <p><strong>📍 Zone:</strong> {p.zone_pose}</p>
                                    <p><strong>💰 Gain:</strong> {p.gain.toLocaleString()} Kamas</p>
                                    <p><strong>🎒 Items:</strong> {p.sacoche_pods ? "✅ Sacoche Pods" : "❌"} {p.coffre ? "📦 Coffre" : ""}</p>
                                    <p><strong>⏰ Heure de Pose:</strong> {p.date_pose ? format(parseISO(p.date_pose), "HH:mm") : "Non dispo"}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400">Aucun percepteur retiré.</p>
                        )}
                        <button
                            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                            onClick={() => setSelectedDate(null)}
                        >
                            ❌ Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
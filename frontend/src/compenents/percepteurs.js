"use client";
import { useState, useEffect } from "react";
import PercepteurItem from "./PercepteurItem";
import AddPercepteurForm from "./AddPercepteurForm";
import StatsPanel from "./StatsPanel";
import PercepteurCalendar from "./PercepteurCalendar";
import StatsGraphique from "./StatsGraphique";

export default function PercepteursList() {
    const [percepteurs, setPercepteurs] = useState([]);

    // Charger les percepteurs au montage du composant
    useEffect(() => {
        fetch("http://localhost:3001/percepteurs")
            .then((res) => res.json())
            .then((data) => setPercepteurs(data))
            .catch((err) => console.error("❌ Erreur de récupération :", err));
    }, []);

    // Trier les percepteurs
    const percepteursEnRecolte = percepteurs.filter((p) => !p.date_retrait && !p.attaque);
    const percepteursRecoltes = percepteurs.filter((p) => p.date_retrait);
    const percepteursAttaques = percepteurs.filter((p) => p.attaque);

    // Retirer un percepteur
    const handleRetirer = (id, gain) => {
        fetch(`http://localhost:3001/percepteurs/${id}/retirer`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gain }),
        })
            .then((res) => res.json())
            .then(() => {
                setPercepteurs((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, gain, date_retrait: new Date().toISOString() } : p
                    )
                );
            })
            .catch((err) => console.error("❌ Erreur lors du retrait :", err));
    };

    // Marquer un percepteur comme attaqué
    const handleMarquerAttaque = (id) => {
        fetch(`http://localhost:3001/percepteurs/${id}/attaque`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attaque: 1 }),
        })
            .then((res) => res.json())
            .then(() => {
                setPercepteurs((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, attaque: 1 } : p))
                );
            })
            .catch((err) => console.error("❌ Erreur lors du marquage d'attaque :", err));
    };

    // Ajouter un percepteur
    const handleAddPercepteur = (percepteur) => {
        fetch("http://localhost:3001/percepteurs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(percepteur),
        })
            .then((res) => res.json())
            .then((newPercepteur) => {
                if (!newPercepteur.id) {
                    console.error("❌ Erreur : L'ID du percepteur ajouté est manquant.");
                    return;
                }
                setPercepteurs((prev) => [...prev, { ...percepteur, id: newPercepteur.id }]);
            })
            .catch((err) => console.error("❌ Erreur lors de l'ajout :", err));
    };

    return (
        <div className="p-8 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">📌 Gestion des Percepteurs</h1>

            {/* 🟢 Liste des percepteurs en récolte & Formulaire d'ajout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* 📋 Percepteurs en Récolte */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[500px]">
                    <h2 className="text-2xl font-semibold mb-4 text-green-300">📋 Percepteurs en Récolte</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {percepteursEnRecolte.map((p) => (
                            <PercepteurItem
                                key={p.id || `temp-${Math.random()}`}
                                percepteur={p}
                                onRetirer={handleRetirer}
                                onMarquerAttaque={handleMarquerAttaque}
                            />
                        ))}
                    </div>
                </div>

                {/* ➕ Formulaire d'ajout */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-300">➕ Ajouter un Percepteur</h2>
                    <AddPercepteurForm onAdd={handleAddPercepteur} />
                </div>
            </div>

            {/* 📊 Stats du jour & Stats Globales */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-yellow-300">📅 Stats du Jour</h2>
                    <StatsPanel percepteurs={percepteurs} filtre="jour" />
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-300">📊 Stats Globales</h2>
                    <StatsGraphique percepteurs={percepteurs} />
                </div>
            </div>

            {/* 📆 Calendrier & Percepteurs Récoltés */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-300">📆 Calendrier</h2>
                    <PercepteurCalendar percepteurs={percepteurs} />
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[500px]">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-300">🔵 Percepteurs Récoltés</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {percepteursRecoltes.map((p) => (
                            <PercepteurItem
                                key={p.id || `temp-${Math.random()}`}
                                percepteur={p}
                                onRetirer={handleRetirer}
                                onMarquerAttaque={handleMarquerAttaque}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* 🔴 Percepteurs attaqués */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8 min-h-[500px]">
                <h2 className="text-2xl font-semibold mb-4 text-red-400">🔴 Percepteurs Attaqués</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {percepteursAttaques.map((p) => (
                        <PercepteurItem
                            key={p.id || `temp-${Math.random()}`}
                            percepteur={p}
                            onRetirer={handleRetirer}
                            onMarquerAttaque={handleMarquerAttaque}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
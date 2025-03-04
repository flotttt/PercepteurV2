import { useState } from "react";

const AddPercepteurForm = ({ onAdd }) => {
    const [zone_pose, setZonePose] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [sacochePods, setSacochePods] = useState(false);
    const [coffre, setCoffre] = useState(false);
    const [popoPrice, setPopoPrice] = useState(""); // Champ pour le prix de la popo

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!zone_pose || latitude === "" || longitude === "") {
            alert("Veuillez renseigner tous les champs.");
            return;
        }

        if (popoPrice !== "" && (isNaN(popoPrice) || popoPrice < 0)) {
            alert("Veuillez entrer un prix de potion valide.");
            return;
        }

        const datePose = new Date().toISOString().slice(0, 19).replace("T", " ");

        const percepteur = {
            id_user: 1, // Remplace avec l'ID utilisateur connecté
            zone_pose,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            date_pose: datePose,
            sacoche_pods: sacochePods ? 1 : 0,
            coffre: coffre ? 1 : 0,
            popo_price: popoPrice !== "" ? parseFloat(popoPrice) : 0
        };

        console.log("📌 Données envoyées :", percepteur);
        onAdd(percepteur);

        setZonePose("");
        setLatitude("");
        setLongitude("");
        setSacochePods(false);
        setCoffre(false);
        setPopoPrice(""); // Réinitialisation du champ popo
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">➕ Ajouter un Percepteur</h2>

            <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">📍 Zone</label>
                <input
                    type="text"
                    value={zone_pose}
                    onChange={(e) => setZonePose(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Nom de la zone"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">🌍 Latitude</label>
                    <input
                        type="number"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="Latitude"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">🌍 Longitude</label>
                    <input
                        type="number"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="Longitude"
                        required
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">📦 Options</label>
                <div className="flex items-center">
                    <input type="checkbox" checked={sacochePods} onChange={() => setSacochePods(!sacochePods)} className="mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Sacoche Pods (+180,000 Kamas)</span>
                </div>
                <div className="flex items-center mt-2">
                    <input type="checkbox" checked={coffre} onChange={() => setCoffre(!coffre)} className="mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Coffre (+150,000 Kamas)</span>
                </div>
            </div>

            {/* Champ pour le prix de la potion */}
            <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">🧪 Prix de la potion</label>
                <input
                    type="number"
                    value={popoPrice}
                    onChange={(e) => setPopoPrice(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Prix en Kamas"
                />
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
                ➕ Poser le Percepteur
            </button>
        </form>
    );
};

export default AddPercepteurForm;
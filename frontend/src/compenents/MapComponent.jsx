"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent({ percepteurs }) {
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([48.8566, 2.3522], 5); // Paris par défaut
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);
        }

        percepteurs.forEach((p) => {
            L.marker([p.latitude, p.longitude])
                .addTo(mapRef.current)
                .bindPopup(`<b>${p.zone_pose}</b><br>Gain: ${p.gain.toLocaleString()} Kamas`);
        });

        return () => {
            mapRef.current.eachLayer((layer) => {
                if (!!layer.toGeoJSON) mapRef.current.removeLayer(layer);
            });
        };
    }, [percepteurs]);

    return <div id="map" className="w-full h-64 rounded-md shadow-md"></div>;
}
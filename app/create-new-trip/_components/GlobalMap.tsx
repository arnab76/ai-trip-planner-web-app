"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTripDetail } from "@/app/provider";
import { Activity, itinerary } from "./ChatBox";

export default function GlobalMap() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    const { tripDetailInfo } = useTripDetail();

    useEffect(() => {
        if (!mapContainer.current) return;

        // 🧠 Prevent re-creating map
        if (!mapRef.current) {
            mapRef.current = new maplibregl.Map({
                container: mapContainer.current,

                // ✅ Google-Earth-like satellite style
                style: {
                    version: 8,
                    sources: {
                        satellite: {
                            type: "raster",
                            tiles: [
                                "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                            ],
                            tileSize: 256,
                            attribution: "© Esri",
                        },
                    },
                    layers: [
                        {
                            id: "satellite-layer",
                            type: "raster",
                            source: "satellite",
                        },
                    ],
                },

                center: [-74.5, 40],
                zoom: 1.7,
                maxZoom: 30, // ⭐ important for detail
                pitch: 0,
                bearing: 0,
                canvasContextAttributes: {
                    antialias: true,
                },
            });

            mapRef.current.on("load", () => {
                mapRef.current?.setProjection({ type: "globe" });
                mapRef.current?.addControl(new maplibregl.NavigationControl());
            });
        }

        const map = mapRef.current;
        if (!map) return;

        // 🧹 Remove old markers
        const markers: maplibregl.Marker[] = [];

        // ✅ Add markers from itinerary
        if (tripDetailInfo?.itinerary) {
            tripDetailInfo.itinerary.forEach((day: itinerary) => {
                day.activities.forEach((activity: Activity) => {
                    const lng = activity?.geo_coordinates?.longitude;
                    const lat = activity?.geo_coordinates?.latitude;

                    if (lng && lat) {
                        const marker = new maplibregl.Marker({ color: "red" })
                            .setLngLat([lng, lat])
                            .setPopup(
                                new maplibregl.Popup({ offset: 25 }).setText(
                                    activity.place_name
                                )
                            )
                            .addTo(map);

                        markers.push(marker);

                        map.flyTo({
                            center: [lng, lat],
                            zoom: 7,
                            essential: true,
                        });
                    }
                });
            });
        }

        return () => {
            markers.forEach((m) => m.remove());
        };
    }, [tripDetailInfo]);

    return (
        <div
            ref={mapContainer}
            style={{
                width: "95%",
                height: "85vh",
                borderRadius: "20px",
                backgroundColor: "#011025",
            }}
        />
    );
}
"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9vc2FsdHkiLCJhIjoiY204OTZlYmdvMHpodDJyb21md2Y3dW5hcyJ9.dGMXtSJp5OpLhyWzPpG0IA";

type MapViewProps = {
  width?: number | string;
  height?: number | string;
  latitude?: number;
  longitude?: number;
  className?: string;
};

export const MapView = ({
  width = "100%",
  height = 160,
  latitude = 46.8139,
  longitude = -71.208,
  className = "",
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 10,
      interactive: false, // Disable interactions like in React Native version
      attributionControl: false, // Remove attribution for cleaner look
    });

    // Add marker at the specified location
    marker.current = new mapboxgl.Marker({
      color: "#3b82f6",
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    map.current.on("load", () => {
      setIsLoaded(true);
    });

    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (map.current && marker.current && isLoaded) {
      map.current.flyTo({
        center: [longitude, latitude],
        duration: 2000,
      });

      // Update marker position
      marker.current.setLngLat([longitude, latitude]);
    }
  }, [latitude, longitude, isLoaded]);

  const containerStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div ref={mapContainer} className={`overflow-hidden ${className}`} style={containerStyle} />
  );
};

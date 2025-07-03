"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9vc2FsdHkiLCJhIjoiY204OTZlYmdvMHpodDJyb21md2Y3dW5hcyJ9.dGMXtSJp5OpLhyWzPpG0IA";

type MapLocation = {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  id?: string;
};

type MapViewProps = {
  width?: number | string;
  height?: number | string;
  latitude?: number;
  longitude?: number;
  className?: string;
  locations?: MapLocation[];
  showUserLocation?: boolean;
  userLatitude?: number;
  userLongitude?: number;
};

export const MapView = ({
  width = "100%",
  height = 160,
  latitude = 46.8139,
  longitude = -71.208,
  className = "",
  locations = [],
  showUserLocation = false,
  userLatitude,
  userLongitude,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 10,
      interactive: true,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setIsLoaded(true);
    });

    return () => {
      // Clean up markers
      markers.current.forEach((marker) => marker.remove());
      if (userMarker.current) {
        userMarker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add user location marker if enabled
    if (showUserLocation && userLatitude && userLongitude) {
      if (userMarker.current) {
        userMarker.current.remove();
      }

      userMarker.current = new mapboxgl.Marker({
        color: "#ef4444", // Red color for user location
        scale: 1.2,
      })
        .setLngLat([userLongitude, userLatitude])
        .addTo(map.current);
    }

    // Add location markers
    if (locations.length > 0) {
      locations.forEach((location) => {
        const marker = new mapboxgl.Marker({
          color: "#3b82f6", // Blue color for vendor locations
        })
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current!);

        // Add popup if title or description is provided
        if (location.title || location.description) {
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: false,
          }).setHTML(`
            <div class="p-2">
              ${location.title ? `<h3 class="font-semibold text-sm">${location.title}</h3>` : ""}
              ${
                location.description
                  ? `<p class="text-xs text-gray-600">${location.description}</p>`
                  : ""
              }
            </div>
          `);

          marker.setPopup(popup);
        }

        markers.current.push(marker);
      });

      // Fit map to show all markers
      if (locations.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();

        // Include user location in bounds if shown
        if (showUserLocation && userLatitude && userLongitude) {
          bounds.extend([userLongitude, userLatitude]);
        }

        // Include all vendor locations
        locations.forEach((location) => {
          bounds.extend([location.longitude, location.latitude]);
        });

        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      } else if (locations.length === 1) {
        map.current.flyTo({
          center: [locations[0].longitude, locations[0].latitude],
          zoom: 12,
          duration: 2000,
        });
      }
    } else {
      // Fallback to single marker behavior
      const marker = new mapboxgl.Marker({
        color: "#3b82f6",
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      markers.current.push(marker);
    }
  }, [locations, isLoaded, showUserLocation, userLatitude, userLongitude, latitude, longitude]);

  const containerStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      ref={mapContainer}
      className={`overflow-hidden rounded-lg ${className}`}
      style={containerStyle}
    />
  );
};

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useResizeObserver } from "../../hooks/use-resize-observer";

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9vc2FsdHkiLCJhIjoiY204OTZlYmdvMHpodDJyb21md2Y3dW5hcyJ9.dGMXtSJp5OpLhyWzPpG0IA";

type MapLocation = {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  id?: string;
  imageUrl?: string;
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
  interactive?: boolean;
  withNavigationControl?: boolean;
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
  interactive = false,
  withNavigationControl = false,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 10,
      interactive,
      attributionControl: false,
    });

    // Add navigation control (zoom buttons only, no rotation)
    if (withNavigationControl) {
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        "top-right"
      );
    }

    map.current.on("load", () => {
      setIsLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude]);

  // Clean up markers on unmount
  useEffect(() => {
    return () => {
      markers.current.forEach((marker) => marker.remove());
      if (userMarker.current) {
        userMarker.current.remove();
      }
    };
  }, []);

  // Create popup HTML for markers
  const createPopupHTML = useCallback((location: MapLocation) => {
    return `
      <div class="p-2">
        ${location.title ? `<h3 class="font-semibold text-sm">${location.title}</h3>` : ""}
        ${
          location.description ? `<p class="text-xs text-gray-600">${location.description}</p>` : ""
        }
      </div>
    `;
  }, []);

  // Clear all existing markers
  const clearMarkers = useCallback(() => {
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
  }, []);

  // Add user location marker
  const addUserMarker = useCallback(() => {
    if (!map.current || !showUserLocation || !userLatitude || !userLongitude) return;

    if (userMarker.current) {
      userMarker.current.remove();
    }

    userMarker.current = new mapboxgl.Marker({
      color: "#ef4444", // Red color for user location
      scale: 1.2,
    })
      .setLngLat([userLongitude, userLatitude])
      .addTo(map.current);
  }, [showUserLocation, userLatitude, userLongitude]);

  // Add location markers
  const addLocationMarkers = useCallback(() => {
    if (!map.current || locations.length === 0) return;

    locations.forEach((location) => {
      let marker: mapboxgl.Marker;

      if (location.imageUrl) {
        // Create custom HTML marker with profile image
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid #3b82f6";
        el.style.backgroundImage = `url(${location.imageUrl})`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.cursor = "pointer";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

        // Add fallback for broken images
        const img = new Image();
        img.onload = () => {
          // Image loaded successfully, keep the background image
        };
        img.onerror = () => {
          // Image failed to load, use default marker style
          el.style.backgroundImage = "none";
          el.style.backgroundColor = "#3b82f6";
          el.style.border = "3px solid #ffffff";
        };
        img.src = location.imageUrl;

        marker = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current!);
      } else {
        // Use default marker when no image is provided
        marker = new mapboxgl.Marker({
          color: "#3b82f6", // Blue color for vendor locations
        })
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current!);
      }

      // Add popup if title or description is provided
      if (location.title || location.description) {
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        }).setHTML(createPopupHTML(location));

        marker.setPopup(popup);
      }

      markers.current.push(marker);
    });
  }, [locations, createPopupHTML]);

  // Add fallback marker when no locations provided
  const addFallbackMarker = useCallback(() => {
    if (!map.current || locations.length > 0) return;

    const marker = new mapboxgl.Marker({
      color: "#3b82f6",
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    markers.current.push(marker);
  }, [latitude, longitude, locations.length]);

  // Fit map bounds to show all markers
  const fitMapBounds = useCallback(() => {
    if (!map.current) return;

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
  }, [locations, showUserLocation, userLatitude, userLongitude]);

  useResizeObserver(mapContainer as React.RefObject<Element>, () => {
    if (map.current && isLoaded) {
      setTimeout(() => {
        map.current?.resize();
      }, 50);
    }
  });

  useEffect(() => {
    if (!isLoaded) return;

    clearMarkers();
    addUserMarker();
    addLocationMarkers();
    addFallbackMarker();
    fitMapBounds();
  }, [isLoaded, clearMarkers, addUserMarker, addLocationMarkers, addFallbackMarker, fitMapBounds]);

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

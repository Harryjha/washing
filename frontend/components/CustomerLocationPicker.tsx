"use client";

import React, { useState, useEffect, useRef } from "react";

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    landmark?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

// Default center: Koramangala, Bangalore
const DEFAULT_LAT = 12.9352;
const DEFAULT_LNG = 77.6245;

const BANGALORE_BRANCHES = [
  { name: "Koramangala Branch", lat: 12.9352, lng: 77.6245 },
  { name: "Indiranagar Branch", lat: 12.9784, lng: 77.6408 },
  { name: "HSR Layout Branch", lat: 12.9121, lng: 77.6446 },
  { name: "Jayanagar Branch", lat: 12.9250, lng: 77.5938 },
  { name: "Whitefield Branch", lat: 12.9698, lng: 77.7499 },
  { name: "Malleshwaram Branch", lat: 13.0031, lng: 77.5643 },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function CustomerLocationPicker({
  onLocationSelect,
  initialLat = DEFAULT_LAT,
  initialLng = DEFAULT_LNG,
  initialAddress = "",
}: LocationPickerProps) {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [address, setAddress] = useState<string>(initialAddress);
  const [landmark, setLandmark] = useState<string>("");
  const [locating, setLocating] = useState<boolean>(false);
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Calculate closest store
  const storesWithDist = BANGALORE_BRANCHES.map((b) => ({
    ...b,
    dist: getDistanceKm(lat, lng, b.lat, b.lng),
  })).sort((a, b) => a.dist - b.dist);

  const nearestBranch = storesWithDist[0];

  // Load Leaflet dynamically on mount
  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Inject Leaflet CSS if not present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Inject Leaflet JS if not present
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapContainerRef.current || !isMounted) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([lat, lng], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Custom Red Pin Icon
        const customIcon = L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38],
        });

        const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);

        marker.on("dragend", (e: any) => {
          const newPos = e.target.getLatLng();
          handleLocationUpdate(newPos.lat, newPos.lng);
        });

        map.on("click", (e: any) => {
          marker.setLatLng(e.latlng);
          handleLocationUpdate(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, []);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        const displayAddr = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setAddress(displayAddr);
        onLocationSelect({
          latitude,
          longitude,
          address: displayAddr,
          landmark,
        });
      }
    } catch {
      const fallbackAddr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setAddress(fallbackAddr);
      onLocationSelect({
        latitude,
        longitude,
        address: fallbackAddr,
        landmark,
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleLocationUpdate = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.panTo([newLat, newLng]);
      markerInstanceRef.current.setLatLng([newLat, newLng]);
    }
    reverseGeocode(newLat, newLng);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        handleLocationUpdate(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        alert("Unable to retrieve your location. Please pin your address on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLandmarkChange = (val: string) => {
    setLandmark(val);
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address,
      landmark: val,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">pin_drop</span>
            Pin Pickup Location on Map
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Click map or drag the marker to set your exact location.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={locating}
          className="bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">my_location</span>
          {locating ? "Locating…" : "Detect My Location"}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-inner h-64 w-full">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Nearest Store Banner */}
        <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-gray-200/80 text-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <span className="text-gray-400 font-bold block text-[10px] uppercase">Assigned Hub</span>
            <span className="font-bold text-gray-900">{nearestBranch.name}</span>
            <span className="text-primary font-bold ml-1">({nearestBranch.dist} km)</span>
          </div>
        </div>
      </div>

      {/* Location Details Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
            Selected Street Address {geocoding && <span className="text-primary font-semibold">(Fetching…)</span>}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onLocationSelect({ latitude: lat, longitude: lng, address: e.target.value, landmark });
            }}
            placeholder="Address will auto-fill when you pin on map..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
            Landmark / Flat / Gate No. (Optional)
          </label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => handleLandmarkChange(e.target.value)}
            placeholder="e.g. Opposite Sony Center, Gate #2"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] bg-sky-50 border border-sky-100 p-3 rounded-xl text-sky-900">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="material-symbols-outlined text-primary text-base">near_me</span>
          Direct Routing Active: Closest of 6 Washington Laundrettes hub auto-assigned.
        </span>
        <span className="font-mono font-bold text-primary">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}

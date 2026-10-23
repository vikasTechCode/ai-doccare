import { useEffect } from "react";
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Hospital = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
};

const hospitalIcon = L.divIcon({
  className: "",
  html: `<div style="background:#dc2626;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;font-size:18px">✚</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const locationIcon = L.divIcon({
  className: "",
  html: `<div style="background:#2563eb;width:20px;height:20px;border-radius:50%;border:3px solid white"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 13);
  }, [map, center]);

  return null;
}

export function HealthcareMap() {
  const [location, setLocation] = useState("");
  const [center, setCenter] = useState<[number, number]>([
    19.2183, 72.9781,
  ]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
async function findHospitals(lat: number, lon: number) {
  const query = `
    [out:json][timeout:35];
    (
      nwr["amenity"~"^(hospital|clinic|doctors)$"]
        (around:5000,${lat},${lon});
      nwr["healthcare"~"^(hospital|clinic|doctor|doctors)$"]
        (around:5000,${lat},${lon});
    );
    out center tags;
  `;

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  let data: any = null;
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(45000),
      });

      if (!response.ok) {
        throw new Error(`Hospital service returned HTTP ${response.status}`);
      }

      data = await response.json();
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!data) {
    console.error("Hospital search failed:", lastError);
    throw new Error(
      "Hospital search is temporarily unavailable. Please try again in a minute."
    );
  }

  const results: Hospital[] = (data.elements || [])
    .map((item: any) => ({
      id: String(item.type) + "-" + String(item.id),
      name:
        item.tags?.name ||
        item.tags?.["name:en"] ||
        (item.tags?.amenity === "doctors"
          ? "Doctor's clinic"
          : "Hospital or clinic"),
      lat: Number(item.lat ?? item.center?.lat),
      lon: Number(item.lon ?? item.center?.lon),
      address: [
        item.tags?.["addr:housenumber"],
        item.tags?.["addr:street"],
        item.tags?.["addr:suburb"],
        item.tags?.["addr:city"],
      ]
        .filter(Boolean)
        .join(", "),
    }))
    .filter(
      (item: Hospital) =>
        Number.isFinite(item.lat) &&
        Number.isFinite(item.lon) &&
        item.lat >= -90 &&
        item.lat <= 90 &&
        item.lon >= -180 &&
        item.lon <= 180
    );

  setHospitals(results);

  if (results.length === 0) {
    setError(
      "No mapped hospitals or clinics found within 5 km. Try another nearby area."
    );
  } else {
    setError("");
  }
}


  async function searchLocation(event: React.FormEvent) {
    event.preventDefault();

    if (!location.trim()) {
      setError("Enter a city, area or PIN code.");
      return;
    }

    setLoading(true);
    setError("");
    setHospitals([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        throw new Error("Location search failed. Please try again.");
      }

      const results = await response.json();

      if (!results.length) {
        throw new Error("Location not found. Try another search.");
      }

      const lat = Number(results[0].lat);
      const lon = Number(results[0].lon);

      setCenter([lat, lon]);
      await findHospitals(lat, lon);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      return;
    }

    setLoading(true);
    setError("");
    setHospitals([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setCenter([lat, lon]);
        setLocation(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);

        try {
          await findHospitals(lat, lon);
        } catch {
          setError("Could not load hospitals. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Location permission denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Find Nearby Hospitals
        </h2>
        <p className="text-sm text-slate-600">
          Search an area to find mapped hospitals and clinics within 5 km.
        </p>
      </div>

      <form
        onSubmit={searchLocation}
        className="flex flex-col sm:flex-row gap-2"
      >
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Enter area, city or PIN code"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={useMyLocation}
          disabled={loading}
          className="rounded-lg border px-4 py-3"
        >
          Use My Location
        </button>
      </form>

      {error && (
        <p className="text-sm text-amber-700">{error}</p>
      )}

      <div className="h-[420px] overflow-hidden rounded-xl border">
        <MapContainer
  center={center}
  zoom={12}
  scrollWheelZoom={false}
  touchZoom={true}
  doubleClickZoom={true}
  style={{ height: "100%", width: "100%" }}
>
          <MapCenter center={center} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={center} icon={locationIcon}>
            <Popup>Searched location</Popup>
          </Marker>

          {hospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.lat, hospital.lon]}
              icon={hospitalIcon}
            >
              <Popup>
                <strong>{hospital.name}</strong>
                {hospital.address && <p>{hospital.address}</p>}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      

      <p className="text-xs text-slate-500">
        Map data © OpenStreetMap contributors. Hospital information may be incomplete.
      </p>

      {hospitals.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">
            Found {hospitals.length} mapped facilities
          </h3>

          {hospitals.map((hospital) => (
            <div key={hospital.id} className="rounded-lg border p-3">
              <a
  className="font-medium text-blue-600 hover:underline"
  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${hospital.name} ${hospital.address || ""}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
>
  {hospital.name}
</a>
              {hospital.address && (
                <p className="text-sm text-slate-600">
                  {hospital.address}
                </p>
              )}
              <a
                className="text-sm text-blue-600 underline"
                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
                target="_blank"
                rel="noreferrer"
              >
                Get Directions
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

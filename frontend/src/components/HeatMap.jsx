import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
window.L = L;
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to add heat layer to the map
const HeatLayer = ({ data, options = {} }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Prepare heat map data: [lat, lng, intensity]
    const heatPoints = data.map((point) => {
      // Assign intensity based on priority
      let intensity = 0.5; // default
      switch (point.priority) {
        case "High":
          intensity = 1.0;
          break;
        case "Medium":
          intensity = 0.7;
          break;
        case "Low":
          intensity = 0.4;
          break;
        default:
          intensity = 0.5;
      }
      return [point.lat, point.lng, intensity];
    });

    // Create heat layer
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.0: "blue",
        0.2: "cyan",
        0.4: "lime",
        0.6: "yellow",
        0.8: "orange",
        1.0: "red",
      },
      ...options,
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    // Fit map bounds to data
    if (heatPoints.length > 0) {
      const group = new L.featureGroup(
        heatPoints.map((point) => L.marker([point[0], point[1]]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [data, map, options]);

  return null;
};

// Markers for individual complaints
const ComplaintMarkers = ({ data, showMarkers = false }) => {
  const map = useMap();

  useEffect(() => {
    if (!showMarkers || !data || data.length === 0) return;

    const markers = data.map((complaint) => {
      // Choose marker color based on priority
      let markerColor = "#3388ff"; // default blue
      switch (complaint.priority) {
        case "Emergency":
          markerColor = "#ff0000"; // red
          break;
        case "High":
          markerColor = "#ff6600"; // orange
          break;
        case "Medium":
          markerColor = "#ffff00"; // yellow
          break;
        case "Low":
          markerColor = "#00ff00"; // green
          break;
      }

      const marker = L.circleMarker([complaint.lat, complaint.lng], {
        radius: 8,
        fillColor: markerColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm">${complaint.ticketId}</h3>
          <p class="text-xs"><strong>Location:</strong> ${
            complaint.location
          }</p>
          <p class="text-xs"><strong>Department:</strong> ${
            complaint.department
          }</p>
          <p class="text-xs"><strong>Priority:</strong> ${
            complaint.priority
          }</p>
          <p class="text-xs"><strong>Status:</strong> ${complaint.status}</p>
          <p class="text-xs"><strong>Category:</strong> ${
            complaint.category
          }</p>
          <p class="text-xs"><strong>Date:</strong> ${new Date(
            complaint.createdAt
          ).toLocaleDateString()}</p>
        </div>
      `);

      return marker;
    });

    const markersGroup = L.layerGroup(markers);
    markersGroup.addTo(map);

    return () => {
      map.removeLayer(markersGroup);
    };
  }, [data, showMarkers, map]);

  return null;
};

const HeatMap = ({
  data = [],
  center = [22.6147, 75.8888], // Default to Indore coordinates
  zoom = 12,
  showMarkers = false,
  heatOptions = {},
}) => {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer data={data} options={heatOptions} />
        <ComplaintMarkers data={data} showMarkers={showMarkers} />
      </MapContainer>
    </div>
  );
};

export default HeatMap;

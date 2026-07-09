import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import proj4 from "proj4";
import { estateData } from "../../../data.js";

// ✅ Convert UTM to Lat/Lng (Rounded to 6 decimal places)
const utmToLatLng = (
  easting,
  northing,
  zone = 31,
  northernHemisphere = true
) => {
  const utmProjection = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs ${
    northernHemisphere ? "" : "+south"
  }`;
  const wgs84Projection = "+proj=longlat +datum=WGS84 +no_defs";
  const [lat, lng] = proj4(utmProjection, wgs84Projection, [
    easting,
    northing,
  ]).reverse();

  return [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))]; // ✅ Rounded values
};

const EstateMap = () => {
  useEffect(() => {
    const mapContainer = document.getElementById("estate-map");
    if (!mapContainer) return;

    const map = L.map("estate-map").setView([6.5244, 3.3792], 16); // Default Lagos center

    // ✅ Add OpenStreetMap Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // ✅ Convert & Plot Estate Boundary
    if (estateData.boundary?.length) {
      const boundaryLatLng = estateData.boundary.map(([e, n]) =>
        utmToLatLng(e, n)
      );
      console.log("Boundary Coordinates:", boundaryLatLng);

      const boundaryPolygon = L.polygon(boundaryLatLng, {
        color: "blue",
        weight: 2,
        fillOpacity: 0.2,
      })
        .addTo(map)
        .bindPopup("Estate Boundary");

      // ✅ Automatically zoom to fit estate boundary
      map.fitBounds(boundaryPolygon.getBounds());
    }

    // ✅ Convert & Plot Roads
    estateData.roads?.forEach((road, index) => {
      const roadLatLng = road.coordinates.map(([e, n]) => utmToLatLng(e, n));
      console.log(`Road ${index + 1} Coordinates:`, roadLatLng);

      L.polyline(roadLatLng, {
        color: "black",
        weight: 2,
        dashArray: "5, 5",
      })
        .addTo(map)
        .bindPopup(road.name);
    });

    // ✅ Convert & Plot Individual Plots
    // ✅ Convert & Plot Individual Plots
    estateData.plots?.forEach((plot, index) => {
      const plotLatLng = plot.coordinates.map(([e, n]) => {
        const latLng = utmToLatLng(e, n);
        console.log(`Plot ${index + 1} UTM:`, { easting: e, northing: n });
        console.log(`Plot ${index + 1} LatLng:`, latLng);
        return latLng;
      });

      L.polygon(plotLatLng, {
        color: plot.status === "available" ? "green" : "red",
        weight: 1,
        fillOpacity: 0.5,
      })
        .addTo(map)
        .bindPopup(`Plot ${index + 1} - ${plot.status}`);
    });

    return () => map.remove();
  }, []);

  return <div id="estate-map" className="w-full h-[600px]" />; // Ensure visible height
};

export default EstateMap;

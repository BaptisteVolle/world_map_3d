import * as THREE from "three";
import { latLonToVector3 } from "./utilities";

export async function loadGeoJSON(filePath: string) {
  const response = await fetch(filePath);
  const geoJSONData = await response.json(); // Store the data in the global variable
  return geoJSONData;
}

export function plotCountries(geoJSON: any, scene: THREE.Scene) {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  geoJSON.features.forEach((feature: any) => {
    const coordinates = feature.geometry.coordinates;
    const type = feature.geometry.type;

    if (type === "Polygon") {
      coordinates.forEach((ring: number[][]) => {
        const points = ring.map(([lon, lat]) => latLonToVector3([lat, lon], 1));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.LineLoop(geometry, lineMaterial);
        scene.add(line);
      });
    } else if (type === "MultiPolygon") {
      coordinates.forEach((polygon: number[][][]) => {
        polygon.forEach((ring: number[][]) => {
          const points = ring.map(([lon, lat]) =>
            latLonToVector3([lat, lon], 1)
          );
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.LineLoop(geometry, lineMaterial);
          scene.add(line);
        });
      });
    }
  });
}

export function findCountryByCoordinates(
  coordinates: number[], // [longitude, latitude]
  geoJSON: any
): string | null {
  const [lon, lat] = coordinates;

  for (const feature of geoJSON.features) {
    const geometry = feature.geometry;
    const type = geometry.type;
    const coords = geometry.coordinates;

    if (type === "Polygon") {
      for (const ring of coords) {
        if (isPointInPolygon([lon, lat], ring)) {
          return feature.properties.name;
        }
      }
    } else if (type === "MultiPolygon") {
      for (const polygon of coords) {
        for (const ring of polygon) {
          if (isPointInPolygon([lon, lat], ring)) {
            return feature.properties.name;
          }
        }
      }
    }
  }
  return null;
}

function isPointInPolygon(point: number[], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

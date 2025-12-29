import { locations_beach } from "./locations_beach.js";
import { locations_food } from "./locations_food.js";
import { locations_attraction } from "./locations_attraction.js";
import { locations_accommodation } from "./locations_accommodation.js";

export const newLocations = [
  ...locations_beach,
  ...locations_food,
  ...locations_attraction,
  ...locations_accommodation,
];

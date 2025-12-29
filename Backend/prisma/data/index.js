import { locations_beach } from "./locations-beach.js";
import { locations_food } from "./locations-food.js";
import { locations_attraction } from "./locations-attraction.js";
import { locations_accommodation } from "./locations-accommodation.js";

export const newLocations = [
  ...locations_beach,
  ...locations_food,
  ...locations_attraction,
  ...locations_accommodation,
];

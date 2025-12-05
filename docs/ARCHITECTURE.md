# System Architecture Document

## 1. Architectural Pattern

The application follows the **Client-Server** pattern with a **Service-Oriented** structure in the Backend. This ensures separation of concerns, making the system maintainable and scalable.

## 2. Data Flow Diagram

1.  **Request**: User submits data (Budget, Dates, Preferences) on Frontend.
2.  **API**: Frontend calls `POST /api/itinerary/generate`.
3.  **Controller**: `itinerary.controller.js` validates input.
4.  **Service**: `itinerary.service.js` orchestrates the process:
    *   Validates Budget feasibility.
    *   Fetches optimized location data from Database via Prisma.
    *   Calls `generateDayScheduleStrict` algorithm for each day.
5.  **Algorithm**: The scheduling algorithm iterates through time slots, selecting best-fit locations based on:
    *   Scoring System (Distance, Preference Match, Cost).
    *   Constraints (Operating Hours, Visit Duration).
6.  **Response**: The structured Itinerary JSON is returned to the Frontend.
7.  **Visualization**: Frontend renders the itinerary on the UI Timeline.

## 3. Database Schema (ERD Context)

*   **Location**: detailed info (lat, lng, price, type).
*   **Admin**: system management accounts.
*   **Knowledge**: question-answer pairs for the RAG chatbot.
*   **(Legacy)**: `Users`, `Itineraries` (planned for future expansion).

## 4. Constraint Satisfaction Algorithm (CSP) details

The Itinerary Generation is modeled as a CSP:
*   **Variables**: Time Slots (Morning, Noon, Afternoon, Evening).
*   **Domains**: Set of Available Locations.
*   **Constraints**:
    *   `Time Constraint`: Travel time + Visit time < Slot duration.
    *   `Budget Constraint`: Total Cost < Daily Budget.
    *   `Logical Constraint`: "Lunch" must happen at noon; "Check-in" only on Day 1.

## 5. RAG Chatbot Flow

1.  **User Query**: "Đà Nẵng có gì chơi?"
2.  **Retrieval**: System searches `Knowledge` table and `Location` table for relevant keywords.
3.  **Prompt Augmentation**: System constructs a prompt for Gemini AI:
    *   `Context`: [Retrieved Data]
    *   `Query`: "Đà Nẵng có gì chơi?"
4.  **Generation**: Gemini generates a natural language response based ONLY on the provided context (grounded).
5.  **Output**: Response text sent to user.

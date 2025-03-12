# Math Bubble Master

This is a simple math-based game where players solve math problems by clicking on the correct targets (bubbles) as they appear on the screen. The game uses **Socket.IO** for real-time client-server communication and the **Canvas 2D API** for rendering game elements in the browser.

## How Sockets are Used

The game heavily relies on WebSockets for seamless interaction between the frontend and backend:

- **Player Connection**: When a player connects, their game state (score, level, status) is initialized and stored.
- **Game Initialization**: The frontend sends an `initGame` event, and the backend sets up the player’s initial game state and starts target generation.
- **Target Management**: Targets (bubbles) are sent to the client via events like `newTarget` and `targetsUpdate`. The client also informs the server when a target is hit (`targetHit`) or missed (`targetMiss`).
- **Problem Generation**: Each time the player hits the correct target, the backend generates a new math problem and sends it back with `newProblem`.
- **Score and Level Updates**: The client receives real-time updates for the player’s score (`scoreUpdate`) and level (`levelUpdate`).
- **Game Over**: When the player’s score drops too low or when player clicks on stop button, the backend sends a `gameOver` event to the client.

## Technologies Used

- **Socket.IO**: Enables real-time, bidirectional event-based communication.
- **Canvas 2D API**: Used for rendering interactive game elements like targets (bubbles) and visual feedback.

## What I Learned

- **Socket.IO**: Gained hands-on experience with WebSockets and real-time data flow.
- **Canvas 2D API**: Learned how to create and manipulate interactive visual elements in a web-based game.

## Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yash211/math-game.git
   cd math-game
   ```

2. **Install Dependencies:**
   For the backend:
   ```bash
   cd backend
   npm install
   ```
   For the frontend:
   ```bash
   cd frontend
   npm install
   ```

3. **Set Up Environment Variables:**
   Backend `.env` file:
   ```env
   PORT=3000
   CLIENT_URL=http://localhost:5173
   ```
   Frontend `.env` file:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

4. **Run the Backend:**
   ```bash
   cd backend
   npm run dev
   ```

5. **Run the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open the Game:**
   Open your browser and go to `http://localhost:5173`.

**Play and Enjoy!**




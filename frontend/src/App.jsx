import React from 'react';
import Canvas from './components/Canvas';
import Home from './components/Home';
import GameLoop from './components/GameLoop';

function App() {
  return (
    <div className="inset-0 bg-gradient-to-b from-blue-900 to-black">
      <Canvas />
      <Home />
      <GameLoop />
    </div>
  );
}

export default App;
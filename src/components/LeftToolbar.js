import React from 'react';
import '../styles/LeftToolbar.css'; // Ensure you have the necessary styles

const LeftToolbar = () => {
  return (
    <div id="leftToolbar">
      {/* Right Navigation Double Arrow */}
      <div className="scene-change-button" onClick={() => window.location.href='leftPage.html'}>
        ⇐
      </div>
    </div>
  );
};

export default LeftToolbar;

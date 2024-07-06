import React from 'react';
import '../styles/Toolbar.css'; // Ensure you have the necessary styles

const LeftToolbar = () => {
  return (
    <div id="leftToolbar">
      <div id="leftArrow" className="arrow" onClick={() => window.location.href='leftPage.html'}>
        <span>&larr;</span>
      </div>
    </div>
  );
};

export default LeftToolbar;

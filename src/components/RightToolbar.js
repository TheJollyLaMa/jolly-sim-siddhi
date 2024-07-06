import React from 'react';
import '../styles/Toolbar.css'; // Ensure you have the necessary styles

const RightToolbar = () => {
  return (
    <div id="rightToolbar">
      <div id="rightArrow" className="arrow" onClick={() => window.location.href='rightPage.html'}>
        <span>&rarr;</span>
      </div>
    </div>
  );
};

export default RightToolbar;

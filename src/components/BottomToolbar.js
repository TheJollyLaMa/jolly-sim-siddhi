import React from 'react';
import '../styles/Toolbar.css'; // Ensure you have the necessary styles

const BottomToolbar = () => {
  return (
    <div id="bottomToolbar">
      <div id="bottomArrow" className="arrow" onClick={() => window.location.href='bottomPage.html'}>
        <span>&darr;</span>
      </div>
    </div>
  );
};

export default BottomToolbar;


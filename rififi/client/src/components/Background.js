import React from 'react';

const Background = () => {
  return (
  <video 
    id="videobg"
    autoPlay
    loop
    controls
  >
    <source src={`${CONFIG.serverURL}/assets/entry.mp4`} type="video/mp4"/>
  </video>
)
}

export default Background;
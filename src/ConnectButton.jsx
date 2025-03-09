import React from 'react';

export default function ConnectButton(props) {
  // Define your custom styles that match your theme.
  const defaultStyle = {
    backgroundColor: "black",
    color: "white",
    border: "2px solid white",
    borderRadius: "8px",
    padding: "8px 16px",
    // You can add further styling as needed.
  };

  // Merge any provided styles with the defaults.
  const style = { ...defaultStyle, ...props.style };

  // Render the AppKit's wallet connect button with the custom style.
  return <appkit-button style={style} />;
}

import React, { useState } from "react";
import html2canvas from "html2canvas";

const FullScreenCapture = () => {
  const [screenCapture, setScreenCapture] = useState("");

  const handleCaptureChecked = async (event) => {
    if (event.target.checked) {
      const canvas = await html2canvas(document.body);
      const dataURL = canvas.toDataURL("image/png");
      console.log({ dataURL: dataURL });
      setScreenCapture(dataURL);
    }
  };

  const handleCaptureClick = async () => {
    try {
      const canvas = await html2canvas(document.body);
      const dataURL = canvas.toDataURL("image/png");
      console.log({ dataURL: dataURL });
      setScreenCapture(dataURL);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  return (
    <div>
      <h1>Full Screen Capture</h1>
      <div
        style={{
          border: "1px solid gray",
          padding: "20px",
          marginBottom: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Content to be captured</h2>
        <p>This is the area that will be captured in the screenshot.</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam
          at eaque, impedit nam praesentium ipsa nisi voluptates ad, saepe sunt
          ut odio cumque voluptate eum doloribus libero, quidem laboriosam
          vero.
        </p>
      </div>
      <div>
        <button onClick={handleCaptureClick}>Capture Screenshot</button>
      </div>
      {screenCapture && (
        <div>
          <center>
            <img
              width={800}
              src={screenCapture}
              alt="div-capture"
              style={{ marginTop: "20px", border: "1px solid black" }}
            />
          </center>
        </div>
      )}
    </div>
  );
};

export default FullScreenCapture;

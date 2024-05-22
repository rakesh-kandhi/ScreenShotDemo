import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

const ScreenShotApp = () => {
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [selection, setSelection] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const screenshotRef = useRef(null);

  const takeScreenshot = () => {
    html2canvas(document.body)
      .then((canvas) => {
        setScreenshotUrl(canvas.toDataURL());
      })
      .catch((error) => {
        console.error("Error capturing screenshot:", error);
        setScreenshotUrl(""); 
      });
  };

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    setDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMouseMove = (event) => {
    if (dragging) {
      const { clientX, clientY } = event;
      const x = Math.min(startPos.x, clientX);
      const y = Math.min(startPos.y, clientY);
      const width = Math.abs(startPos.x - clientX);
      const height = Math.abs(startPos.y - clientY);
      setSelection({ x, y, width, height });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div>
      <button onClick={takeScreenshot}>Take Screenshot</button>
      {screenshotUrl && (
        <div
          ref={screenshotRef}
          style={{ position: "relative", display: "inline-block" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img src={screenshotUrl} alt="Screenshot" />
          {selection && (
            <div
              className="highlight-block"
              style={{
                position: "absolute",
                top: selection.y,
                left: selection.x,
                width: selection.width,
                height: selection.height,
                border: "2px solid rgba(255, 0, 0, 0.5)",
                pointerEvents: "none",
              }}
            ></div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenShotApp;

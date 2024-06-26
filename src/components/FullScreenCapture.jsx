import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

const FullScreenCapture = () => {
  const [screenCapture, setScreenCapture] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [rectangles, setRectangles] = useState([]);
  const imageRef = useRef(null);

  const handleCaptureClick = async () => {
    try {
      const canvas = await html2canvas(document.body);
      const dataURL = canvas.toDataURL("image/png");
      setScreenCapture(dataURL);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  const handleDeleteScreenshot = () => {
    setScreenCapture("");
    setRectangles([]);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleMouseDown = (event) => {
    if (isEditing) {
      setDragging(true);
      const rect = imageRef.current.getBoundingClientRect();
      setStartPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      setEndPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    }
  };

  const getRectangleStyle = (rect) => {
    const x = Math.min(rect.startPos.x, rect.endPos.x);
    const y = Math.min(rect.startPos.y, rect.endPos.y);
    const width = Math.abs(rect.startPos.x - rect.endPos.x);
    const height = Math.abs(rect.startPos.y - rect.endPos.y);
    return {
      zIndex: 0,
      color: "red",
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      position: "absolute",
      border: "2px solid red",
      cursor: "crosshair",
    };
  };

  const handleMouseUp = () => {
    if (isEditing) {
      setDragging(false);
      setIsEditing(false);
      setRectangles([...rectangles, { id: Date.now(), startPos, endPos }]);
    }
  };

  const handleMouseMove = (event) => {
    if (dragging) {
      const rect = imageRef.current.getBoundingClientRect();
      setEndPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    }
  };

  const handleDeleteRectangle = (id) => {
    setRectangles(rectangles.filter(rect => rect.id !== id));
  };

  return (
    <div>
      <h1>Full Screen Capture</h1>
      <div className="content-container">
        <h2>Content to be captured</h2>
        <p>This is the area that will be captured in the screenshot.</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam at
          eaque, impedit nam praesentium ipsa nisi voluptates ad, saepe sunt ut
          odio cumque voluptate eum doloribus libero, quidem laboriosam vero.
        </p>
      </div>
      <div>
        <button onClick={handleCaptureClick}>Capture Screenshot</button>
      </div>
      {screenCapture && (
        <div>
          <center>
            <div
              className="div-capture"
              style={{
                position: "relative",
                display: "inline-block",
                marginTop: "20px",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              ref={imageRef}
            >
              <img
                width={800}
                src={screenCapture}
                alt="div-capture"
                className="captured-image"
              />
              <div className={isHovered ? "div-edit" : "none"}>
                <button onClick={handleEdit} className="edit-button">
                  Edit
                </button>
                <button onClick={handleDeleteScreenshot} className="delete-button">
                  Delete
                </button>
              </div>
              {rectangles.map((rect) => (
                <div className="cross-rectangle" key={rect.id} style={getRectangleStyle(rect)}>
                  <button
                    onClick={() => handleDeleteRectangle(rect.id)}
                   className="cross-button"
                  >
                    X
                  </button>
                </div>
              ))}
              {dragging && (
                <div style={getRectangleStyle({ startPos, endPos })} />
              )}
            </div>
          </center>
        </div>
      )}
    </div>
  );
};

export default FullScreenCapture;

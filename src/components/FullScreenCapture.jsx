import React, { useState, useRef, useCallback, useEffect, memo } from "react";

// Drags shorter than this (a plain click, or a slip of the mouse) are discarded
// instead of committing a zero-area rectangle.
const MIN_DRAG_SIZE = 4;

const normalizeRect = (start, end) => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(start.x - end.x),
  height: Math.abs(start.y - end.y),
});

const getRectangleStyle = (rect) => {
  const { x, y, width, height } = normalizeRect(rect.startPos, rect.endPos);
  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
};

const Rectangle = memo(({ rect, onDelete }) => (
  <div className="cross-rectangle" style={getRectangleStyle(rect)}>
    <button onClick={() => onDelete(rect.id)} className="cross-button">
      X
    </button>
  </div>
));

const FullScreenCapture = () => {
  const [screenCapture, setScreenCapture] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rectangles, setRectangles] = useState([]);
  const imageRef = useRef(null);

  // The in-progress selection lives in refs and is painted straight to the DOM,
  // so a drag costs zero React renders instead of one per mousemove event.
  const previewRef = useRef(null);
  const dragRef = useRef({ active: false, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  const frameRef = useRef(0);

  // Object URLs must be revoked by hand; keeping the latest one in a ref lets
  // both the replace and unmount paths release the previous blob.
  const objectUrlRef = useRef("");

  const setCapture = useCallback((url) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = url;
    setScreenCapture(url);
  }, []);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  const handleCaptureClick = useCallback(async () => {
    setIsCapturing(true);
    try {
      // Loaded on demand: html2canvas is by far the heaviest dependency, and
      // keeping it out of the entry chunk means it is only fetched if the user
      // actually captures something.
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(document.body, {
        scale: 1,
        logging: false,
        removeContainer: true,
      });
      // toBlob + object URL avoids materialising a multi-megabyte base64 string
      // in React state the way toDataURL does.
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) setCapture(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [setCapture]);

  const handleDeleteScreenshot = useCallback(() => {
    setCapture("");
    setRectangles([]);
    setIsEditing(false);
  }, [setCapture]);

  const handleEdit = useCallback(() => setIsEditing(true), []);

  const handleDeleteRectangle = useCallback((id) => {
    setRectangles((prev) => prev.filter((rect) => rect.id !== id));
  }, []);

  const pointIn = (event) => {
    const bounds = imageRef.current.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const paintPreview = useCallback(() => {
    frameRef.current = 0;
    const el = previewRef.current;
    if (!el) return;
    const { x, y, width, height } = normalizeRect(dragRef.current.start, dragRef.current.end);
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
  }, []);

  const handleMouseDown = useCallback(
    (event) => {
      if (!isEditing) return;
      const point = pointIn(event);
      dragRef.current = { active: true, start: point, end: point };
      if (previewRef.current) previewRef.current.style.display = "block";
      paintPreview();
    },
    [isEditing, paintPreview]
  );

  // Move/up are bound to the window so the selection keeps tracking (and always
  // ends) even when the pointer leaves the image.
  useEffect(() => {
    if (!isEditing) return undefined;

    const handleMouseMove = (event) => {
      if (!dragRef.current.active) return;
      dragRef.current.end = pointIn(event);
      // Coalesce bursts of mousemove into at most one paint per frame.
      if (!frameRef.current) frameRef.current = requestAnimationFrame(paintPreview);
    };

    const handleMouseUp = () => {
      const { active, start, end } = dragRef.current;
      if (!active) return;
      dragRef.current.active = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
      if (previewRef.current) previewRef.current.style.display = "none";

      const { width, height } = normalizeRect(start, end);
      if (width >= MIN_DRAG_SIZE && height >= MIN_DRAG_SIZE) {
        setRectangles((prev) => [...prev, { id: Date.now(), startPos: start, endPos: end }]);
      }
      setIsEditing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isEditing, paintPreview]);

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
        <button onClick={handleCaptureClick} disabled={isCapturing}>
          {isCapturing ? "Capturing…" : "Capture Screenshot"}
        </button>
      </div>
      {screenCapture && (
        <div className="capture-wrapper">
          <div
            className={`div-capture${isEditing ? " is-editing" : ""}`}
            onMouseDown={handleMouseDown}
            ref={imageRef}
          >
            <img
              width={800}
              src={screenCapture}
              alt="div-capture"
              className="captured-image"
              draggable={false}
            />
            <div className="div-edit">
              <button onClick={handleEdit} className="edit-button">
                Edit
              </button>
              <button onClick={handleDeleteScreenshot} className="delete-button">
                Delete
              </button>
            </div>
            {rectangles.map((rect) => (
              <Rectangle key={rect.id} rect={rect} onDelete={handleDeleteRectangle} />
            ))}
            <div ref={previewRef} className="drag-preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FullScreenCapture;

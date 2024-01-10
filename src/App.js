import "./App.css";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { IoMdPause } from "react-icons/io";
import * as faceapi from "face-api.js";
import VideoButtons from "./components/videoButtons";

function App() {
  const [storeCanvas, setStoreCanvas] = useState(null);
  const [videoResource, setVideoResource] = useState(null);
  const [isPlaying, setPlaying] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const reder = new FileReader();
  const videoRef = useRef();
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      height: 360,
      width: 630,
      backgroundColor: "#ededed",
      selection: false,
    });
    setStoreCanvas(canvas);
  }, []);

  const onVideoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file.");
      return;
    }
    reder.readAsDataURL(file);

    setSelectedVideo(file);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      videoResource.getElement().pause();
    } else {
      videoResource.getElement().play();
    }
    setPlaying(!isPlaying);
  };

  // when video uploaded it will add it on canvas
  reder.addEventListener("load", () => {
    var video1E1 = document.getElementById("video1");
    video1E1.onerror = () => {
      alert("Failed to load the video. Please upload a supported video file.");
      window.location.reload();
      return;
    };
    video1E1.setAttribute("src", reder.result);
    console.log(video1E1);
    var video1 = new fabric.Image(video1E1, {
      height: 360,
      width: 630,
      selectable: false,
    });
    setVideoResource(video1);
    storeCanvas.add(video1);
    fabric.util.requestAnimFrame(function render() {
      storeCanvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });

    video1.getElement().play();
  });

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
    };

    const startVideo = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }, 100);
    };

    loadModels();

    if (selectedVideo) {
      const video = videoRef.current;
      video.src = URL.createObjectURL(selectedVideo);
      video.addEventListener("loadedmetadata", () => {
        startVideo();
      });
    }
  }, [selectedVideo]);

  return (
    <main className=" w-[100%] md:w-[90%] lg:w-[50%] m-auto  relative">
      <h1 className="text-[1rem] lg:text-[2rem] font-bold text-indigo-500">
        Quickreel Assignment submission{" "}
      </h1>
      <section className="mt-[2rem] z-10">
        <canvas id="canvas" />
      </section>
      <section className="flex flex-col gap-10 mt-5 relative">
        <VideoButtons
          props={{
            videoResource,
            isPlaying,
            handlePlayPause,
            setVideoResource,
            onVideoUpload,
          }}
        />

        {/* this is video to get element by ID and it is hidden  */}
        <video
          id="video1"
          ref={videoRef}
          className="hidden w-[100%] min-w-[800px] overflow-visible "
          width="630"
          height="360"
        >
          <source id="video_src2" type="video/mp4" />
        </video>
      </section>

      <div className={`top-16 md:top-16 left-0  z-0 absolute  `}>
        <canvas ref={canvasRef} />
      </div>
    </main>
  );
}

export default App;

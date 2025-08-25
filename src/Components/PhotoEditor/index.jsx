import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Cropper, RectangleStencil } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import { useWallet } from "../../contexts/WalletContext";
import { deductWallet } from "../../api/auth";
import { toast } from "react-hot-toast";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import { jwtDecode } from "jwt-decode";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const CARD_PRESETS = {
  "Govt ID 1": {
    Photo: { width: 414, height: 531 },
    Front: { width: 986, height: 627 },
    Back: { width: 986, height: 627 },
  },
  "Govt ID 2": {
    Photo: { width: 94, height: 94 },
    Front: { width: 323, height: 204 },
    Back: { width: 323, height: 204 },
  },
};

const OUTPUT_SIZES = {
  Photo: { width: 94, height: 94 },
  Front: { width: 986, height: 627 },
  Back: { width: 986, height: 627 },
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ✅ accepts optional password now
async function pdfFirstPageToDataURL(file, scale = 1, password) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    ...(password ? { password } : {}),
  });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 * scale });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/png", 1);
}

async function applyGammaFilterToDataURL(src, gamma) {
  if (!src) return null;
  const image = await new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  if (Math.abs(gamma - 1) > 0.01) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const invGamma = 1 / gamma;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 255 * Math.pow(d[i] / 255, invGamma);
      d[i + 1] = 255 * Math.pow(d[i + 1] / 255, invGamma);
      d[i + 2] = 255 * Math.pow(d[i + 2] / 255, invGamma);
    }
    ctx.putImageData(imgData, 0, 0);
  }
  return canvas.toDataURL("image/png", 1);
}

export default function IDCardEditor() {
  const [imageSrc, setImageSrc] = useState(null);
  const [area, setArea] = useState("Front");
  const [selectedType, setSelectedType] = useState("Govt ID 1");
  const [isCustom, setIsCustom] = useState(false);
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);


  const [previewAdjust, setPreviewAdjust] = useState({
    Photo: {
      x: 0,
      y: 0,
      filters: { brightness: 0, contrast: 0, saturation: 0, shadows: 0 },
    },
    Front: {
      x: 0,
      y: 0,
      filters: { brightness: 0, contrast: 0, saturation: 0, shadows: 0 },
    },
    Back: {
      x: 0,
      y: 0,
      filters: { brightness: 0, contrast: 0, saturation: 0, shadows: 0 },
    },
  });

  const [dims, setDims] = useState({
    Photo: CARD_PRESETS["Govt ID 1"].Photo,
    Front: CARD_PRESETS["Govt ID 1"].Front,
    Back: CARD_PRESETS["Govt ID 1"].Back,
  });

  const [outputs, setOutputs] = useState({
    Photo: null,
    Front: null,
    Back: null,
  });
const [photoWidth, setPhotoWidth] = useState(dims.Photo.width);
const [photoHeight, setPhotoHeight] = useState(dims.Photo.height);
  const [zoom, setZoom] = useState(1);
  const [layout, setLayout] = useState("lr");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showInsufficientPopup, setShowInsufficientPopup] = useState(false);

  // ✅ password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pendingPDF, setPendingPDF] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [customWidth, setCustomWidth] = useState(0);
  const [customHeight, setCustomHeight] = useState(0);
  
  const cropperRef = useRef(null);
  const dpi = 300;
  const fileInputRef = useRef(null);

  const { balance, fetchBalance } = useWallet();
  useEffect(() => {
    if (selectedType === "Custom") {
      setIsCustom(true);
      return;
    }

    setIsCustom(false);
    const preset = CARD_PRESETS[selectedType];
    if (preset) {
      setDims({ Photo: preset.Photo, Front: preset.Front, Back: preset.Back });

      // ✅ Reset cropper stencil coordinates to match preset
      const widthPx = preset[area].width;
      const heightPx = preset[area].height;

      if (cropperRef.current) {
        cropperRef.current.setCoordinates({
          width: widthPx,
          height: heightPx,
          left: 0,
          top: 0,
        });
      }
    }
  }, [selectedType, area]);

  const aspect = useMemo(
    () => (isCustom ? null : dims[area].width / dims[area].height),
    [dims, area, isCustom]
  );

  const handleFile = async (file) => {
    const isPDF =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      const src = await readFileAsDataURL(file);
      setImageSrc(src);
      setZoom(1);
      setEditingEnabled(true);
      setPhotoUploaded(true);
      return;
    }

    // PDFs: try once without password, catch PasswordException
    try {
      setLoadingPDF(true);
      const src = await pdfFirstPageToDataURL(file); // no password
      setImageSrc(src);
      setZoom(1);
      setEditingEnabled(true);
      setPhotoUploaded(true);
      setLoadingPDF(false);
    } catch (error) {
      setLoadingPDF(false);
      const needPw =
        error?.name === "PasswordException" ||
        error?.code === pdfjsLib.PasswordResponses.NEED_PASSWORD ||
        error?.code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD;
      if (needPw) {
        setPendingPDF(file);
        setShowPasswordModal(true);
      } else {
        console.error(error);
        toast.error("Invalid or corrupted PDF.");
      }
    }
  };

  // ✅ unlock using the provided password (uses pdfFirstPageToDataURL with password)
  const unlockPDF = async () => {
    if (!pendingPDF || !pdfPassword) return;
    try {
      setLoadingPDF(true);
      const src = await pdfFirstPageToDataURL(pendingPDF, 1, pdfPassword);
      setImageSrc(src);
      setZoom(1);
      setEditingEnabled(true);
      setPhotoUploaded(true);
      setShowPasswordModal(false);
      setPdfPassword("");
      setPendingPDF(null);
      setLoadingPDF(false);
    } catch (error) {
      setLoadingPDF(false);
      const wrongPw =
        error?.name === "PasswordException" ||
        error?.code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD;
      if (wrongPw) {
        toast.error("Incorrect password. Try again.");
      } else {
        console.error(error);
        toast.error("Error unlocking PDF.");
        setShowPasswordModal(false);
      }
    }
  };

  const doUpdate = useCallback(async () => {
    if (!imageSrc) return;
    const outSize = OUTPUT_SIZES[area];

    // Export from cropper at exact output size
    const canvas = cropperRef.current?.getCanvas({
      width: dims[area].width,
      height: dims[area].height,
      fillColor: "transparent",
    });

    if (!canvas) {
      toast.error("Make a crop selection first.");
      return;
    }

    // Apply only gamma (shadows) in pixels here; CSS filters are preview-only
    const gamma = clamp(1 + previewAdjust[area].filters.shadows / 100, 0.1, 5);
    let dataUrl = canvas.toDataURL("image/png", 1);
    if (Math.abs(gamma - 1) > 0.01) {
      dataUrl = await applyGammaFilterToDataURL(dataUrl, gamma);
    }

    setOutputs((o) => ({ ...o, [area]: dataUrl }));
  }, [imageSrc, area, previewAdjust]);
  const downloadPDF = useCallback(async () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [dims.Photo.width, dims.Photo.height],
    });

    const m = 24;
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const renderHighResImage = async (src, width, height, filters) => {
      const img = new Image();
      img.src = src;
      await new Promise((resolve) => (img.onload = resolve));

      const scale = 4; // Higher for quality
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");

      const b = clamp(100 + filters.brightness * 0.5, 0, 200);
      const c = clamp(100 + filters.contrast * 0.5, 0, 200);
      const s = clamp(100 + filters.saturation, 0, 200);
      const gamma = clamp(1 + filters.shadows / 50, 0.1, 5);

      ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (Math.abs(gamma - 1) > 0.01) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        const invGamma = 1 / gamma;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = 255 * Math.pow(d[i] / 255, invGamma);
          d[i + 1] = 255 * Math.pow(d[i + 1] / 255, invGamma);
          d[i + 2] = 255 * Math.pow(d[i + 2] / 255, invGamma);
        }
        ctx.putImageData(imgData, 0, 0);
      }

      return canvas.toDataURL("image/png", 1);
    };

    // ✅ Dynamically calculate based on actual image sizes (Front & Back)
    const frontWidth = dims.Front?.width;
    const frontHeight = dims.Front?.height;
    const backWidth = dims.Back?.width;
    const backHeight = dims.Back?.height;

    let scaleFactor;
    if (layout === "lr") {
      const totalWidth = frontWidth + backWidth;
      scaleFactor = (pdfWidth - 3 * m) / totalWidth;
    } else if (layout === "tb") {
      const totalHeight = frontHeight + backHeight;
      scaleFactor = (pdfHeight - 3 * m) / totalHeight;
    } else {
      const totalHeight = frontHeight + backHeight;
      scaleFactor = (pdfHeight - 3 * m) / totalHeight;
    }

    // ✅ Render Front
    if (outputs.Front) {
      const imgData = await renderHighResImage(
        outputs.Front,
        frontWidth,
        frontHeight,
        previewAdjust.Front.filters
      );
      pdf.addImage(
        imgData,
        "PNG",
        m,
        m,
        frontWidth * scaleFactor,
        frontHeight * scaleFactor
      );
    }

    // ✅ Render Back
    if (outputs.Back) {
      const imgData = await renderHighResImage(
        outputs.Back,
        backWidth,
        backHeight,
        previewAdjust.Back.filters
      );
      if (layout === "lr") {
        pdf.addImage(
          imgData,
          "PNG",
          m + frontWidth * scaleFactor + m,
          m,
          backWidth * scaleFactor,
          backHeight * scaleFactor
        );
      } else {
        pdf.addImage(
          imgData,
          "PNG",
          m,
          m + frontHeight * scaleFactor + m,
          backWidth * scaleFactor,
          backHeight * scaleFactor
        );
      }
    }

    // ✅ Render Photo inside Front dynamically
    if (outputs.Photo) {
      const imgData = await renderHighResImage(
        outputs.Photo,
        dims.Photo.width,
        dims.Photo.height,
        previewAdjust.Photo.filters
      );
      pdf.addImage(
        imgData,
        "PNG",
        m + previewAdjust.Photo.x * scaleFactor,
        m + previewAdjust.Photo.y * scaleFactor,
        dims.Photo.width * scaleFactor,
        dims.Photo.height * scaleFactor
      );
    }

    pdf.save("dynamic-high-res-id-card.pdf");
  }, [outputs, layout, dims, previewAdjust]);

  // --- wallet & role ---
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch {}
  }
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    const cost = 10;

    // ✅ If admin, skip wallet balance check
    if (role === "admin") {
      setShowConfirmPopup(true);
      return;
    }

    // ✅ For normal users, check balance
    if (balance >= cost) {
      setShowConfirmPopup(true);
    } else {
      setShowInsufficientPopup(true);
    }
  };

  const confirmDownload = async () => {
    setIsDownloading(true);
    const cost = 10;
    const success = await deductWallet("ID Card");
    if (success) {
      await downloadPDF();
      toast.success(`₹${cost} deducted from wallet`);
      setShowConfirmPopup(false);
      fetchBalance();
      setIsDownloading(false);
    } else {
      toast.error("Something went wrong!");
      setIsDownloading(false);
    }
  };

  useEffect(() => setZoom(area === "Photo" ? 1.4 : 1), [area]);
  const isPhotoArea = area === "Photo" && photoUploaded;

  const handleAutoEnhance = async () => {
    if (!outputs[area]) return;

    const img = new Image();
    img.src = outputs[area];
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = dims[area].width;
    canvas.height = dims[area].height;

    const ctx = canvas.getContext("2d");

    // Apply basic AI-like enhancements (adjust as needed)
    ctx.filter = "brightness(1.1) contrast(1.2) saturate(1.3)";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Convert to base64 and update the preview
    const enhancedImage = canvas.toDataURL("image/png", 1.0);

    setOutputs((prev) => ({
      ...prev,
      [area]: enhancedImage,
    }));

    toast.success("Auto enhancement applied!");
  };

  const onOpenFileClick = () => fileInputRef.current?.click();

  const onFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFile(file);
  };
  const getAspectRatio = (option) => {
    switch (option) {
      case "Govt ID 1":
        return 1.42; // Example: 85.6mm / 60.96mm (Credit Card size)
      case "Govt ID 2":
        return 1.59; // Example for another preset
      default:
        return undefined; // For custom
    }
  };

  const fixedAspectRatio = getAspectRatio(selectedType);
  console.log(cropperRef, 65678);

  const handleZoomChange = (e) => {
    const newZoom = Number(e.target.value);
    if (!cropperRef.current) return;

    // Calculate relative scale ratio
    const scaleRatio = newZoom / zoom;

    cropperRef.current.zoomImage(scaleRatio); // ✅ correct method

    setZoom(newZoom);
  };
  const containerWidth = 300; // maxWidth or parent width in px
  const scaleFactor = containerWidth / dims.Back.width;
  const selectedPhotoWidth = isCustom ? customWidth : dims.Photo.width;
  const selectedPhotoHeight = isCustom ? customHeight : dims.Photo.height;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* Editor Section */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Editor</h2>
              <button
                onClick={() => {
                  setImageSrc(null);
                  setOutputs({ Photo: null, Front: null, Back: null });
                  setEditingEnabled(false);
                  setPhotoUploaded(false);
                  setPreviewAdjust({
                    Photo: {
                      x: 0,
                      y: 0,
                      filters: {
                        brightness: 0,
                        contrast: 0,
                        saturation: 0,
                        shadows: 0,
                      },
                    },
                    Front: {
                      x: 0,
                      y: 0,
                      filters: {
                        brightness: 0,
                        contrast: 0,
                        saturation: 0,
                        shadows: 0,
                      },
                    },
                    Back: {
                      x: 0,
                      y: 0,
                      filters: {
                        brightness: 0,
                        contrast: 0,
                        saturation: 0,
                        shadows: 0,
                      },
                    },
                  });
                  setZoom(1);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-4 py-2 !bg-red-500 !text-white rounded-lg text-sm hover:bg-red-600"
              >
                Clear
              </button>
            </div>

            {editingEnabled && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1 text-gray-500">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={zoom}
                  onChange={handleZoomChange}
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            {!imageSrc ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-gray-50">
                <p className="text-sm mb-4 text-gray-500">
                  Open a PDF or Image to create ID Card
                </p>
                <button
                  onClick={onOpenFileClick}
                  className="px-6 py-2 rounded-lg !bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Open a New File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={onFileInputChange}
                />
              </div>
            ) : (
              <div
                className="relative custom-wrapper bg-gray-100 rounded-xl overflow-hidden"
                style={{ aspectRatio: dims[area].width / dims[area].height }}
              >
                {!editingEnabled ? (
                  <img
                    src={imageSrc}
                    alt="Selected"
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Cropper
                    ref={cropperRef}
                    src={imageSrc}
                    className="w-full h-full"
                    imageRestriction="none"
                    stencilProps={{
                      width: isCustom
                        ? (customWidth * dpi) / 25.4
                        : dims[area].width,
                      height: isCustom
                        ? (customHeight * dpi) / 25.4
                        : dims[area].height,
                      aspectRatio: isCustom
                        ? undefined
                        : dims[area].width / dims[area].height,
                      movable: isCustom,
                      resizable: isCustom,
                    }}
                    onChange={({ coordinates }) => {
                      if (isCustom && coordinates) {
                        // Convert px → mm for input
                        const widthMM = (coordinates.width * 25.4) / dpi;
                        const heightMM = (coordinates.height * 25.4) / dpi;

                        // Update inputs immediately
                        setCustomWidth(parseFloat(widthMM.toFixed(2)));
                        setCustomHeight(parseFloat(heightMM.toFixed(2)));
                      }
                    }}
                    minZoom={1}
                    maxZoom={10}
                    key={`${area}-${selectedType}-${isCustom}`}
                  />
                )}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Preview
            </h3>
            <div
              className={
                layout === "lr"
                  ? "grid grid-cols-2 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              {/* Front Preview */}
              <div className="border rounded-xl p-2">
                <div className="text-xs text-gray-500 mb-1">Front</div>
                <div
                  className="bg-gray-50 rounded-lg relative flex items-center justify-center overflow-hidden"
                  style={{
                    width: "100%", // Fit container width
                    aspectRatio: dims.Front.width / dims.Front.height, // maintain ratio
                    maxWidth: "300px", // optional max width
                  }}
                >
                  {outputs.Front && (
                    <img
                      src={outputs.Front}
                      alt="Front"
                      className="absolute w-full h-full object-contain"
                      style={{
                        left: previewAdjust.Front.x * scaleFactor,
                        top: previewAdjust.Front.y * scaleFactor,
                        filter: `brightness(${
                          100 + previewAdjust.Front.filters.brightness
                        }%) contrast(${
                          100 + previewAdjust.Front.filters.contrast
                        }%) saturate(${
                          100 + previewAdjust.Front.filters.saturation
                        }%)`,
                      }}
                    />
                  )}
                  {outputs.Photo && (
                    <img
                      src={outputs.Photo}
                      alt="Photo"
                      className="absolute object-contain"
                      style={{
                    width: `${photoWidth}px`,
height: `${photoHeight}px`,


                        left: `${previewAdjust.Photo.x * scaleFactor}px`,
                        top: `${previewAdjust.Photo.y * scaleFactor}px`,
                        filter: `brightness(${
                          100 + previewAdjust.Photo.filters.brightness
                        }%) contrast(${
                          100 + previewAdjust.Photo.filters.contrast
                        }%) saturate(${
                          100 + previewAdjust.Photo.filters.saturation
                        }%)`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Back Preview */}
              <div className="border rounded-xl p-2">
                <div className="text-xs text-gray-500 mb-1">Back</div>
                <div
                  className="bg-gray-50 rounded-lg relative flex items-center justify-center overflow-hidden"
                  style={{
                    width: "100%", // responsive
                    aspectRatio: dims.Back.width / dims.Back.height, // keep correct ratio
                    maxWidth: "300px", // optional for sidebar
                  }}
                >
                  {outputs.Back && (
                    <img
                      src={outputs.Back}
                      alt="Back"
                      className="absolute w-full h-full object-contain"
                      style={{
                        left: previewAdjust.Back.x * scaleFactor,
                        top: previewAdjust.Back.y * scaleFactor,
                        filter: `brightness(${
                          100 + previewAdjust.Back.filters.brightness
                        }%) contrast(${
                          100 + previewAdjust.Back.filters.contrast
                        }%) saturate(${
                          100 + previewAdjust.Back.filters.saturation
                        }%)`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Layout Switch */}
            <div className="flex gap-2 mt-4 items-center">
              <p className="text-xl text-gray-500">Layout:</p>
              <button
                onClick={() => setLayout("lr")}
                className={`px-3 py-1 rounded-full border text-xs ${
                  layout === "lr"
                    ? "!bg-black text-white"
                    : "!bg-white hover:bg-gray-100"
                }`}
              >
                Left & Right
              </button>
              <button
                onClick={() => setLayout("tb")}
                className={`px-3 py-1 rounded-full border text-xs ${
                  layout === "tb"
                    ? "!bg-black text-white"
                    : "!bg-white hover:bg-gray-100"
                }`}
              >
                Top & Bottom
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Sidebar Controls) */}
        <aside className="bg-white rounded-2xl shadow p-4 space-y-6">
          {/* Area Selection */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Area to Edit</h3>
            <div className="flex gap-2">
              {["Photo", "Front", "Back"].map((t) => (
                <button
                  key={t}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    area === t ? "!bg-black text-white" : "!bg-white"
                  }`}
                  onClick={() => setArea(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Card Type */}
          <div>
            <label className="block text-xs mb-1">Select Card Type</label>
            <select
              value={selectedType}
              onChange={(e) => {setSelectedType(e.target.value);}}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              {Object.keys(CARD_PRESETS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Dimension Inputs */}
          {/* Dimension Inputs */}
          <div>
            <div className="font-medium text-sm mb-2">Dimensions</div>
            {isCustom ? (
              <div className="grid grid-cols-2 gap-2">
                {/* Width Input */}
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setCustomWidth(value);
                     setPhotoWidth(value);

                    if (cropperRef.current) {
                      const widthPx = (value * dpi) / 25.4;
                      const heightPx = (customHeight * dpi) / 25.4;
                      cropperRef.current.setCoordinates({
                        width: widthPx,
                        height: heightPx,
                      });
                    }
                  }}
                  className="border rounded px-2 py-1 text-xs"
                  placeholder="Width (mm)"
                />

                {/* Height Input */}
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setCustomHeight(value);
                     setPhotoHeight(value);

                    if (cropperRef.current) {
                      const widthPx = (customWidth * dpi) / 25.4;
                      const heightPx = (value * dpi) / 25.4;
                      cropperRef.current.setCoordinates({
                        width: widthPx,
                        height: heightPx,
                      });
                    }
                  }}
                  className="border rounded px-2 py-1 text-xs"
                  placeholder="Height (mm)"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={dims[area].width}
                  disabled
                  className="border rounded px-2 py-1 text-xs"
                  placeholder="Width"
                />
                <input
                  type="number"
                  value={dims[area].height}
                  disabled
                  className="border rounded px-2 py-1 text-xs"
                  placeholder="Height"
                />
              </div>
            )}
          </div>

          {/* Photo Position Sliders */}
          {isPhotoArea && (
            <div>
              <h4 className="text-xs font-semibold mb-1">
                Adjust Photo Position
              </h4>
              <label className="text-xs text-gray-500">From Left</label>
              <input
                type="range"
                min={0}
                max={dims.Front.width - dims.Photo.width}
                value={previewAdjust.Photo.x}
                onChange={(e) =>
                  setPreviewAdjust((prev) => ({
                    ...prev,
                    Photo: { ...prev.Photo, x: Number(e.target.value) },
                  }))
                }
                className="w-full accent-blue-600 mb-2"
              />
              <label className="text-xs text-gray-500">From Top</label>
              <input
                type="range"
                min={0}
                max={dims.Front.height - dims.Photo.height}
                value={previewAdjust.Photo.y}
                onChange={(e) =>
                  setPreviewAdjust((prev) => ({
                    ...prev,
                    Photo: { ...prev.Photo, y: Number(e.target.value) },
                  }))
                }
                className="w-full accent-blue-600"
              />
            </div>
          )}

          {/* Filters */}
          <div>
            <h4 className="text-xs font-semibold mb-2">Filters</h4>
            {["brightness", "contrast", "saturation", "shadows"].map((f) => (
              <div key={f} className="mb-2">
                <label className="text-xs capitalize text-gray-500">{f}</label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={previewAdjust[area].filters[f]}
                  onChange={(e) =>
                    setPreviewAdjust((prev) => ({
                      ...prev,
                      [area]: {
                        ...prev[area],
                        filters: {
                          ...prev[area].filters,
                          [f]: Number(e.target.value),
                        },
                      },
                    }))
                  }
                  className={`w-full accent-blue-600 ${
                    !outputs[area] ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={!outputs[area]}
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <button
            onClick={doUpdate}
            className="w-full px-4 py-2 !bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Apply Crop
          </button>
          <button
            disabled={!outputs.Front && !outputs.Back}
            onClick={handleDownload}
            className={`w-full px-4 py-2 rounded-lg text-white 
    ${
      outputs.Front || outputs.Back
        ? "!bg-black hover:bg-gray-700"
        : "!bg-gray-400 text-gray-200 cursor-not-allowed pointer-events-none"
    }`}
          >
            Download PDF
          </button>
          <button
            onClick={handleAutoEnhance}
            disabled={!outputs[area]}
            className={`w-full px-4 py-2 mb-2 rounded-lg text-white ${
              outputs[area]
                ? "!bg-green-600 hover:bg-green-700"
                : "!bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Auto Enhance
          </button>
        </aside>
      </div>

      {/* Modals and Loader */}
      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 shadow-lg space-y-4 max-w-sm w-full">
            <p className="text-gray-700">
              ₹10 will be deducted from your wallet. Continue?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 !bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={isDownloading}
                onClick={confirmDownload}
                className={`!bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 ${
                  isDownloading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDownloading ? (
                  <>
                    <span className="loader border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  "Yes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInsufficientPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 shadow-lg space-y-4 max-w-sm w-full">
            <p className="text-gray-700">Insufficient balance. Recharge now!</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowInsufficientPopup(false)}
                className="px-4 py-2 !bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => (window.location.href = "/recharge")}
                className="px-4 py-2 !bg-black text-white rounded hover:bg-gray-800"
              >
                Recharge
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Enter PDF Password</h2>
            <input
              type="password"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              className="border rounded w-full p-2 mb-4"
              placeholder="Password"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPdfPassword("");
                  setPendingPDF(null);
                }}
                className="px-4 py-2 !bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={unlockPDF}
                className="px-4 py-2 !bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingPDF && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="!bg-white p-4 rounded-lg shadow-lg">
            Loading PDF...
          </div>
        </div>
      )}
    </div>
  );
}

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Cropper from "react-easy-crop";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import { useWallet } from "../../contexts/WalletContext";
import { deductWallet } from "../../api/auth";
import { toast } from "react-hot-toast";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const CARD_PRESETS = {
  "Govt ID 1": {
    Photo: { width: 94, height: 94 },
    Front: { width: 323, height: 204 },
    Back: { width: 323, height: 204 },
  },
  "Govt ID 2": {
    Photo: { width: 94, height: 94 },
    Front: { width: 323, height: 204 },
    Back: { width: 323, height: 204 },
  },
};

const OUTPUT_SIZES = {
  Photo: { width: 94, height: 94 },
  Front: { width: 323, height: 204 },
  Back: { width: 323, height: 204 },
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

async function getCroppedDataURL(imageSrc, cropPixels, outSize, filters) {
  const image = await new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = outSize.width;
  canvas.height = outSize.height;

  const b = clamp(100 + filters.brightness * 0.5, 0, 200);
  const c = clamp(100 + filters.contrast * 0.5, 0, 200);
  const s = clamp(100 + filters.saturation, 0, 200);
  const gamma = clamp(1 + filters.shadows / 100, 0.1, 5);

  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outSize.width,
    outSize.height
  );

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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [layout, setLayout] = useState("lr");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showInsufficientPopup, setShowInsufficientPopup] = useState(false);

  // ✅ password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pendingPDF, setPendingPDF] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const fileInputRef = useRef(null);
  const { balance, fetchBalance } = useWallet();

  useEffect(() => {
    if (selectedType === "Custom") {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    const preset = CARD_PRESETS[selectedType];
    if (preset)
      setDims({ Photo: preset.Photo, Front: preset.Front, Back: preset.Back });
  }, [selectedType]);

  const aspect = useMemo(
    () => dims[area].width / dims[area].height,
    [dims, area]
  );

  const onCropComplete = useCallback(
    (_, areaPixels) => setCroppedAreaPixels(areaPixels),
    []
  );

  const handleFile = async (file) => {
    const isPDF =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      const src = await readFileAsDataURL(file);
      setImageSrc(src);
      setCrop({ x: 0, y: 0 });
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
      setCrop({ x: 0, y: 0 });
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
      setCrop({ x: 0, y: 0 });
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
    if (!imageSrc || !croppedAreaPixels) return;
    const outSize = OUTPUT_SIZES[area];
    const dataUrl = await getCroppedDataURL(
      imageSrc,
      croppedAreaPixels,
      outSize,
      previewAdjust[area].filters
    );
    setOutputs((o) => ({ ...o, [area]: dataUrl }));
  }, [imageSrc, croppedAreaPixels, area, previewAdjust]);

  const downloadPDF = useCallback(() => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const m = 24;
    const front = outputs.Front;
    const back = outputs.Back;
    const photo = outputs.Photo;
    if (!front && !back) return;

    const frontX = m;
    const frontY = m;

    let backX = frontX;
    let backY = frontY;

    if (layout === "lr") {
      backX = frontX + dims.Front.width + m;
      backY = frontY;
    } else {
      backX = frontX;
      backY = frontY + dims.Front.height + m;
    }

    if (front)
      doc.addImage(
        front,
        "PNG",
        frontX,
        frontY,
        dims.Front.width,
        dims.Front.height
      );
    if (back)
      doc.addImage(
        back,
        "PNG",
        backX,
        backY,
        dims.Back.width,
        dims.Back.height
      );
    if (photo)
      doc.addImage(
        photo,
        "PNG",
        frontX + previewAdjust.Photo.x,
        frontY + previewAdjust.Photo.y,
        dims.Photo.width,
        dims.Photo.height
      );

    doc.save("id-card.pdf");
  }, [outputs, layout, dims, previewAdjust]);

  // Old style logic (kept as requested)
  const handleDownload = () => {
    const cost = 10;
    if (balance >= cost) {
      setShowConfirmPopup(true);
    } else {
      setShowInsufficientPopup(true);
    }
  };

  const confirmDownload = async () => {
    const cost = 10;
    const success = await deductWallet(cost);
    if (success) {
      toast.success(`₹${cost} deducted from wallet`);
      downloadPDF();
      setShowConfirmPopup(false);
      fetchBalance();
    } else toast.error("Something went wrong!");
  };

  useEffect(() => setZoom(area === "Photo" ? 1.4 : 1), [area]);
  const isPhotoArea = area === "Photo" && photoUploaded;

  return (
    <div className="min-h-screen bg-gray-50 !text-black">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium opacity-70">
                EDITOR
                <button
                  className="mt-2 w-full px-4 py-2 border rounded-lg bg-red-500 text-white"
                  onClick={() => {
                    setImageSrc(null);
                    setOutputs({ Photo: null, Front: null, Back: null });
                    setEditingEnabled(false);
                    setPhotoUploaded(false);
                    setCroppedAreaPixels(null);
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
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {!imageSrc ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                <p className="text-sm mb-4">
                  Open a PDF or Image to create ID Card
                </p>
                <button
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Open a New File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={async (e) =>
                    e.target.files?.[0] && (await handleFile(e.target.files[0]))
                  }
                />
              </div>
            ) : (
              <div className="relative aspect-[3/2] bg-gray-100 rounded-xl overflow-hidden">
                {!editingEnabled ? (
                  <img
                    src={imageSrc}
                    alt="Selected"
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    showGrid={false}
                    restrictPosition={false}
                  />
                )}
              </div>
            )}

            {editingEnabled && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Zoom</span>
                  <span className="opacity-70">{zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* PREVIEW */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm font-medium opacity-70 mb-3">PREVIEW</div>
            <div
              className={
                layout === "lr"
                  ? "grid grid-cols-2 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              <div
                style={{
                  width: layout === "lr" ? dims.Front.width : "100%",
                  height: dims.Front.height,
                }}
                className="border rounded-xl p-2 flex flex-col gap-2"
              >
                <div className="text-xs opacity-70">Front</div>
                <div
                  className="bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden relative"
                  style={{
                    width: layout === "lr" ? dims.Front.width : "100%",
                    height: dims.Front.height,
                  }}
                >
                  {outputs.Front && (
                    <img
                      src={outputs.Front}
                      alt="Front"
                      style={{
                        width: dims.Front.width,
                        height: dims.Front.height,
                        position: "absolute",
                        left: previewAdjust.Front.x,
                        top: previewAdjust.Front.y,
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
                      style={{
                        width: dims.Photo.width,
                        height: dims.Photo.height,
                        position: "absolute",
                        left: previewAdjust.Photo.x,
                        top: previewAdjust.Photo.y,
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

              <div
                style={{
                  width: layout === "lr" ? dims.Back.width : "100%",
                  height: dims.Back.height,
                }}
                className="border rounded-xl p-2 flex flex-col gap-2"
              >
                <div className="text-xs opacity-70">Back</div>
                <div
                  className="bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden relative"
                  style={{
                    width: layout === "lr" ? dims.Back.width : "100%",
                    height: dims.Back.height,
                  }}
                >
                  {outputs.Back && (
                    <img
                      src={outputs.Back}
                      alt="Back"
                      style={{
                        width: dims.Back.width,
                        height: dims.Back.height,
                        position: "absolute",
                        left: previewAdjust.Back.x,
                        top: previewAdjust.Back.y,
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
          </div>

          <div className="flex gap-2 mb-3">
            <span className="text-xs opacity-70">Preview Layout:</span>
            <button
              className={`px-2 py-1 text-xs rounded-full border ${
                layout === "lr" ? "bg-black text-white" : "bg-white"
              }`}
              onClick={() => setLayout("lr")}
            >
              Left & Right
            </button>
            <button
              className={`px-2 py-1 text-xs rounded-full border ${
                layout === "tb" ? "bg-black text-white" : "bg-white"
              }`}
              onClick={() => setLayout("tb")}
            >
              Top & Bottom
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <aside className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Area to Edit</div>
            <div className="flex gap-2">
              {["Photo", "Front", "Back"].map((t) => (
                <button
                  key={t}
                  className={`px-2 py-1 text-xs rounded-full border ${
                    area === t ? "!bg-black !text-white" : "!bg-white"
                  }`}
                  onClick={() => setArea(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm">
            <label className="block text-xs mb-1">Select Card Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border rounded px-2 py-2 text-sm"
            >
              {Object.keys(CARD_PRESETS).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
              <option value="Custom">Custom</option>
            </select>

            <div className="mt-4">
              <div className="font-medium text-sm mb-2">Dimension</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs opacity-70">Width</label>
                  <input
                    type="number"
                    value={dims[area].width}
                    disabled={!isCustom}
                    onChange={(e) =>
                      setDims((prev) => ({
                        ...prev,
                        [area]: {
                          ...prev[area],
                          width: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs opacity-70">Height</label>
                  <input
                    type="number"
                    value={dims[area].height}
                    disabled={!isCustom}
                    onChange={(e) =>
                      setDims((prev) => ({
                        ...prev,
                        [area]: {
                          ...prev[area],
                          height: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Photo Position */}
            {isPhotoArea && (
              <div className="mt-4">
                <div className="text-xs opacity-70 mb-1">
                  Adjust Photo Position
                </div>
                <label className="text-xs opacity-70">From Left</label>
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
                  className="w-full mb-2"
                />
                <label className="text-xs opacity-70">From Top</label>
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
                  className="w-full"
                />
              </div>
            )}

            {/* Filters */}
            <div className="mt-4 space-y-2">
              <div className="text-xs opacity-70">Filters</div>
              {["brightness", "contrast", "saturation", "shadows"].map((f) => (
                <div key={f}>
                  <label className="text-xs opacity-70 capitalize">{f}</label>
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
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <button
              className="mt-4 w-full px-4 py-2 bg-black text-white rounded-lg"
              onClick={doUpdate}
            >
              Apply Crop
            </button>
            <button
              disabled={!imageSrc}
              className="mt-2 w-full px-4 py-2 border rounded-lg"
              onClick={handleDownload}
            >
              Download PDF
            </button>
          </div>
        </aside>
      </div>

      {/* Confirm Download */}
      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 space-y-4">
            <p>₹10 will be deducted from your wallet. Continue?</p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-gray-300"
                onClick={() => setShowConfirmPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-black text-white"
                onClick={confirmDownload}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Balance */}
      {showInsufficientPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 space-y-4">
            <p>Insufficient balance. Recharge now!</p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-gray-300"
                onClick={() => setShowInsufficientPopup(false)}
              >
                Close
              </button>
              <button
                className="px-3 py-1 rounded bg-black text-white"
                onClick={() => (window.location.href = "/recharge")}
              >
                Recharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
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
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={unlockPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* optional simple loader */}
      {loadingPDF && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">Loading PDF...</div>
        </div>
      )}
    </div>
  );
}

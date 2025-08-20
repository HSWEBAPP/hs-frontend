import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const CARD_PRESETS = {
  "Govt ID 1": { Photo: { width: 66, height: 77 }, Front: { width: 1010, height: 640 }, Back: { width: 1010, height: 640 } },
  "Govt ID 2": { Photo: { width: 300, height: 300 }, Front: { width: 900, height: 600 }, Back: { width: 900, height: 600 } },
};

const OUTPUT_SIZES = { Photo: { width: 66, height: 77 }, Front: { width: 1600, height: 1000 }, Back: { width: 1600, height: 1000 } };

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function pdfFirstPageToDataURL(file, scale = 1) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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

  const [dims, setDims] = useState({
    Photo: CARD_PRESETS["Govt ID 1"].Photo,
    Front: CARD_PRESETS["Govt ID 1"].Front,
    Back: CARD_PRESETS["Govt ID 1"].Back,
  });

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [outputs, setOutputs] = useState({ Photo: null, Front: null, Back: null });
  const [layout, setLayout] = useState("lr");

  const [previewAdjust, setPreviewAdjust] = useState({
    Photo: { x: 0, y: 0, filters: { brightness: 0, contrast: 0, saturation: 0, shadows: 0 } },
    Front: { x: 0, y: 0, filters: { brightness: 0, contrast: 0, saturation: 0, shadows: 0 } },
    Back: { x: 0, y: 0, filters: { brightness: 0, contrast: 0, saturation: 0, shadows: 0 } },
  });

  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((_, areaPixels) => setCroppedAreaPixels(areaPixels), []);

  useEffect(() => {
    if (selectedType === "Custom") {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    const preset = CARD_PRESETS[selectedType];
    if (preset) setDims({ Photo: preset.Photo, Front: preset.Front, Back: preset.Back });
  }, [selectedType]);

  const aspect = useMemo(() => dims[area].width / dims[area].height, [dims, area]);

  const handleFile = async (file) => {
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const src = isPDF ? await pdfFirstPageToDataURL(file) : await readFileAsDataURL(file);
    setImageSrc(src);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setEditingEnabled(true);
    setPhotoUploaded(true);
  };

  const doUpdate = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const outSize = OUTPUT_SIZES[area];
    const dataUrl = await getCroppedDataURL(imageSrc, croppedAreaPixels, outSize, previewAdjust[area].filters);
    setOutputs((o) => ({ ...o, [area]: dataUrl }));
  }, [imageSrc, croppedAreaPixels, area, previewAdjust]);

  const downloadPDF = useCallback(() => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const front = outputs.Front || null;
    const back = outputs.Back || null;

    if (layout === "lr") {
      const m = 24;
      const boxW = (W - m * 3) / 2;
      const ratio = dims.Front.height / dims.Front.width;
      const boxH = boxW * ratio;
      if (front) doc.addImage(front, "PNG", m, m, boxW, boxH);
      if (back) doc.addImage(back, "PNG", m * 2 + boxW, m, boxW, boxH);
    } else {
      const m = 24;
      const boxW = W - m * 2;
      const ratio = dims.Front.height / dims.Front.width;
      const boxH = boxW * ratio;
      if (front) doc.addImage(front, "PNG", m, m, boxW, boxH);
      if (back) doc.addImage(back, "PNG", m, m * 2 + boxH, boxW, boxH);
    }
    doc.save("id-card.pdf");
  }, [outputs, layout, dims]);

  useEffect(() => setZoom(area === "Photo" ? 1.4 : 1), [area]);

  const isPhotoArea = area === "Photo" && photoUploaded;
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

  return (
    <div className="min-h-screen bg-gray-50 !text-black ">
      {/* <h1 className="text-2xl font-semibold mb-4">ID Card Printing</h1> */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: Editor + Preview */}
        <div className="space-y-6">
          {/* Editor */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium opacity-70">EDITOR</div>
              {/* <div className="flex items-center gap-2">
                {["Photo", "Front", "Back"].map((t) => (
                  <button key={t} className={`px-3 py-1 text-sm rounded-full border ${area === t ? "!bg-black !text-white" : "!bg-white"}`} onClick={() => setArea(t)}>{t}</button>
                ))}
              </div> */}
            </div>

            {!imageSrc ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                <p className="text-sm mb-4">Open a PDF or Image to create ID Card</p>
                <button className="px-4 py-2 rounded-lg bg-gray-900 text-white" onClick={() => fileInputRef.current?.click()}>Open a New File</button>
                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleFile(f); }} />
              </div>
            ) : (
              <div className="relative aspect-[3/2] bg-gray-100 rounded-xl overflow-hidden">
                {!editingEnabled ? (
                  <img src={imageSrc} alt="Selected file" className="object-contain w-full h-full" />
                ) : (
                  <div style={{ width: "100%", height: "100%" }}>
                    <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} showGrid={false} restrictPosition={false} />
                  </div>
                )}
              </div>
            )}

            {editingEnabled && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Zoom</span>
                  <span className="opacity-70">{zoom.toFixed(2)}x</span>
                </div>
                <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
              </div>
            )}
          </div>

          {/* PREVIEW */}
        {/* PREVIEW */}
<div className="bg-white rounded-2xl shadow p-4">
  <div className="text-sm font-medium opacity-70 mb-3">PREVIEW</div>

  {layout === "lr" ? (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: Front + Photo */}
      <div className="border rounded-xl p-2 flex flex-col gap-2">
        <div className="text-xs opacity-70">Front</div>
      <div className="bg-gray-50 rounded-lg h-48 flex items-center justify-center overflow-hidden relative">
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
      filter: `
        brightness(${100 + previewAdjust.Front.filters.brightness * 0.5}%)
        contrast(${100 + previewAdjust.Front.filters.contrast * 0.5}%)
        saturate(${100 + previewAdjust.Front.filters.saturation}%)
      `
    }}
  />
)}

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
      filter: `
        brightness(${100 + previewAdjust.Back.filters.brightness * 0.5}%)
        contrast(${100 + previewAdjust.Back.filters.contrast * 0.5}%)
        saturate(${100 + previewAdjust.Back.filters.saturation}%)
      `
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
      filter: `
        brightness(${100 + previewAdjust.Photo.filters.brightness * 0.5}%)
        contrast(${100 + previewAdjust.Photo.filters.contrast * 0.5}%)
        saturate(${100 + previewAdjust.Photo.filters.saturation}%)
      `
    }}
  />
)}

</div>

      </div>

      {/* Right: Back */}
      <div className="border rounded-xl p-2 flex flex-col gap-2">
        <div className="text-xs opacity-70">Back</div>
        <div className="bg-gray-50 rounded-lg h-48 flex items-center justify-center overflow-hidden">
          {outputs.Back ? (
            <img
              src={outputs.Back}
              alt="Back"
              className="object-contain w-full h-full"
            />
          ) : (
            <span className="text-xs opacity-60">No Back yet. Click Update above.</span>
          )}
        </div>
      </div>
    </div>
  ) : (
    // layout === "tb"
    <div className="flex flex-col gap-4">
      {/* Top: Front + Photo */}
      <div className="border rounded-xl p-2 flex flex-col gap-2">
        <div className="text-xs opacity-70">Front</div>
        <div className="bg-gray-50 rounded-lg h-48 flex items-center justify-center overflow-hidden relative">
          {outputs.Front && (
            <img
              src={outputs.Front}
              alt="Front"
              className="object-contain w-full h-full"
            />
          )}
          {outputs.Photo && (
            <img
              src={outputs.Photo}
              alt="Photo"
              style={{
                width: dims.Photo.width,
                height: dims.Photo.height,
                top: crop.y,
                left: crop.x,
                position: "absolute",
              }}
            />
          )}
          {!outputs.Front && !outputs.Photo && (
            <span className="text-xs opacity-60">
              No Front or Photo yet. Click Update above.
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Back */}
      <div className="border rounded-xl p-2 flex flex-col gap-2">
        <div className="text-xs opacity-70">Back</div>
        <div className="bg-gray-50 rounded-lg h-48 flex items-center justify-center overflow-hidden">
          {outputs.Back ? (
            <img
              src={outputs.Back}
              alt="Back"
              className="object-contain w-full h-full"
            />
          ) : (
            <span className="text-xs opacity-60">No Back yet. Click Update above.</span>
          )}
        </div>
      </div>
    </div>
  )}
</div>


          {/* PDF Controls */}
          <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span>Output PDF Layout :</span>
              <button className={`px-3 py-1 rounded border ${layout === "lr" ? "!bg-black !text-white" : ""}`} onClick={() => setLayout("lr")}>Left & Right</button>
              <button className={`px-3 py-1 rounded border ${layout === "tb" ? "!bg-black !text-white" : ""}`} onClick={() => setLayout("tb")}>Top & Bottom</button>
            </div>
            <button className="px-4 py-2 rounded-lg !bg-gray-900 !text-white disabled:opacity-50" onClick={downloadPDF} disabled={!outputs.Front && !outputs.Back}>Download PDF</button>
          </div>
        </div>

        {/* RIGHT: Controls */}
        <aside className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Area to Edit</div>
            <div className="flex gap-2">
              {["Photo", "Front", "Back"].map((t) => (
                <button key={t} className={`px-2 py-1 text-xs rounded-full border ${area === t ? "!bg-black !text-white" : "!bg-white"}`} onClick={() => setArea(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm">
            <label className="block text-xs mb-1">Select Card Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full border rounded px-2 py-2 text-sm">
              {Object.keys(CARD_PRESETS).map((k) => <option key={k} value={k}>{k}</option>)}
              <option value="Custom">Custom</option>
            </select>

            <div className="mt-4">
              <div className="font-medium text-sm mb-2">Dimension</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1">Width</label>
                  <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={dims[area].width} onChange={(e) => setDims((d) => ({ ...d, [area]: { ...d[area], width: Number(e.target.value) || 1 } }))} disabled={!isCustom} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Height</label>
                  <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={dims[area].height} onChange={(e) => setDims((d) => ({ ...d, [area]: { ...d[area], height: Number(e.target.value) || 1 } }))} disabled={!isCustom} />
                </div>
              </div>
            </div>

           <div className="mt-4">
  <div className="font-medium text-sm mb-2">Position Adjustment</div>
 <div className="grid grid-cols-2 gap-2 items-center">
  <span className="text-xs">From Left</span>
  <input
    type="range"
    min={0}
    max={100}
    value={Math.round(
      ((previewAdjust[area].x - Math.min(0, dims.Front.width - dims.Photo.width)) /
        (Math.max(0, dims.Front.width - dims.Photo.width) -
          Math.min(0, dims.Front.width - dims.Photo.width))) *
        100
    )}
    onChange={(e) => {
      if (area === "Photo" && outputs.Photo) {
        const minX = Math.min(0, dims.Front.width - dims.Photo.width);
        const maxX = Math.max(0, dims.Front.width - dims.Photo.width);
        const newX = minX + ((Number(e.target.value) / 100) * (maxX - minX));
        setPreviewAdjust((p) => ({
          ...p,
          [area]: { ...p[area], x: newX },
        }));
      }
    }}
    disabled={!(area === "Photo" && outputs.Photo)}
  />

  <span className="text-xs">From Top</span>
  <input
    type="range"
    min={0}
    max={100}
    value={Math.round(
      ((previewAdjust[area].y - Math.min(0, dims.Front.height - dims.Photo.height)) /
        (Math.max(0, dims.Front.height - dims.Photo.height) -
          Math.min(0, dims.Front.height - dims.Photo.height))) *
        100
    )}
    onChange={(e) => {
      if (area === "Photo" && outputs.Photo) {
        const minY = Math.min(0, dims.Front.height - dims.Photo.height);
        const maxY = Math.max(0, dims.Front.height - dims.Photo.height);
        const newY = minY + ((Number(e.target.value) / 100) * (maxY - minY));
        setPreviewAdjust((p) => ({
          ...p,
          [area]: { ...p[area], y: newY },
        }));
      }
    }}
    disabled={!(area === "Photo" && outputs.Photo)}
  />
</div>

</div>


            <div className="mt-4">
              <div className="font-medium text-sm mb-2">Image Correction</div>
              {["brightness", "contrast", "saturation", "shadows"]              .map((f) => (
                <div key={f} className="mb-3">
                  <div className="text-xs mb-1">{f}</div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={previewAdjust[area].filters[f]}
                    onChange={(e) =>
                      setPreviewAdjust((p) => ({
                        ...p,
                        [area]: {
                          ...p[area],
                          filters: { ...p[area].filters, [f]: Number(e.target.value) },
                        },
                      }))
                    }
                  />
                </div>
              ))}
              <button
                className="px-4 py-2 bg-black text-white rounded-lg w-full mt-2"
                onClick={doUpdate}
              >
                Update Image
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


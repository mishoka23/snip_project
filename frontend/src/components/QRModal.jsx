import { QRCodeCanvas } from "qrcode.react";

function QRModal({ shortUrl, onClose }) {
  if (!shortUrl) {
    return null;
  }

  const handleDownload = () => {
    const canvas = document.getElementById("short-url-qr-code");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "snip-qr-code.png";
    downloadLink.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">QR Code</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Close
          </button>
        </div>

        <div className="flex justify-center rounded border border-gray-200 p-4">
          <QRCodeCanvas
            id="short-url-qr-code"
            value={shortUrl}
            size={220}
            includeMargin
          />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="mt-4 w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}

export default QRModal;
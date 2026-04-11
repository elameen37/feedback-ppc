import QRCode from "qrcode";

export async function generateQRDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#006400", light: "#ffffff" },
  });
}

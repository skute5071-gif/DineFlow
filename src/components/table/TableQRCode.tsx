import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, ExternalLink, Check } from 'lucide-react';

interface TableQRCodeProps {
  url: string;
  tableNumber: string;
  restaurantName: string;
  areaName?: string;
  size?: number;
  showActions?: boolean;
}

export const TableQRCode: React.FC<TableQRCodeProps> = ({
  url,
  tableNumber,
  restaurantName,
  areaName = 'Dining Area',
  size = 180,
  showActions = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#38080B', // Deep royal maroon for distinct branding
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) {
          console.error('[QR] Error generating QR code:', error);
        } else if (canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL('image/png'));
        }
      }
    );
  }, [url, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${restaurantName.replace(/\s+/g, '_')}_Table_${tableNumber}_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=750');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${restaurantName} - Table ${tableNumber} QR Card</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body {
              font-family: 'Georgia', serif;
              text-align: center;
              padding: 24px;
              margin: 0;
              background-color: #FAF6F0;
              color: #2D080A;
            }
            .card {
              border: 3px double #CBA24B;
              border-radius: 20px;
              padding: 32px 24px;
              background: #FFFDF9;
              box-shadow: 0 4px 16px rgba(0,0,0,0.08);
              max-width: 420px;
              margin: 0 auto;
            }
            .brand {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 2px;
              color: #7D151B;
              margin: 0;
              text-transform: uppercase;
            }
            .tagline {
              font-size: 12px;
              color: #8C6D23;
              margin-top: 4px;
              font-weight: bold;
            }
            .table-badge {
              display: inline-block;
              background: #7D151B;
              color: #FFFDF9;
              font-size: 22px;
              font-weight: bold;
              padding: 8px 24px;
              border-radius: 30px;
              margin: 18px 0;
              letter-spacing: 1px;
            }
            .area {
              font-size: 12px;
              color: #737373;
              margin-bottom: 12px;
            }
            .qr-wrapper {
              background: white;
              display: inline-block;
              padding: 14px;
              border-radius: 16px;
              border: 1px solid #E5D7B7;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            .qr-wrapper img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .instructions {
              margin-top: 20px;
              font-size: 13px;
              line-height: 1.5;
              color: #444;
            }
            .instructions strong {
              color: #7D151B;
            }
            .url {
              margin-top: 12px;
              font-family: monospace;
              font-size: 10px;
              color: #999;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="brand">${restaurantName}</h1>
            <div class="tagline">Pure Veg & Family Restaurant</div>
            <div class="table-badge">TABLE ${tableNumber}</div>
            <div class="area">${areaName}</div>
            <div class="qr-wrapper">
              <img src="${dataUrl}" alt="QR Code for Table ${tableNumber}" />
            </div>
            <div class="instructions">
              <strong>Scan with Phone Camera</strong><br/>
              View Digital Menu & Place Order Directly
            </div>
            <div class="url">${url}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-2xl border border-[#EDE5D5] shadow-2xs">
      <div className="p-2 bg-white rounded-xl border border-stone-100 shadow-inner">
        <canvas ref={canvasRef} className="rounded-lg block" />
      </div>

      <div className="text-center mt-2.5">
        <div className="text-xs font-bold text-stone-900">Table {tableNumber}</div>
        <div className="text-[10px] text-stone-500 truncate max-w-[170px]">{areaName}</div>
      </div>

      {showActions && (
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-stone-100 w-full justify-center">
          <button
            onClick={handleDownload}
            className="p-1.5 text-stone-600 hover:text-[#7D151B] hover:bg-[#FAF1F1] rounded-lg transition-colors cursor-pointer"
            title="Download QR Image (.PNG)"
            aria-label="Download QR"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePrint}
            className="p-1.5 text-stone-600 hover:text-[#7D151B] hover:bg-[#FAF1F1] rounded-lg transition-colors cursor-pointer"
            title="Print Table Stand Card"
            aria-label="Print Card"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyLink}
            className="p-1.5 text-stone-600 hover:text-[#7D151B] hover:bg-[#FAF1F1] rounded-lg transition-colors cursor-pointer"
            title="Copy Table QR Link"
            aria-label="Copy Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};

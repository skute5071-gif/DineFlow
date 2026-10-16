import React from 'react';
import { useTable } from '../../context/TableContext';
import { QrCode, Lock } from 'lucide-react';

interface TableIndicatorProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Table indicator:
 * - When scanned via QR code (isQRLocked): shows Table number with locked badge, preventing accidental changes.
 * - When in demo walk-in mode: allows opening the QR simulator / table switcher.
 */
export const TableIndicator: React.FC<TableIndicatorProps> = ({
  className = '',
  size = 'md',
}) => {
  const { tableNumber, hasDetectedTable, isQRLocked, openQRModal } = useTable();

  if (hasDetectedTable && tableNumber) {
    return (
      <button
        onClick={openQRModal}
        className={`inline-flex items-center gap-1.5 bg-[#FAF1F1] hover:bg-[#FAF1F1]/80 text-[#7D151B] border border-[#7D151B]/30 font-bold rounded-lg transition-all cursor-pointer shadow-2xs ${
          size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
        } ${className}`}
        title={isQRLocked ? `Table ${tableNumber} (Verified by Table QR Scan)` : `Table ${tableNumber} · Click to manage`}
      >
        {isQRLocked ? (
          <Lock className="w-3 h-3 text-[#15803D] shrink-0" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse shrink-0" />
        )}
        <span className="tracking-tight">Table {tableNumber}</span>
        {isQRLocked && (
          <span className="text-[9px] bg-[#15803D]/10 text-[#15803D] px-1 py-0.2 rounded font-semibold uppercase hidden sm:inline">
            QR Locked
          </span>
        )}
      </button>
    );
  }

  // When no table number exists in URL (demonstration mode)
  return (
    <button
      onClick={openQRModal}
      className={`inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 font-semibold rounded-lg transition-all cursor-pointer ${
        size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
      } ${className}`}
      title="Click to select a table or simulate table QR scan"
    >
      <QrCode className="w-3.5 h-3.5 text-stone-500" />
      <span>Select Table</span>
    </button>
  );
};

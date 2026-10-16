import React, { useState } from 'react';
import { useTable } from '../../context/TableContext';
import { useLanguage } from '../../context/LanguageContext';
import { SAMPLE_TABLES, RESTAURANT_CONFIG } from '../../data/mockData';
import { X, QrCode, Check, Utensils, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export const TableSelectorModal: React.FC = () => {
  const { tableNumber, hasDetectedTable, setTable, clearTable, isQRModalOpen, closeQRModal, areaName, restaurantId } = useTable();
  const { t } = useLanguage();
  const [selectedNum, setSelectedNum] = useState(tableNumber || '5');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'qrSimulator'>('tables');

  if (!isQRModalOpen) return null;

  const handleSelectTable = (num: string, area?: string) => {
    setSelectedNum(num);
    setTable(num, area);
    closeQRModal();
  };

  const handleTestUrl = (tableNum?: string) => {
    if (tableNum) {
      setTable(tableNum);
    } else {
      clearTable();
    }
    closeQRModal();
  };

  const currentUrl = `${window.location.origin}/menu?restaurantId=${restaurantId}&tableNumber=${selectedNum || '5'}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FFFDF9] rounded-2xl border border-[#EDE5D5] shadow-2xl overflow-hidden text-[#241A18]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7D151B] to-[#4E0D11] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#CBA24B]/20 border border-[#CBA24B]/50 flex items-center justify-center text-[#E2BF6F]">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">Table QR Simulator</h3>
              <p className="text-[11px] text-[#E2BF6F]">Hotel Veg Maharaja · Contactless Ordering</p>
            </div>
          </div>
          <button
            onClick={closeQRModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#EDE5D5] bg-[#F6F0E6]/50 p-1.5 gap-1.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-white text-[#7D151B] shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Select Table Number</span>
          </button>
          <button
            onClick={() => setActiveTab('qrSimulator')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'qrSimulator'
                ? 'bg-white text-[#7D151B] shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR URL Parameters</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'tables' ? (
            <div>
              {/* Current Active Table Card */}
              <div className="bg-[#FAF1F1] border border-[#7D151B]/20 rounded-xl p-3.5 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7D151B]">
                    Status
                  </span>
                  <div className="text-base font-bold text-[#4E0D11] flex items-center gap-2">
                    {hasDetectedTable && tableNumber ? (
                      <>
                        <span>Table {tableNumber}</span>
                        <span className="text-xs text-stone-500 font-normal">({areaName})</span>
                      </>
                    ) : (
                      <>
                        <span>Demo Mode (No Table Set)</span>
                        <span className="text-xs text-stone-500 font-normal">(Browsing Menu)</span>
                      </>
                    )}
                  </div>
                </div>

                {hasDetectedTable ? (
                  <button
                    onClick={clearTable}
                    className="text-[11px] text-stone-500 hover:text-red-700 underline cursor-pointer"
                  >
                    Clear (Demo)
                  </button>
                ) : (
                  <span className="text-[11px] bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded">
                    Demo
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 mb-3 font-medium">
                Choose a table or select where your family is seated:
              </p>

              {/* Sample Tables Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto pr-1">
                {SAMPLE_TABLES.map(t => {
                  const isCurrent = t.number === tableNumber;
                  return (
                    <button
                      key={t.number}
                      onClick={() => handleSelectTable(t.number, t.area)}
                      className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                        isCurrent
                          ? 'border-[#7D151B] bg-[#7D151B]/10 ring-1 ring-[#7D151B]'
                          : 'border-[#EDE5D5] bg-white hover:border-[#CBA24B] hover:bg-[#FDFBF7]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-stone-900">Table {t.number}</span>
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-[#7D151B]" />}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                        {t.area.split('·')[1] || t.area}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Table Number Input */}
              <div className="mt-4 pt-4 border-t border-[#EDE5D5] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Table No. (e.g. 5)"
                  value={selectedNum}
                  onChange={e => setSelectedNum(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-[#EDE5D5] rounded-lg focus:outline-none focus:border-[#7D151B]"
                />
                <button
                  onClick={() => handleSelectTable(selectedNum || '5')}
                  className="px-4 py-2 bg-[#7D151B] text-white text-xs font-bold rounded-lg hover:bg-[#671116] transition-colors cursor-pointer"
                >
                  Set Table
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#F6F0E6] rounded-xl text-xs space-y-1">
                <p className="font-bold text-stone-800">Direct QR URL Structure:</p>
                <p className="font-mono text-[#7D151B] text-[11px] break-all">
                  /menu?restaurantId=veg-maharaja-main&tableNumber=5
                </p>
              </div>

              <p className="text-xs text-stone-600">
                Test how the customer flow detects table and restaurant information from QR codes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleTestUrl('5')}
                  className="p-3 rounded-xl border border-[#EDE5D5] bg-white hover:border-[#7D151B] text-left transition-all cursor-pointer"
                >
                  <p className="font-bold text-xs text-stone-900">Table 5 (Standard QR)</p>
                  <p className="text-[10px] text-stone-500 font-mono">tableNumber=5</p>
                </button>

                <button
                  onClick={() => handleTestUrl('12')}
                  className="p-3 rounded-xl border border-[#EDE5D5] bg-white hover:border-[#7D151B] text-left transition-all cursor-pointer"
                >
                  <p className="font-bold text-xs text-stone-900">Table 12 (AC Hall QR)</p>
                  <p className="text-[10px] text-stone-500 font-mono">tableNumber=12</p>
                </button>

                <button
                  onClick={() => handleTestUrl('2')}
                  className="p-3 rounded-xl border border-[#EDE5D5] bg-white hover:border-[#7D151B] text-left transition-all cursor-pointer"
                >
                  <p className="font-bold text-xs text-stone-900">Table 2 (Family Booth)</p>
                  <p className="text-[10px] text-stone-500 font-mono">tableNumber=2</p>
                </button>

                <button
                  onClick={() => handleTestUrl()}
                  className="p-3 rounded-xl border border-[#EDE5D5] bg-white hover:border-[#7D151B] text-left transition-all cursor-pointer"
                >
                  <p className="font-bold text-xs text-stone-900">No Table (Demo Mode)</p>
                  <p className="text-[10px] text-stone-500 font-mono">No tableNumber parameter</p>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EDE5D5] flex items-center justify-between text-xs">
                <span className="font-mono text-stone-500 truncate max-w-[260px]">
                  {currentUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-[#7D151B] font-bold hover:underline shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy QR Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

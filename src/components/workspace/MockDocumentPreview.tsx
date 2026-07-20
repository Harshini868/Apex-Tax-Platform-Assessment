import React from 'react';
import type { SourceDocument } from '../../domain/document';
import { FileText, Eye } from 'lucide-react';

interface MockDocumentPreviewProps {
  document: SourceDocument;
  highlightedRegionId: string | null;
}

export const MockDocumentPreview: React.FC<MockDocumentPreviewProps> = ({
  document,
  highlightedRegionId,
}) => {
  const activePage = document.pages[0];
  const activeRegion = activePage?.highlightedRegions.find(
    (reg) => reg.id === highlightedRegionId
  );

  return (
    <div className="space-y-4">
      {/* Header details */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--color-primary-action)]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {document.fileName}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] text-[var(--color-text-secondary)]">
            Page {activePage?.pageNumber || 1} of {document.pageCount}
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-secondary)] italic">
          Simulated Document Viewer
        </span>
      </div>

      {/* Screen Reader Alternative */}
      <div className="sr-only">
        Simulated preview of {document.documentType}.
        {activeRegion
          ? `Highlighting ${activeRegion.label} showing extracted value "${activeRegion.extractedText}".`
          : 'No active highlighting in document view.'}
      </div>

      {/* Document layout canvas */}
      <div className="relative w-full aspect-[4/3] bg-white rounded border border-gray-300 shadow-inner overflow-hidden text-gray-900 p-6 select-none font-mono text-[10px] leading-tight">
        
        {/* Highlight Bounding Box overlay */}
        {activeRegion && (
          <div
            className="absolute border-2 border-purple-600 bg-purple-200/30 rounded shadow-md z-10 flex items-center justify-center"
            style={{
              left: `${activeRegion.xPercent}%`,
              top: `${activeRegion.yPercent}%`,
              width: `${activeRegion.widthPercent}%`,
              height: `${activeRegion.heightPercent}%`,
            }}
          >
            {/* Visual focus frame inside Box */}
            <div className="absolute inset-0 border border-dashed border-purple-400 opacity-60" />
            <span className="absolute -top-4 left-0 bg-purple-600 text-white font-sans text-[8px] font-bold px-1 rounded shadow-sm flex items-center gap-0.5">
              <Eye className="h-2 w-2" />
              AI Trace Match
            </span>
          </div>
        )}

        {/* Dynamic Styled Document Templates */}
        {activePage?.previewType === 'W2' && (
          <div className="w-full h-full flex flex-col border border-black p-2 bg-gray-50/50">
            <div className="flex border-b border-black text-center font-sans font-bold text-xs pb-1">
              <div className="flex-1 text-left">Form W-2 Wage and Tax Statement</div>
              <div className="text-right">2025</div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-px bg-black border border-black mt-2">
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">a Control number</span>
                <span className="font-semibold">CN-98234-AX</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">1 Wages, tips, other comp.</span>
                <span className="text-xs font-bold font-mono">152,500.00</span>
              </div>

              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">b Employer EIN</span>
                <span className="font-semibold">XX-XXX8812</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">2 Federal income tax withheld</span>
                <span className="text-xs font-bold font-mono">31,250.00</span>
              </div>

              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">c Employer name, address, ZIP</span>
                <span className="font-semibold block">Apex Software Corp</span>
                <span>100 Technology Dr, Boston, MA</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">3 Social security wages</span>
                <span>152,500.00</span>
              </div>

              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">d Employee SSN</span>
                <span className="font-semibold">XXX-XX-5541</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">4 Social security tax withheld</span>
                <span>9,455.00</span>
              </div>

              <div className="col-span-12 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">e Employee name, address, ZIP</span>
                <span className="font-bold block">John Miller</span>
                <span>45 Elm Street, Apt 3B, Boston, MA 02116</span>
              </div>
            </div>
            <div className="text-[7px] text-gray-400 font-sans mt-1 text-center">
              Copy B - To Be Filed With Employee's Federal Tax Return
            </div>
          </div>
        )}

        {activePage?.previewType === '1099B' && (
          <div className="w-full h-full flex flex-col border border-black p-2 bg-gray-50/50">
            <div className="flex border-b border-black text-center font-sans font-bold text-xs pb-1">
              <div className="flex-1 text-left">Form 1099-B Proceeds From Broker Transactions</div>
              <div className="text-right">2025</div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-px bg-black border border-black mt-2">
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">Payer Name & EIN</span>
                <span className="font-bold block">Fidelity Brokerage LLC</span>
                <span>EIN: XX-XXX1942</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">1a Description of property</span>
                <span className="font-semibold">100 SHRS APPL INC</span>
              </div>

              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">Recipient Name</span>
                <span className="font-bold block">John Miller</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">1d Stock Proceeds</span>
                <span className="text-xs font-bold font-mono text-gray-900 filter blur-[0.6px]">84,750.00</span>
              </div>

              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">Recipient SSN</span>
                <span>XXX-XX-5541</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">1e Cost or other basis</span>
                <span>62,000.00</span>
              </div>
            </div>
            <div className="text-[7px] text-gray-400 font-sans mt-1 text-center">
              Copy B - For Recipient
            </div>
          </div>
        )}

        {activePage?.previewType === '1099INT' && (
          <div className="w-full h-full flex flex-col border border-black p-2 bg-gray-50/50">
            <div className="flex border-b border-black text-center font-sans font-bold text-xs pb-1">
              <div className="flex-1 text-left">Form 1099-INT Interest Income</div>
              <div className="text-right">2025</div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-px bg-black border border-black mt-2">
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">Payer Name</span>
                <span className="font-bold block">
                  {document.id.includes('chase') ? 'Chase Bank N.A.' : 'Wells Fargo Bank N.A.'}
                </span>
                <span>Payer EIN: XX-XXX4912</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">1 Interest income</span>
                <span className="text-xs font-bold font-mono">
                  {document.id.includes('chase') ? '1,200.00' : '1,800.00'}
                </span>
              </div>

              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">Recipient Name</span>
                <span className="font-bold block">John Miller</span>
              </div>
              <div className="col-span-6 bg-white p-1">
                <span className="block text-[8px] font-bold text-gray-500">2 Early withdrawal penalty</span>
                <span>0.00</span>
              </div>
            </div>
            <div className="text-[7px] text-gray-400 font-sans mt-1 text-center">
              Copy B - For Recipient
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default MockDocumentPreview;

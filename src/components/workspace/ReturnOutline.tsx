import React, { useState } from 'react';
import type { TaxReturn } from '../../domain/return';
import { FieldStatusBadge } from './FieldStatusBadge';
import { Search, X, FileText } from 'lucide-react';

interface ReturnOutlineProps {
  curatedReturn: TaxReturn;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
}

export const ReturnOutline: React.FC<ReturnOutlineProps> = ({
  curatedReturn,
  selectedFieldId,
  onSelectField,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Filter sections and fields based on search input
  const filteredSections = curatedReturn.sections
    .map((section) => {
      const matchingFields = section.fields.filter((field) => {
        const query = searchQuery.toLowerCase();
        return (
          field.label.toLowerCase().includes(query) ||
          field.lineReference.toLowerCase().includes(query) ||
          field.verificationState.toLowerCase().includes(query)
        );
      });
      return { ...section, fields: matchingFields };
    })
    .filter((section) => section.fields.length > 0);

  const totalFilteredFieldsCount = filteredSections.reduce(
    (acc, sec) => acc + sec.fields.length,
    0
  );

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface-bg)] rounded-lg border border-[var(--color-border-custom)] overflow-hidden">
      {/* Search Input Header */}
      <div className="p-4 border-b border-[var(--color-border-custom)]">
        <label htmlFor="outline-search" className="sr-only">Search tax forms</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
          <input
            id="outline-search"
            type="text"
            placeholder="Search lines, labels, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded-md text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:border-[var(--color-focus-indicator)]"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
            Found {totalFilteredFieldsCount} matches
          </div>
        )}
      </div>

      {/* Checklist Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredSections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              No forms or lines match your search.
            </p>
            <button
              onClick={handleClearSearch}
              className="px-3 py-1.5 bg-[var(--color-surface-elevated-bg)] border border-[var(--color-border-custom)] rounded-md text-xs font-semibold hover:bg-[var(--color-border-custom)]"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div key={section.id} className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] px-2">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.fields.map((field) => {
                  const isSelected = field.id === selectedFieldId;
                  return (
                    <div
                      key={field.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectField(field.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectField(field.id);
                        }
                      }}
                      className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[var(--color-surface-elevated-bg)] border-[var(--color-primary-action)] ring-1 ring-[var(--color-primary-action)] font-semibold'
                          : 'bg-transparent border-transparent hover:bg-[var(--color-surface-elevated-bg)]/50'
                      }`}
                      aria-current={isSelected ? 'true' : undefined}
                      aria-label={`${field.lineReference}: ${field.label}, current value ${field.formattedValue}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`h-5 w-5 ${isSelected ? 'text-[var(--color-primary-action)]' : 'text-[var(--color-text-secondary)]'}`} aria-hidden="true" />
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                            {field.lineReference}
                          </span>
                          <span className="text-sm text-[var(--color-text-primary)]">
                            {field.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end text-right gap-1">
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">
                          {field.formattedValue}
                        </span>
                        <FieldStatusBadge state={field.verificationState} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default ReturnOutline;

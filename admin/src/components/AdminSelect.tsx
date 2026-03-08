
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
}

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export default function AdminSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = Math.min(options.length * 42, 280);
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [options.length]);

  useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current && !ref.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => { if (open) updatePosition(); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, updatePosition]);

  const dropdownContent = open && (
    <div
      ref={ref}
      style={{
        ...dropdownStyle,
        background: 'linear-gradient(160deg, #1e1812 0%, #0f0b08 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.15)',
        backdropFilter: 'blur(16px)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(212,175,55,0.25)',
        overflow: 'hidden',
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange(opt.value);
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-all duration-150 ${
              isActive
                ? 'text-primary-gold bg-primary-gold/15 font-semibold'
                : 'text-gray-300 hover:text-white hover:bg-primary-gold/10'
            }`}
          >
            <span className="w-4 flex-shrink-0 flex items-center justify-center">
              {isActive && (
                <svg className="w-3.5 h-3.5 text-primary-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
          open
            ? 'border-primary-gold bg-primary-gold/10 text-white'
            : 'border-primary-gold/30 bg-dark-input text-white hover:border-primary-gold/60 hover:bg-primary-gold/5'
        }`}
      >
        <span className={selected ? 'text-white' : 'text-gray-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-primary-gold flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {typeof window !== 'undefined' && dropdownContent
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  );
}


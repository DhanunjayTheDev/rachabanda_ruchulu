import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  disabled?: boolean;
}

export default function AdminSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  disabled = false,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = Math.min(options.length * 45 + 16, 300);
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    const style: React.CSSProperties = {
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 10000,
    };

    if (openUpward) {
      style.bottom = window.innerHeight - rect.top + 8;
    } else {
      style.top = rect.bottom + 8;
    }

    setDropdownStyle(style);
  }, [options.length]);

  useEffect(() => {
    if (open) {
      updatePosition();
      // Second update to ensure animation start doesn't jitter
      const timer = setTimeout(updatePosition, 10);
      return () => clearTimeout(timer);
    }
  }, [open, updatePosition]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
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

  const dropdownComponent = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={dropdownStyle}
          className="bg-[#1a1612] border border-primary-gold/30 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden py-2"
        >
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!disabled) {
                      onChange(opt.value);
                      setOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${isActive
                      ? 'bg-primary-gold/10 text-primary-gold font-bold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-transparent'}`} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative isolate ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-300 ${open
            ? 'border-primary-gold bg-primary-gold/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
            : 'border-white/10 bg-white/5 text-gray-300 hover:border-primary-gold/40 hover:bg-white/[0.08] hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-primary-gold transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {typeof window !== 'undefined' && createPortal(dropdownComponent, document.body)}
    </div>
  );
}


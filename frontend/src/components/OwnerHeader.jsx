import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * OwnerHeader
 * - Desktop/tablet: horizontal header with ONE primary action + utilities.
 * - Mobile: compact header; secondary actions live in a Menu.
 *
 * This is a UI refactor only: it does not introduce new backend features.
 */
export const OwnerHeader = ({
  title,
  subtitle,
  left,
  languageToggle,
  primaryAction,
  menuLabel,
  menuItems = [],
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  const hasMenu = Array.isArray(menuItems) && menuItems.length > 0;

  const resolvedPrimary = useMemo(() => {
    if (!primaryAction) return null;
    return {
      label: primaryAction.label,
      shortLabel: primaryAction.shortLabel,
      onClick: primaryAction.onClick,
      icon: primaryAction.icon,
      disabled: Boolean(primaryAction.disabled),
    };
  }, [primaryAction]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const onPointerDown = (e) => {
      const menuEl = menuRef.current;
      const buttonEl = menuButtonRef.current;
      if (!menuEl || !buttonEl) return;
      if (menuEl.contains(e.target) || buttonEl.contains(e.target)) return;
      setIsMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {left}
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                {title}
              </div>
              {subtitle ? (
                <div className="text-xs sm:text-sm text-gray-500 font-semibold truncate">
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Utilities (language) */}
            {languageToggle}

            {/* Primary action (ONLY one primary button) */}
            {resolvedPrimary ? (
              <button
                type="button"
                onClick={resolvedPrimary.onClick}
                disabled={resolvedPrimary.disabled}
                className="btn-primary flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                {resolvedPrimary.icon}
                <span className="sm:hidden">
                  {resolvedPrimary.shortLabel || resolvedPrimary.label}
                </span>
                <span className="hidden sm:inline">{resolvedPrimary.label}</span>
              </button>
            ) : null}

            {/* Secondary actions -> Menu */}
            {hasMenu ? (
              <div className="relative">
                <button
                  ref={menuButtonRef}
                  type="button"
                  onClick={() => setIsMenuOpen((v) => !v)}
                  className="btn-secondary flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">{menuLabel || 'Menu'}</span>
                </button>

                {isMenuOpen ? (
                  <div
                    ref={menuRef}
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="py-1">
                      {menuItems.map((item) => (
                        <button
                          key={item.key || item.label}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsMenuOpen(false);
                            item.onClick?.();
                          }}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-gray-800 font-semibold"
                        >
                          {item.icon ? <span className="text-gray-600">{item.icon}</span> : null}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

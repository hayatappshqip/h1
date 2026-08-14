/**
 * AyahInteractionLayer Component
 * Provides word-level and ayah-level hit-testing, active highlighting,
 * and contextual actions (audio play, bookmark, tafsir, copy) without altering line flow.
 */
import React from 'react';

export interface AyahInteractionProps {
  verseKey: string;
  isSelected?: boolean;
  isActiveAudio?: boolean;
  onSelect?: (verseKey: string) => void;
  children: React.ReactNode;
}

export const AyahInteractionLayer: React.FC<AyahInteractionProps> = ({
  verseKey,
  isSelected,
  isActiveAudio,
  onSelect,
  children,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(verseKey);
    }
  };

  return (
    <span
      data-verse-key={verseKey}
      onClick={handleClick}
      className={`inline transition-colors duration-150 rounded cursor-pointer ${
        isActiveAudio
          ? 'bg-amber-400/20 ring-1 ring-amber-400/50'
          : isSelected
          ? 'bg-emerald-500/15 ring-1 ring-emerald-500/40'
          : 'hover:bg-amber-500/10'
      }`}
    >
      {children}
    </span>
  );
};

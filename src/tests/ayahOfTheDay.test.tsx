import "@testing-library/jest-dom/vitest";
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { AyahOfTheDay } from '../components/AyahOfTheDay';
import * as dateUtils from '../utils/dateUtils';
import * as corpusStore from '../services/quranCorpusStore';

// Mock dependencies
vi.mock('../utils/dateUtils', () => ({
 getLocalDateString: vi.fn()
}));

vi.mock('../services/quranCorpusStore', () => ({
 getLocalSurahData: vi.fn()
}));

describe('AyahOfTheDay Component', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 (dateUtils.getLocalDateString as any).mockReturnValue('2024-01-01');
 (corpusStore.getLocalSurahData as any).mockReturnValue({
 ayahs: [{ numberInSurah: 28, textAr: 'DefaultArabic', textSq: 'DefaultAlbanian' }]
 });
 });

 afterEach(() => {
 cleanup();
 vi.restoreAllMocks();
 });

 it('does not contain hardcoded Er-Ra\'d literal', async () => {
 render(<AyahOfTheDay onOpenAyah={() => {}} />);
 await waitFor(() => {
 expect(screen.getByText(/DefaultArabic/)).toBeInTheDocument();
 });
 const text = screen.queryByText(/Me të vërtetë, me përmendjen e Allahut qetësohen zemrat/i);
 expect(text).toBeNull();
 });

 it('selects verse key deterministically based on date', async () => {
 // 2024-01-01 -> hash % 4 === 0 ("13:28")
 (dateUtils.getLocalDateString as any).mockReturnValue('2024-01-01');
 (corpusStore.getLocalSurahData as any).mockReturnValue({
 ayahs: [{ numberInSurah: 28, textAr: 'Text1', textSq: 'Trans1' }]
 });

 const { unmount } = render(<AyahOfTheDay onOpenAyah={() => {}} />);
 await waitFor(() => {
 expect(screen.getByText(/Trans1/)).toBeInTheDocument();
 });
 unmount();

 // 2024-01-02 -> hash % 4 === 1 ("2:286")
 (dateUtils.getLocalDateString as any).mockReturnValue('2024-01-02');
 (corpusStore.getLocalSurahData as any).mockReturnValue({
 ayahs: [{ numberInSurah: 286, textAr: 'Text2', textSq: 'Trans2' }]
 });

 render(<AyahOfTheDay onOpenAyah={() => {}} />);
 await waitFor(() => {
 expect(screen.getByText(/Trans2/)).toBeInTheDocument();
 });
 });

 it('fetches verse from local corpus if available', async () => {
 const fetchSpy = vi.spyOn(global, 'fetch');
 (dateUtils.getLocalDateString as any).mockReturnValue('2024-01-01');
 (corpusStore.getLocalSurahData as any).mockReturnValue({
 ayahs: [{ numberInSurah: 28, textAr: 'LocalArabic', textSq: 'LocalAlbanian' }]
 });

 render(<AyahOfTheDay onOpenAyah={() => {}} />);
 
 await waitFor(() => {
 expect(screen.getByText(/LocalArabic/)).toBeInTheDocument();
 expect(screen.getByText(/LocalAlbanian/)).toBeInTheDocument();
 expect(screen.getByText(/Offline Corpus/)).toBeInTheDocument();
 });
 
 expect(fetchSpy).not.toHaveBeenCalled();
 });

 it('falls back to API if local corpus fails/missing', async () => {
 (dateUtils.getLocalDateString as any).mockReturnValue('2024-01-01');
 (corpusStore.getLocalSurahData as any).mockReturnValue(null);

 const mockApiResponse = {
 verse: {
 text_uthmani: 'ApiArabic',
 translations: [
 { resource_id: 88, text: 'ApiAlbanian' }
 ]
 }
 };

 const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
 ok: true,
 json: async () => mockApiResponse
 } as Response);

 render(<AyahOfTheDay onOpenAyah={() => {}} />);
 
 await waitFor(() => {
 expect(screen.getByText(/ApiArabic/)).toBeInTheDocument();
 expect(screen.getByText(/ApiAlbanian/)).toBeInTheDocument();
 expect(screen.getByText(/Quran.com API/)).toBeInTheDocument();
 });

 expect(fetchSpy).toHaveBeenCalled();
 });

 it('shows error message if both local and API fail', async () => {
 (dateUtils.getLocalDateString as any).mockReturnValue('2024-01-01');
 (corpusStore.getLocalSurahData as any).mockReturnValue(null);
 vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

 render(<AyahOfTheDay onOpenAyah={() => {}} />);
 
 await waitFor(() => {
 expect(screen.getByText('Ajeti i ditës nuk u ngarkua.')).toBeInTheDocument();
 });
 });

 it('calls onOpenAyah when button is clicked', async () => {
 (dateUtils.getLocalDateString as any).mockReturnValue('2024-01-01');
 (corpusStore.getLocalSurahData as any).mockReturnValue({
 ayahs: [{ numberInSurah: 28, textAr: 'LocalArabic', textSq: 'LocalAlbanian' }]
 });

 const mockOnOpen = vi.fn();
 render(<AyahOfTheDay onOpenAyah={mockOnOpen} />);
 
 await waitFor(() => {
 expect(screen.getByText('Hap në Kuran')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Hap në Kuran'));
 expect(mockOnOpen).toHaveBeenCalledWith(13, 28);
 });
});

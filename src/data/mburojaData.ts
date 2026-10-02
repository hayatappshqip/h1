/**
 * Public Mburoja data entry point.
 * The certified package stays immutable; mburojaAdapter owns the UI mapping.
 */
export {
  MBUROJA_CATEGORIES,
  MBUROJA_CHAPTERS,
  MBUROJA_PACKAGE_VERSION,
  EMPTY_MBUROJA_STATE,
  makeMburojaItemKey,
  migrateMburojaState,
  resolveMburojaAudioUrls,
} from './mburojaAdapter';

import { MBUROJA_CHAPTERS } from './mburojaAdapter';

export function getChaptersByCategory(categoryId: string) {
  return MBUROJA_CHAPTERS.filter(chapter => chapter.categoryId === categoryId);
}

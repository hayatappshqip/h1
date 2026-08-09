/**
 * Local Date Formatting Utility
 * Avoids UTC mismatch caused by new Date().toISOString().split('T')[0]
 */

export function getLocalDateString(dateInput: Date | number | string = new Date()): string {
 const d = new Date(dateInput);
 if (isNaN(d.getTime())) {
 const fallback = new Date();
 return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`;
 }
 const year = d.getFullYear();
 const month = String(d.getMonth() + 1).padStart(2, '0');
 const day = String(d.getDate()).padStart(2, '0');
 return `${year}-${month}-${day}`;
}

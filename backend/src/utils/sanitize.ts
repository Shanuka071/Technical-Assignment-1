/** Removes HTML tags and control characters so stored text can never carry markup. */
export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

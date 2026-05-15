export const prepareSearchTerm = (term: string): string => {
  return term
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => {
        const cleanWord = word.replace(/[^\w]/g, '');
        return cleanWord.length > 0 ? `${cleanWord}:*` : '';
      })
      .filter((term) => term.length > 0)
      .join(' ');
} 
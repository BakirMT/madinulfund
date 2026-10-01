export function exportToCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        const str = String(val === undefined || val === null ? '' : val);
        // Escape quotes
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',');
  };

  const csvContent = [headers.join(','), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/[^0-9]/g, '');
  return clean.length >= 10 && clean.length <= 13;
}

export function validatePincode(pin: string): boolean {
  const clean = pin.replace(/[^0-9]/g, '');
  return clean.length === 6;
}

export function generateNextStudentId(existingIds: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `MQ-${year}-`;
  let highestNum = 0;

  existingIds.forEach((id) => {
    if (id.startsWith(prefix)) {
      const numPart = parseInt(id.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > highestNum) {
        highestNum = numPart;
      }
    }
  });

  const nextNum = String(highestNum + 1).padStart(3, '0');
  return `${prefix}${nextNum}`;
}

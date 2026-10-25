import { jsPDF } from 'jspdf';

export interface RepairLog {
  id: string;
  equipment: string;
  issue: string;
  status: string;
  cost: number | string;
  downtime: number | string;
  repair_date: string;
}

export function downloadRepairPdf(r: RepairLog) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const x = 56;
  let y = 72;
  doc.setFont('helvetica', 'bold').setFontSize(20).text('Repair Report', x, y);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(110).text('Hinjd Global · Moroni, Utah', x, (y += 18));
  doc.setDrawColor(212, 175, 55).setLineWidth(2).line(x, (y += 14), 556, y);
  doc.setTextColor(20);
  const rows: [string, string][] = [
    ['Equipment', r.equipment],
    ['Repair date', r.repair_date],
    ['Status', r.status],
    ['Cost', `$${Number(r.cost).toLocaleString()}`],
    ['Downtime', `${r.downtime} hours`],
  ];
  y += 30;
  rows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold').setFontSize(11).text(k, x, y);
    doc.setFont('helvetica', 'normal').text(String(v ?? ''), x + 120, y);
    y += 22;
  });
  doc.setFont('helvetica', 'bold').text('Issue', x, (y += 10));
  doc.setFont('helvetica', 'normal').text(doc.splitTextToSize(r.issue || '', 440), x, (y += 18));
  doc.setFontSize(8).setTextColor(140).text(`Report ID ${r.id.slice(0, 8)} · Generated ${new Date().toLocaleDateString()}`, x, 740);
  doc.save(`repair-${r.equipment.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${r.repair_date}.pdf`);
}

// Generates a mock "original PDF" that mimics a Sales Quote Confirmation
// layout, opens it in a new browser tab. Used by the View Original PDF
// action when the actual source PDF isn't available (demo / mock data).

interface DocLike {
    id: string
    name: string
    vendor: string
    type: string
}

/** Derive the document title and ID label from the doc type. The PDF
    layout stays the same; only the headers change to match the document
    kind (Purchase Order, Acknowledgement, or Quote). */
function titlesForType(type: string): { title: string; idLabel: string; dateLabel: string } {
    const t = type.toLowerCase()
    if (t.includes('purchase order') || t === 'po') {
        return { title: 'Purchase Order', idLabel: 'PO Number:', dateLabel: 'PO Date:' }
    }
    if (t.includes('acknowledg') || t === 'ack') {
        return { title: 'Order Acknowledgement', idLabel: 'ACK Number:', dateLabel: 'ACK Date:' }
    }
    return { title: 'Sales Quote Confirmation', idLabel: 'Quote ID:', dateLabel: 'Quote Date:' }
}

export async function openOriginalMockPdf(doc: DocLike): Promise<void> {
    // Dynamic import keeps the initial bundle small (jsPDF is ~200 KB).
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'pt', format: 'letter' })

    const pageW = pdf.internal.pageSize.getWidth()
    const margin = 40
    let y = margin

    const { title, idLabel, dateLabel } = titlesForType(doc.type)

    pdf.setFont('helvetica', 'normal')

    // Vendor block (top-left)
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    pdf.text(doc.vendor, margin, y)
    y += 14
    pdf.text('600 Eagle Drive', margin, y)
    y += 12
    pdf.text('Bensenville, IL 60106', margin, y)
    y += 12
    pdf.text('USA', margin, y)

    // Title block (top-right)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, pageW - margin, margin, { align: 'right' })

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(80, 80, 80)
    let ry = margin + 22
    const rightPad = pageW - margin

    pdf.text(idLabel, rightPad - 110, ry)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(doc.id.toUpperCase(), rightPad, ry, { align: 'right' })
    ry += 14

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(80, 80, 80)
    pdf.text(dateLabel, rightPad - 110, ry)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('02/10/26', rightPad, ry, { align: 'right' })
    ry += 14

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(80, 80, 80)
    pdf.text(`Quote Expiration Date:`, rightPad - 110, ry)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('05/11/26', rightPad, ry, { align: 'right' })
    ry += 14

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(80, 80, 80)
    pdf.text(`Lead Time:`, rightPad - 110, ry)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('12 TO 16 WEEKS', rightPad, ry, { align: 'right' })

    y = Math.max(y, ry) + 30

    // Vendor + Quote Type
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Vendor Number:', margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(doc.vendor, margin + 90, y)
    y += 14
    pdf.setFont('helvetica', 'bold')
    pdf.text('Quote Type:', margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text('OMNIA 07-77', margin + 90, y)
    y += 24

    // Two columns: Project Location / Bill To
    pdf.setDrawColor(60, 60, 60)
    pdf.setLineWidth(0.8)
    pdf.line(margin, y, pageW - margin, y)
    y += 14

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 90, 180)
    pdf.text('Project Location', margin, y)
    pdf.text('Bill To', pageW / 2 + 10, y)
    y += 14

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    const writeRow = (label: string, leftVal: string, rightVal: string) => {
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${label}:`, margin, y)
        pdf.setFont('helvetica', 'normal')
        pdf.text(leftVal, margin + 60, y)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${label}:`, pageW / 2 + 10, y)
        pdf.setFont('helvetica', 'normal')
        pdf.text(rightVal, pageW / 2 + 70, y)
        y += 12
    }
    writeRow('Name', 'MATTAWAN MIDDLE SCHOOLS', 'Custer Inc.')
    writeRow('Address', '24959 W McGillen St', '217 Grandville Ave. SW')
    y += 2
    pdf.text('Mattawan, MI 49071, US', margin + 60, y)
    pdf.text('Grand Rapids, MI 49503, USA', pageW / 2 + 70, y)
    y += 30

    // Ship To + Shipping Method
    pdf.line(margin, y, pageW - margin, y)
    y += 14
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 90, 180)
    pdf.text('Ship To', margin, y)
    y += 14

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Name:', margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Custer Inc.', margin + 60, y)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Shipping Method:', pageW / 2 + 10, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${doc.vendor} Shipping`, pageW / 2 + 120, y)
    y += 12
    pdf.setFont('helvetica', 'bold')
    pdf.text('Address:', margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text('217 Grandville Ave. SW', margin + 60, y)
    y += 12
    pdf.text('Grand Rapids, MI 49503, USA', margin + 60, y)
    y += 30

    // Quote Instructions
    pdf.line(margin, y, pageW - margin, y)
    y += 14
    pdf.setFont('helvetica', 'bold')
    pdf.text('Quote Instructions:', margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Our quote together will kindly require your team to have staff on site to', margin + 110, y)
    y += 12
    pdf.text('help unload and bring items into the building. Please help.', margin + 110, y)
    y += 24

    // Items table header
    pdf.setFillColor(245, 235, 220)
    pdf.rect(margin, y - 12, pageW - margin * 2, 18, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text('Item ID', margin + 6, y)
    pdf.text('Item Description', margin + 80, y)
    pdf.text('Req Qty', pageW - 200, y)
    pdf.text('Unit List Price', pageW - 145, y)
    pdf.text('Total Net Price', pageW - 60, y, { align: 'right' })
    y += 22

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const items = [
        { id: 'HMBS244-D', name: 'Mobile Booth Seating - Half Circle - 24"W x 92"L', qty: 4, list: 29410, net: 36377.24 },
        { id: 'MCTNP488-42-D', name: 'Mobile Conversation Table - Open Sides', qty: 5, list: 10163, net: 15713.25 },
        { id: 'MFB5P245-D', name: 'Mobile Folding Booth Seating with Table - Package', qty: 8, list: 28909, net: 71515.12 },
        { id: 'MST1012-D', name: 'Mobile Stool Table - Rectangle - 30"W x 10"L', qty: 11, list: 8183, net: 27834.29 },
        { id: 'PTRX4230-D', name: 'Social Table - Round - 42" Diameter x 30"H', qty: 4, list: 2968, net: 3671.12 },
    ]
    for (const it of items) {
        if (y > 720) {
            pdf.addPage()
            y = margin
        }
        pdf.setFont('helvetica', 'bold')
        pdf.text(it.id, margin + 6, y)
        pdf.setFont('helvetica', 'normal')
        pdf.text(it.name.slice(0, 60), margin + 80, y)
        pdf.text(String(it.qty), pageW - 195, y)
        pdf.text(`$${it.list.toLocaleString()}`, pageW - 145, y)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`$${it.net.toLocaleString()}`, pageW - margin, y, { align: 'right' })
        y += 18
    }

    y += 16
    pdf.setDrawColor(180, 180, 180)
    pdf.line(margin, y, pageW - margin, y)
    y += 18
    pdf.setFont('helvetica', 'bold')
    pdf.text('Quote Total:', pageW - 150, y)
    pdf.text('$161,571.02', pageW - margin, y, { align: 'right' })

    // Footer
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(120, 120, 120)
        pdf.text(`Original document: ${doc.name}`, margin, pdf.internal.pageSize.getHeight() - 24)
        pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, pdf.internal.pageSize.getHeight() - 24, { align: 'right' })
    }

    const blob = pdf.output('blob')
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win) {
        // Popup blocker — fall back to download.
        const a = document.createElement('a')
        a.href = url
        a.download = doc.name.endsWith('.pdf') ? doc.name : `${doc.name}.pdf`
        a.click()
    }
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

/**
 * Same PDF as openOriginalMockPdf but returns the blob URL instead of
 * opening it in a new tab. Used by the in-modal preview (iframe). The
 * caller is responsible for revoking the URL when done.
 */
export async function generateOriginalMockPdfUrl(doc: DocLike): Promise<string> {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'pt', format: 'letter' })

    const pageW = pdf.internal.pageSize.getWidth()
    const margin = 40
    let y = margin

    const { title, idLabel, dateLabel } = titlesForType(doc.type)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    pdf.text(doc.vendor, margin, y); y += 14
    pdf.text('600 Eagle Drive', margin, y); y += 12
    pdf.text('Bensenville, IL 60106', margin, y); y += 12
    pdf.text('USA', margin, y)

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, pageW - margin, margin, { align: 'right' })

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(80, 80, 80)
    let ry = margin + 22
    const rightPad = pageW - margin

    pdf.text(idLabel, rightPad - 110, ry)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(doc.id.toUpperCase(), rightPad, ry, { align: 'right' })
    ry += 14

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(80, 80, 80)
    pdf.text(dateLabel, rightPad - 110, ry)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('02/10/26', rightPad, ry, { align: 'right' })
    ry += 14

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(80, 80, 80)
    pdf.text('Lead Time:', rightPad - 110, ry)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('12 TO 16 WEEKS', rightPad, ry, { align: 'right' })

    y = Math.max(y, ry) + 30

    pdf.setFont('helvetica', 'bold')
    pdf.text('Vendor:', margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(doc.vendor, margin + 70, y)
    y += 14
    pdf.setFont('helvetica', 'bold')
    pdf.text('Document:', margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(title, margin + 70, y)
    y += 24

    pdf.setDrawColor(60, 60, 60)
    pdf.setLineWidth(0.8)
    pdf.line(margin, y, pageW - margin, y)
    y += 14

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 90, 180)
    pdf.text('Ship To', margin, y); y += 14
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Custer Inc. · 217 Grandville Ave. SW · Grand Rapids, MI 49503', margin, y)
    y += 30

    pdf.setFillColor(245, 235, 220)
    pdf.rect(margin, y - 12, pageW - margin * 2, 18, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text('Item ID', margin + 6, y)
    pdf.text('Description', margin + 80, y)
    pdf.text('Qty', pageW - 200, y)
    pdf.text('Unit Price', pageW - 145, y)
    pdf.text('Net Total', pageW - 60, y, { align: 'right' })
    y += 22

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const items = [
        { id: 'HMBS244-D',     name: 'Mobile Booth Seating - Half Circle',         qty: 4,  list: 29410, net: 36377.24 },
        { id: 'MCTNP488-42-D', name: 'Mobile Conversation Table - Open Sides',     qty: 5,  list: 10163, net: 15713.25 },
        { id: 'MFB5P245-D',    name: 'Mobile Folding Booth Seating with Table',    qty: 8,  list: 28909, net: 71515.12 },
        { id: 'MST1012-D',     name: 'Mobile Stool Table - Rectangle',             qty: 11, list: 8183,  net: 27834.29 },
        { id: 'PTRX4230-D',    name: 'Social Table - Round 42"',                    qty: 4,  list: 2968,  net: 3671.12 },
    ]
    for (const it of items) {
        if (y > 720) { pdf.addPage(); y = margin }
        pdf.setFont('helvetica', 'bold')
        pdf.text(it.id, margin + 6, y)
        pdf.setFont('helvetica', 'normal')
        pdf.text(it.name.slice(0, 60), margin + 80, y)
        pdf.text(String(it.qty), pageW - 195, y)
        pdf.text(`$${it.list.toLocaleString()}`, pageW - 145, y)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`$${it.net.toLocaleString()}`, pageW - margin, y, { align: 'right' })
        y += 18
    }

    y += 16
    pdf.setDrawColor(180, 180, 180)
    pdf.line(margin, y, pageW - margin, y)
    y += 18
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${title} Total:`, pageW - 180, y)
    pdf.text('$161,571.02', pageW - margin, y, { align: 'right' })

    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(120, 120, 120)
        pdf.text(`Original document: ${doc.name}`, margin, pdf.internal.pageSize.getHeight() - 24)
        pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, pdf.internal.pageSize.getHeight() - 24, { align: 'right' })
    }

    const blob = pdf.output('blob')
    return URL.createObjectURL(blob)
}

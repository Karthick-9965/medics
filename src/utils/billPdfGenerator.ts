import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface BillItem {
  name: string;
  dosage?: string;
  quantity: number;
  unitPrice?: string;
  totalPrice: string;
}

export interface BillPdfData {
  orderId: string;
  date: string;
  pharmacyName: string;
  pharmacyAddress?: string;
  pharmacyPhone?: string;
  customerName?: string;
  deliveryAddress: string;
  deliveryPhone: string;
  paymentMethod: string;
  items: BillItem[];
  subtotal: string;
  deliveryFee: string;
  totalAmount: string;
  eta?: string;
  notes?: string;
}

/**
 * Builds high quality HTML for the official Pharmacy Bill / Tax Invoice.
 */
function buildBillHtml(data: BillPdfData): string {
  const isFreeDelivery = data.deliveryFee === 'FREE' || data.deliveryFee === '0' || data.deliveryFee === '₹0.00';

  const itemsRows = data.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8EFEF; text-align: center; color: #7E918C; font-weight: 600;">
          ${idx + 1}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8EFEF;">
          <div style="font-weight: 700; color: #1E293B; font-size: 13px;">${item.name}</div>
          ${item.dosage ? `<div style="font-size: 11px; color: #7E918C; margin-top: 2px;">${item.dosage}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8EFEF; text-align: center;">
          <span style="background: #F5F8F7; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #138A72; border: 1px solid #E0ECE9;">
            ${item.quantity}
          </span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8EFEF; text-align: right; color: #475569; font-size: 13px;">
          ${item.unitPrice || '-'}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8EFEF; text-align: right; font-weight: 700; color: #1E293B; font-size: 13px;">
          ${item.totalPrice}
        </td>
      </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice - ${data.orderId}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      body { background: #FFFFFF; color: #1E293B; padding: 24px; font-size: 13px; line-height: 1.5; }
      .invoice-container { max-width: 680px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 14px; padding: 28px; background: #FFFFFF; }
      .header-bar { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #138A72; }
      .brand-title { font-size: 24px; font-weight: 800; color: #138A72; letter-spacing: -0.5px; }
      .brand-sub { font-size: 11px; color: #7E918C; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 2px; }
      .invoice-meta { text-align: right; }
      .invoice-title { font-size: 18px; font-weight: 800; color: #1E293B; }
      .invoice-id { font-size: 12px; font-weight: 700; color: #138A72; margin-top: 3px; }
      .invoice-date { font-size: 11.5px; color: #64748B; margin-top: 2px; }
      
      .info-grid { display: flex; justify-content: space-between; margin-top: 22px; padding-bottom: 20px; border-bottom: 1px solid #E8EFEF; gap: 20px; }
      .info-col { flex: 1; }
      .info-heading { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748B; font-weight: 700; margin-bottom: 6px; }
      .info-name { font-size: 13px; font-weight: 700; color: #1E293B; }
      .info-text { font-size: 11.5px; color: #475569; margin-top: 2px; line-height: 1.4; }

      .table-container { margin-top: 20px; width: 100%; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #F8FAFC; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; padding: 10px 12px; border-bottom: 1px solid #CBD5E1; }
      
      .bill-summary-wrap { display: flex; justify-content: flex-end; margin-top: 20px; }
      .summary-box { width: 300px; background: #F8FAFC; border-radius: 10px; padding: 14px; border: 1px solid #E2E8F0; }
      .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12.5px; color: #475569; }
      .summary-total { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 2px dashed #CBD5E1; margin-top: 6px; font-size: 15px; font-weight: 800; color: #1E293B; }
      .free-tag { background: #D1FAE5; color: #065F46; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; }

      .footer-note { margin-top: 30px; padding-top: 16px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
      .verified-badge { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #138A72; font-weight: 700; }
      .support-text { font-size: 11px; color: #94A3B8; text-align: right; }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <!-- Top Header -->
      <div class="header-bar">
        <div>
          <div class="brand-title">Medics Pharmacy</div>
          <div class="brand-sub">Digital Healthcare & Prescription Delivery</div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-title">TAX INVOICE / BILL</div>
          <div class="invoice-id">${data.orderId}</div>
          <div class="invoice-date">${data.date}</div>
        </div>
      </div>

      <!-- Pharmacy & Customer Info -->
      <div class="info-grid">
        <div class="info-col">
          <div class="info-heading">Dispensed By</div>
          <div class="info-name">${data.pharmacyName}</div>
          ${data.pharmacyAddress ? `<div class="info-text">${data.pharmacyAddress}</div>` : ''}
          ${data.pharmacyPhone ? `<div class="info-text">Phone: ${data.pharmacyPhone}</div>` : ''}
        </div>
        <div class="info-col">
          <div class="info-heading">Delivered To</div>
          <div class="info-name">${data.customerName || 'Patient'}</div>
          <div class="info-text">${data.deliveryAddress}</div>
          <div class="info-text">Phone: ${data.deliveryPhone}</div>
          <div class="info-text">Payment: <strong>${data.paymentMethod}</strong></div>
        </div>
      </div>

      <!-- Items Ordered Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="text-align: left;">Medicine / Tablet Name</th>
              <th style="width: 70px; text-align: center;">Count</th>
              <th style="width: 90px; text-align: right;">Unit Price</th>
              <th style="width: 90px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>

      <!-- Summary / Total -->
      <div class="bill-summary-wrap">
        <div class="summary-box">
          <div class="summary-row">
            <span>Item Subtotal (${data.items.reduce((s, it) => s + it.quantity, 0)} items):</span>
            <span style="font-weight: 600;">${data.subtotal}</span>
          </div>
          <div class="summary-row">
            <span>Delivery Fee:</span>
            <span>
              ${isFreeDelivery ? `<span class="free-tag">FREE DELIVERY</span>` : `<span style="font-weight: 600;">${data.deliveryFee}</span>`}
            </span>
          </div>
          <div class="summary-total">
            <span>Total Paid / Payable:</span>
            <span style="color: #138A72; font-size: 16px;">${data.totalAmount}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer-note">
        <div class="verified-badge">
          <span>✓</span>
          <span>Verified & Dispensed by Registered Pharmacist</span>
        </div>
        <div class="support-text">
          Computer generated tax invoice.<br />
          Medics Telemedicine Care • 24/7 Helpline
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Generates a real physical PDF invoice and opens the native download/share dialog.
 */
export async function downloadBillAsPdf(data: BillPdfData): Promise<{ uri?: string; success: boolean }> {
  try {
    const html = buildBillHtml(data);

    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return { success: true };
    }

    // Android & iOS: Render real PDF to filesystem
    const file = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Download Bill - ${data.orderId}`,
      });
    }

    return { uri: file.uri, success: true };
  } catch (error) {
    console.error('Error downloading bill PDF:', error);
    throw error;
  }
}

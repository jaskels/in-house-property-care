import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function currency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0))
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { form, estimate } = JSON.parse(event.body || '{}')
    if (!form?.contactName || !form?.email || !form?.address) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields.' }) }
    }

    const subject = `In House Property Care Estimate for ${form.contactName}`
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="color:#a11c27;">In House Property Care Estimate</h2>
        <p><strong>Customer:</strong> ${escapeHtml(form.contactName)}</p>
        <p><strong>Address:</strong> ${escapeHtml(form.address)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(form.phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(form.email)}</p>
        <p><strong>Preferred Contact:</strong> ${escapeHtml(form.preferredContact)}</p>
        <p><strong>Quote Type:</strong> ${escapeHtml(form.quoteType)}</p>
        ${form.quoteType === 'mowing' ? `
          <p><strong>Estimated Per Visit:</strong> ${currency(estimate.perVisit)}</p>
          <p><strong>Estimated Monthly Service:</strong> ${currency(estimate.monthly)}</p>
          <p><strong>One-Time Add-ons / First Visit:</strong> ${currency(estimate.oneTime)}</p>
          <p><strong>Travel Charge:</strong> ${currency(estimate.travel)}</p>
          <p><strong>Estimated First Bill:</strong> ${currency(estimate.firstBill)}</p>
          <p><strong>Estimated Recurring Monthly After First Bill:</strong> ${currency(estimate.recurringMonthly)}</p>
        ` : `
          <p><strong>Estimated Cleanup Total:</strong> ${currency(estimate.oneTime)}</p>
          <p><strong>Travel Charge:</strong> ${currency(estimate.travel)}</p>
          <p><strong>Estimated Total:</strong> ${currency(estimate.totalNow)}</p>
        `}
        <p><strong>Notes:</strong> ${escapeHtml(form.notes || 'None')}</p>
        <hr />
        <p style="font-size: 14px; color: #64748b;">
          Estimated quote only. Final price is subject to verification of property size, site conditions, and selected services.
          Service begins only after contract review and signing.
        </p>
      </div>
    `

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [form.email, process.env.QUOTE_COPY_TO_EMAIL],
      replyTo: process.env.REPLY_TO_EMAIL,
      subject,
      html,
    })

    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error?.message || 'Could not send estimate.' }) }
  }
}

const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

function currency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0))
}

function listToHtml(lines) {
  if (!lines || !lines.length) {
    return '<p style="margin:0;color:#64748b;">None</p>'
  }

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tbody>
        ${lines.map(line => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#334155;">${line.label}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#0f172a;">${currency(line.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed.' }) }
  }

  try {
    const { form, estimate } = JSON.parse(event.body || '{}')

    if (!form?.email || !form?.contactName || !form?.address) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Name, email, and property address are required.' }) }
    }

    const recurringHtml = listToHtml(estimate?.recurringLines || [])
    const oneTimeHtml = listToHtml(estimate?.oneTimeLines || [])
    const subject = `In House Property Care Estimate - ${form.address}`

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:780px;margin:0 auto;padding:24px;color:#1f2937;">
        <h1 style="margin:0 0 8px;color:#991b1b;">In House Property Care</h1>
        <p style="margin:0 0 20px;color:#64748b;">Line-item estimate summary for ${form.contactName}</p>

        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:16px;margin-bottom:20px;color:#6b7280;">
          Estimated quote only. Final price is subject to verification of property size, site conditions, and selected services. Service begins only after contract review and signing.
        </div>

        <h2 style="margin:0 0 8px;">Customer details</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tbody>
            <tr><td style="padding:8px 0;color:#64748b;">Name</td><td style="padding:8px 0;font-weight:700;">${form.contactName}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Address</td><td style="padding:8px 0;font-weight:700;">${form.address}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Phone</td><td style="padding:8px 0;font-weight:700;">${form.phone || '-'}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;font-weight:700;">${form.email}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Preferred contact</td><td style="padding:8px 0;font-weight:700;">${form.preferredContact || '-'}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Request type</td><td style="padding:8px 0;font-weight:700;">${form.serviceMode === 'verify' ? 'Request verification first' : 'Request service now'}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Quote type</td><td style="padding:8px 0;font-weight:700;">${form.quoteType === 'cleanup' ? 'Spring cleanup' : 'Mowing service'}</td></tr>
          </tbody>
        </table>

        <h2 style="margin:0 0 8px;">Recurring line items</h2>
        ${recurringHtml}

        <h2 style="margin:24px 0 8px;">One-time line items</h2>
        ${oneTimeHtml}

        <h2 style="margin:24px 0 8px;">Totals</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#475569;">Estimated per visit</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">${currency(estimate?.perVisit || 0)}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#475569;">Estimated monthly service</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">${currency(estimate?.recurringMonthly || 0)}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#475569;">Estimated one-time total</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">${currency((estimate?.oneTimeTotal || 0) + (estimate?.travel || 0))}</td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#0f172a;font-weight:800;">Estimated first bill</td><td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:800;color:#0f172a;">${currency(estimate?.firstBill || 0)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Estimated recurring monthly after first bill</td><td style="padding:10px 0;text-align:right;font-weight:700;color:#64748b;">${currency(estimate?.recurringAfterFirst || 0)}</td></tr>
          </tbody>
        </table>

        ${form.notes ? `
          <h2 style="margin:24px 0 8px;">Notes</h2>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;color:#334155;">${String(form.notes).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        ` : ''}

        <p style="margin-top:24px;color:#64748b;">
          Contact: 801-898-0281 · ihiutah@gmail.com
        </p>
      </div>
    `

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [form.email, process.env.QUOTE_COPY_TO_EMAIL],
      replyTo: process.env.REPLY_TO_EMAIL,
      subject,
      html
    })

    return { statusCode: 200, body: JSON.stringify({ message: 'Estimate sent.' }) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error?.message || 'Could not send estimate.' }) }
  }
}

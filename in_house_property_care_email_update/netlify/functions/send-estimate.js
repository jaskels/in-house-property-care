export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  const copyToEmail = process.env.QUOTE_COPY_TO_EMAIL
  const replyToEmail = process.env.REPLY_TO_EMAIL

  if (!apiKey || !fromEmail || !copyToEmail || !replyToEmail) {
    return jsonResponse(500, { error: 'Email settings are missing in Netlify environment variables.' })
  }

  try {
    const { form, estimate } = JSON.parse(event.body || '{}')

    if (!form?.email || !form?.contactName || !form?.address) {
      return jsonResponse(400, { error: 'Customer name, email, and property address are required.' })
    }

    const subject = `In House Property Care Estimate for ${form.contactName}`
    const details = buildDetails(form, estimate)
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="color:#a11c27;margin-bottom:8px;">In House Property Care</h2>
        <p>Thank you for reviewing your estimate.</p>
        <p><strong>Important:</strong> This is an estimated quote only. Final price is subject to verification of property size, site conditions, and selected services. Service begins only after review and signed agreement.</p>
        ${details}
        <p style="margin-top:24px;">Reply to this email or contact us at <strong>801-898-0281</strong> or <strong>ihiutah@gmail.com</strong>.</p>
      </div>
    `

    const payload = {
      from: fromEmail,
      to: [form.email],
      cc: [copyToEmail],
      reply_to: replyToEmail,
      subject,
      html
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      const message = resendData?.message || resendData?.error || 'Resend rejected the email request.'
      return jsonResponse(500, { error: message })
    }

    return jsonResponse(200, { ok: true, id: resendData.id })
  } catch (error) {
    return jsonResponse(500, { error: error.message || 'Unable to send estimate.' })
  }
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

function currency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0))
}

function line(label, value) {
  return `<tr><td style="padding:8px 10px;border:1px solid #e5e7eb;"><strong>${label}</strong></td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${value}</td></tr>`
}

function buildDetails(form, estimate) {
  const rows = [
    line('Customer', form.contactName),
    line('Address', form.address),
    line('Preferred Contact', form.preferredContact),
    line('Customer Phone', form.phone || '-'),
    line('Customer Email', form.email),
    line('Request Type', form.serviceMode === 'verify' ? 'Request verification first' : 'Request service now'),
    line('Quote Type', form.quoteType === 'cleanup' ? 'Spring cleanup' : 'Mowing service')
  ]

  if (form.quoteType === 'mowing') {
    rows.push(
      line('Size Range', form.sizeRange + ' acre range'),
      line('Frequency', form.frequency),
      line('Mow Style', form.mowStyle),
      line('Overgrown First Cut', form.overgrownFirstCut ? 'Yes' : 'No'),
      line('Dog Waste Cleanup', form.dogWaste ? 'Yes' : 'No'),
      line('Deep Edging Feet', form.deepEdgingFeet || '0'),
      line('Shrub Trimming Blocks', form.shrubBlocks || '0'),
      line('Estimated Per Visit', currency(estimate.perVisit)),
      line('Estimated Monthly Service', currency(estimate.monthly)),
      line('One-Time Add-Ons / First Visit', currency(estimate.oneTime)),
      line('Travel Charge', currency(estimate.travel)),
      line('Estimated First Bill', currency(estimate.firstBill)),
      line('Estimated Recurring Monthly After First Bill', currency(estimate.monthlyWithTravel))
    )
  } else {
    rows.push(
      line('Cleanup People', form.cleanupPeople || '1'),
      line('Cleanup Hours', form.cleanupHours || '1'),
      line('Additional Trailer Loads', form.cleanupExtraLoads || '0'),
      line('Shrub Trimming Blocks', form.shrubBlocks || '0'),
      line('Cleanup Estimate', currency(estimate.oneTime)),
      line('Travel Charge', currency(estimate.travel)),
      line('Estimated Total', currency(estimate.totalNow))
    )
  }

  if (form.county && form.county !== 'Salt Lake County') {
    rows.push(line('Round-Trip Miles Outside County', form.outsideCountyMilesRoundTrip || '0'))
  }

  rows.push(line('Notes', form.notes || '-'))

  return `<table style="border-collapse:collapse;width:100%;margin-top:18px;">${rows.join('')}</table>`
}

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
    const { form, estimate, photos = [] } = JSON.parse(event.body || '{}')

    if (!form?.contactName || !form?.phone || !form?.email || !form?.propertyAddress) {
      return jsonResponse(400, {
        error: 'Name, phone, email, and property address are required.'
      })
    }

    const cleanPhotos = sanitizePhotos(photos)
    const subject = `New Property Care Estimate Request - ${safeText(form.contactName)}`
    const details = buildDetails(form, estimate)

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="color:#a11c27;margin-bottom:8px;">New Property Care Estimate Request</h2>
        <p><strong>In House Property Care</strong> received a new estimate request from the website.</p>
        <p><strong>Estimated number:</strong> ${estimate?.reviewRequired ? 'Review required' : currency(estimate?.total)}</p>
        <p><strong>Important:</strong> This is an estimated quote based on the information provided. Final pricing may change after review of property size, condition, access, photos, timing, service needs, pet waste, trash, overgrowth, laundry, restocking, add-ons, or incomplete details.</p>
        ${details}
        <p style="margin-top:24px;">
          Customer email: <strong>${escapeHtml(form.email)}</strong><br />
          Customer phone: <strong>${escapeHtml(form.phone)}</strong>
        </p>
      </div>
    `

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="color:#a11c27;margin-bottom:8px;">In House Property Care</h2>
        <p>Thank you for requesting a property care estimate.</p>
        <p>We received your request and will review the property details before confirming final pricing or service availability.</p>
        <p><strong>Estimated number:</strong> ${estimate?.reviewRequired ? 'Review required' : currency(estimate?.total)}</p>
        <p><strong>Important:</strong> This is an estimated quote based on the information provided. Final pricing may change after review of property size, condition, access, photos, timing, service needs, pet waste, trash, overgrowth, laundry, restocking, add-ons, or incomplete details.</p>
        ${details}
        <p style="margin-top:24px;">
          Questions? Reply to this email or contact us at <strong>801-898-0281</strong> or <strong>ihiutah@gmail.com</strong>.
        </p>
      </div>
    `

    const adminPayload = {
      from: fromEmail,
      to: [copyToEmail],
      reply_to: form.email,
      subject,
      html: adminHtml
    }

    if (cleanPhotos.length > 0) {
      adminPayload.attachments = cleanPhotos.map(photo => ({
        filename: photo.name,
        content: photo.content
      }))
    }

    const adminResult = await sendResendEmail(apiKey, adminPayload)

    if (!adminResult.ok) {
      return jsonResponse(500, { error: adminResult.error })
    }

    const customerPayload = {
      from: fromEmail,
      to: [form.email],
      reply_to: replyToEmail,
      subject: 'We received your In House Property Care estimate request',
      html: customerHtml
    }

    const customerResult = await sendResendEmail(apiKey, customerPayload)

    if (!customerResult.ok) {
      return jsonResponse(500, { error: customerResult.error })
    }

    return jsonResponse(200, {
      ok: true,
      adminEmailId: adminResult.id,
      customerEmailId: customerResult.id
    })
  } catch (error) {
    return jsonResponse(500, {
      error: error.message || 'Unable to send estimate request.'
    })
  }
}

async function sendResendEmail(apiKey, payload) {
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const resendData = await resendResponse.json().catch(() => ({}))

  if (!resendResponse.ok) {
    const message = resendData?.message || resendData?.error || 'Resend rejected the email request.'
    return { ok: false, error: message }
  }

  return { ok: true, id: resendData.id }
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

function safeText(value) {
  return String(value || '').trim()
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function line(label, value) {
  return `
    <tr>
      <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f8fafc;"><strong>${escapeHtml(label)}</strong></td>
      <td style="padding:8px 10px;border:1px solid #e5e7eb;">${escapeHtml(value || '-')}</td>
    </tr>
  `
}

function listLine(label, values) {
  const cleanValues = Array.isArray(values) && values.length ? values.join(', ') : '-'
  return line(label, cleanValues)
}

function buildDetails(form, estimate) {
  const rows = [
    line('Customer', form.contactName),
    line('Phone', form.phone),
    line('Email', form.email),
    line('Preferred Contact', labelMap(form.preferredContact)),
    line('Property Address / City', form.propertyAddress),
    line('Service Area', labelMap(form.serviceArea)),
    line('Property Type', labelMap(form.propertyType)),
    line('Selected Plan', labelMap(form.selectedPlan))
  ]

  if (form.selectedPlan === 'basic' || form.selectedPlan === 'exterior') {
    rows.push(
      line('Property Size', labelMap(form.propertySize)),
      line('Frequency', labelMap(form.frequency)),
      line('Mowing Area', labelMap(form.mowingArea)),
      line('Lawn Currently Overgrown', yesNo(form.overgrown)),
      line('Pet Waste Cleanup Needed', yesNo(form.petWaste)),
      line('Photo Updates Requested', yesNo(form.photoUpdates))
    )
  }

  if (form.selectedPlan === 'rental') {
    rows.push(
      line('Rental Care Needed', labelMap(form.rentalNeed)),
      line('Rental / Property Size', labelMap(form.rentalSize)),
      line('Same-Day / Rush Timing', labelMap(form.sameDay)),
      line('Guest Checkout Time', form.checkoutTime),
      line('Next Guest Check-In Time', form.checkinTime),
      line('Laundry Setup', labelMap(form.laundry)),
      line('Restocking', labelMap(form.restocking)),
      line('Extra Trash Removal Needed', yesNo(form.trashRemoval))
    )
  }

  rows.push(
    listLine('Selected Add-On Services', selectedAddOnLabels(form.serviceSelections)),
    line('Access / Gate / Fence / Special Instructions', form.accessNotes),
    line('Notes', form.notes)
  )

  if (estimate?.lines?.length) {
    rows.push(line('Estimated Number', estimate.reviewRequired ? 'Review required' : currency(estimate.total)))
    estimate.lines.forEach(item => {
      rows.push(line(`Estimate Line - ${item.label}`, item.value))
    })
  }

  return `<table style="border-collapse:collapse;width:100%;margin-top:18px;">${rows.join('')}</table>`
}

function selectedAddOnLabels(selections) {
  const labels = {
    shrubMaintenance: 'Shrub trimming / shrub maintenance',
    yardCleanup: 'Yard cleanup',
    seasonalCleanup: 'Seasonal cleanup',
    exteriorWindowCleaning: 'Exterior window cleaning',
    curbAppealDetail: 'Curb Appeal & Exterior Detail',
    propertyPhotoUpdates: 'Property Checks & Photo Updates',
    minorRepairCoordination: 'Minor Repair Coordination',
    sprinklerSupport: 'Sprinkler Adjustment & Minor Irrigation Support',
    trashBinService: 'Trash Bin / Curbside Service'
  }

  return Array.isArray(selections)
    ? selections.map(key => labels[key] || key)
    : []
}

function yesNo(value) {
  return value === true || value === 'true' ? 'Yes' : 'No'
}

function labelMap(value) {
  const labels = {
    text: 'Text',
    call: 'Call',
    email: 'Email',

    saltLakeCounty: 'Salt Lake County',
    jeremyRanch: 'Jeremy Ranch / Kimball Junction',
    parkCity: 'Park City',
    deerValley: 'Deer Valley',
    otherMountain: 'Other mountain / vacation property area',

    home: 'Home',
    rental: 'Rental property',
    'short-term-rental': 'Short-term rental',
    'vacation-home': 'Vacation home',
    other: 'Other',

    basic: 'Basic Lawn Care Plan',
    exterior: 'Full Exterior Care Plan',
    rental: 'Rental / Short-Term Rental Care Plan',
    alacarte: 'Individual / À La Carte Service',

    small: 'Small property',
    medium: 'Medium property',
    large: 'Large property',
    largePlus: 'Large / corner lot / heavier care',

    weekly: 'Weekly',
    biweekly: 'Every other week',

    'front-only': 'Front yard only',
    'back-only': 'Back yard only',
    'front-and-back': 'Front and back yard',
    'large-corner': 'Large or corner lot',

    studio: 'Studio / 1 bed / 1 bath',
    twoBed: '2 bed / 1–2 bath',
    threeBed: '3 bed / 2 bath',
    fourBed: '4 bed / 3 bath',
    fivePlus: '5+ bed / larger vacation property',

    'one-time-backup': 'One-time backup turnover help',
    'recurring-turnover': 'Recurring turnover service',
    'same-day-turnover': 'Same-day turnover',
    'move-out-cleanup': 'Move-out cleanup',
    'guest-ready-reset': 'Guest-ready reset',

    none: 'No same-day rush',
    sameDay: 'Same-day turnover',
    tightWindow: 'Same-day under 4-hour window',
    emergencyBackup: 'Last-minute emergency / backup cleaner request',

    'clean-on-site': 'Clean replacement linens/towels already on-site',
    onsite: 'On-site laundry during turnover',
    full: 'Full laundry service / multiple loads',
    offsite: 'Off-site laundry handling',
    'host-handles': 'Host / owner handles laundry separately',

    'check-report': 'Check supplies and report low items',
    'restock-on-site': 'Restock using supplies already on-site',
    'notify-before': 'Notify host before replacing anything',
    'setup-system': 'Help set up a restocking system'
  }

  return labels[value] || value || '-'
}

function sanitizePhotos(photos) {
  if (!Array.isArray(photos)) return []

  return photos
    .slice(0, 4)
    .filter(photo => photo?.name && photo?.content)
    .map(photo => ({
      name: sanitizeFileName(photo.name),
      content: String(photo.content || '')
    }))
}

function sanitizeFileName(name) {
  const cleaned = String(name || 'property-care-photo.jpg')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)

  return cleaned || 'property-care-photo.jpg'
}

import { useMemo, useState } from 'react'

const COUNTY = 'Salt Lake County'
const MILE_RATE = 0.75
const PHONE_DISPLAY = '801-898-0281'
const PHONE_LINK = '8018980281'
const PUBLIC_EMAIL = 'ihiutah@gmail.com'

const sizeRanges = [
  { value: '0.10', label: 'Up to 0.10 acre', weeklyMulch: 55, weeklyBagLeave: 65, biweeklyMulch: 70, biweeklyBagLeave: 80 },
  { value: '0.25', label: '0.11 to 0.25 acre', weeklyMulch: 65, weeklyBagLeave: 75, biweeklyMulch: 85, biweeklyBagLeave: 95 },
  { value: '0.50', label: '0.26 to 0.50 acre', weeklyMulch: 85, weeklyBagLeave: 95, biweeklyMulch: 110, biweeklyBagLeave: 120 },
  { value: '0.75', label: '0.51 to 0.75 acre', weeklyMulch: 110, weeklyBagLeave: 120, biweeklyMulch: 140, biweeklyBagLeave: 150 },
  { value: '1.00', label: '0.76 to 1.00 acre', weeklyMulch: 135, weeklyBagLeave: 145, biweeklyMulch: 170, biweeklyBagLeave: 180 },
  { value: '1.50', label: '1.01 to 1.50 acres', weeklyMulch: 175, weeklyBagLeave: 190, biweeklyMulch: 220, biweeklyBagLeave: 235 },
  { value: '2.00', label: '1.51 to 2.00 acres', weeklyMulch: 225, weeklyBagLeave: 245, biweeklyMulch: 285, biweeklyBagLeave: 305 }
]

const cleanupRatePerPersonBlock = 35
const cleanupMinimum = 70
const extraLoad = 95
const dogWasteRecurring = 25
const overgrownFirstCut = 40
const bagHaulAwayUpcharge = 25
const deepEdgingRate = 4
const deepEdgingMinimum = 40
const shrubBlock = 30
const shrubMinimum = 40

function currency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0))
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function App() {
  const [form, setForm] = useState({
    address: '',
    county: COUNTY,
    contactName: '',
    phone: '',
    email: '',
    preferredContact: 'text',
    serviceMode: 'service',
    quoteType: 'mowing',
    sizeRange: '0.10',
    frequency: 'weekly',
    mowStyle: 'mulch',
    overgrownFirstCut: false,
    dogWaste: false,
    deepEdgingFeet: '',
    shrubBlocks: '',
    cleanupPeople: '1',
    cleanupHours: '1',
    cleanupExtraLoads: '0',
    outsideCountyMilesRoundTrip: '',
    notes: ''
  })

  const [sendState, setSendState] = useState({ status: 'idle', message: '' })

  function update(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const estimate = useMemo(() => {
    const range = sizeRanges.find(r => r.value === form.sizeRange) || sizeRanges[0]
    const recurringLines = []
    const oneTimeLines = []
    let perVisit = 0
    let recurringMonthly = 0
    let oneTimeTotal = 0

    if (form.quoteType === 'mowing') {
      if (form.frequency === 'weekly') {
        if (form.mowStyle === 'mulch') {
          perVisit = range.weeklyMulch
          recurringLines.push({ label: `Weekly mulch mow (${range.label})`, amount: range.weeklyMulch })
        } else if (form.mowStyle === 'bagLeave') {
          perVisit = range.weeklyBagLeave
          recurringLines.push({ label: `Weekly bag and leave (${range.label})`, amount: range.weeklyBagLeave })
        } else {
          perVisit = range.weeklyBagLeave + bagHaulAwayUpcharge
          recurringLines.push({ label: `Weekly bag and haul away (${range.label})`, amount: perVisit })
        }
      } else {
        if (form.mowStyle === 'mulch') {
          perVisit = range.biweeklyMulch
          recurringLines.push({ label: `Biweekly mulch mow (${range.label})`, amount: range.biweeklyMulch })
        } else if (form.mowStyle === 'bagLeave') {
          perVisit = range.biweeklyBagLeave
          recurringLines.push({ label: `Biweekly bag and leave (${range.label})`, amount: range.biweeklyBagLeave })
        } else {
          perVisit = range.biweeklyBagLeave + bagHaulAwayUpcharge
          recurringLines.push({ label: `Biweekly bag and haul away (${range.label})`, amount: perVisit })
        }
      }

      if (form.dogWaste) {
        perVisit += dogWasteRecurring
        recurringLines.push({ label: 'Recurring dog waste cleanup', amount: dogWasteRecurring })
      }

      const shrubBlocksCount = Number(form.shrubBlocks || 0)
      if (shrubBlocksCount > 0) {
        const shrubTotal = Math.max(shrubBlocksCount * shrubBlock, shrubMinimum)
        oneTimeLines.push({ label: `Shrub trimming (${shrubBlocksCount} block${shrubBlocksCount === 1 ? '' : 's'})`, amount: shrubTotal })
        oneTimeTotal += shrubTotal
      }

      const deepEdgingFeet = Number(form.deepEdgingFeet || 0)
      if (deepEdgingFeet > 0) {
        const edgingTotal = Math.max(deepEdgingFeet * deepEdgingRate, deepEdgingMinimum)
        oneTimeLines.push({ label: `Deep edging (${deepEdgingFeet} linear feet)`, amount: edgingTotal })
        oneTimeTotal += edgingTotal
      }

      if (form.overgrownFirstCut) {
        oneTimeLines.push({ label: 'Overgrown first-cut fee', amount: overgrownFirstCut })
        oneTimeTotal += overgrownFirstCut
      }

      recurringMonthly = perVisit * (form.frequency === 'weekly' ? 4 : 2)
    } else {
      const people = Math.max(Number(form.cleanupPeople || 1), 1)
      const hours = Math.max(Number(form.cleanupHours || 1), 1)
      const blocks = hours * 2
      const labor = Math.max(people * blocks * cleanupRatePerPersonBlock, cleanupMinimum)
      oneTimeLines.push({ label: `Spring cleanup labor (${people} person${people === 1 ? '' : 's'} x ${hours} hour${hours === 1 ? '' : 's'})`, amount: labor })
      oneTimeTotal += labor

      const loads = Number(form.cleanupExtraLoads || 0)
      if (loads > 0) {
        const loadTotal = loads * extraLoad
        oneTimeLines.push({ label: `Additional debris load${loads === 1 ? '' : 's'} (${loads})`, amount: loadTotal })
        oneTimeTotal += loadTotal
      }

      const shrubBlocksCount = Number(form.shrubBlocks || 0)
      if (shrubBlocksCount > 0) {
        const shrubTotal = Math.max(shrubBlocksCount * shrubBlock, shrubMinimum)
        oneTimeLines.push({ label: `Shrub trimming (${shrubBlocksCount} block${shrubBlocksCount === 1 ? '' : 's'})`, amount: shrubTotal })
        oneTimeTotal += shrubTotal
      }
    }

    const travelMiles = form.county === COUNTY ? 0 : Number(form.outsideCountyMilesRoundTrip || 0)
    const travel = travelMiles > 0 ? travelMiles * MILE_RATE : 0
    if (travel > 0) {
      oneTimeLines.push({ label: `Travel charge (${travelMiles} round-trip mile${travelMiles === 1 ? '' : 's'})`, amount: travel })
    }

    const firstBill = recurringMonthly + oneTimeTotal + travel
    const recurringAfterFirst = recurringMonthly + travel

    return {
      recurringLines,
      oneTimeLines,
      perVisit,
      recurringMonthly,
      oneTimeTotal,
      travel,
      firstBill,
      recurringAfterFirst
    }
  }, [form])

  async function sendEstimate() {
    setSendState({ status: 'sending', message: 'Sending estimate...' })

    if (!form.contactName || !form.email || !form.address) {
      setSendState({ status: 'error', message: 'Please enter name, email, and property address first.' })
      return
    }

    try {
      const response = await fetch('/.netlify/functions/send-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, estimate })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.message || 'Could not send estimate.')
      }

      setSendState({ status: 'success', message: 'Estimate sent to customer and to your inbox.' })
    } catch (error) {
      setSendState({ status: 'error', message: error.message || 'Could not send estimate.' })
    }
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <img src="/logo.png" alt="In House Property Care" className="brand-logo" />
          <div>
            <div className="eyebrow">Premium • Friendly • Trustworthy</div>
            <h1>In House Property Care</h1>
            <p className="lead">Fast, professional property care with line-item estimates, easy contact, and no wasted time.</p>
            <div className="contact-pill-row">
              <a className="contact-pill" href={`tel:${PHONE_LINK}`}>Call {PHONE_DISPLAY}</a>
              <a className="contact-pill" href={`sms:${PHONE_LINK}`}>Text {PHONE_DISPLAY}</a>
              <a className="contact-pill" href={`mailto:${PUBLIC_EMAIL}`}>{PUBLIC_EMAIL}</a>
            </div>
          </div>
        </div>

        <div className="cta-grid">
          <button className="cta-card cta-primary" onClick={() => scrollToId('estimate')}>
            <strong>Get an Instant Estimate</strong>
            <span>Build a line-item estimate and email it to yourself and the customer.</span>
          </button>
          <button className="cta-card cta-secondary" onClick={() => scrollToId('request-care')}>
            <strong>Request Property Care</strong>
            <span>Skip the quote builder and jump straight to call, text, or email options.</span>
          </button>
        </div>
      </header>

      <section className="panel intro-panel">
        <div className="mini-grid">
          <div className="mini-card">
            <strong>What this site does</strong>
            <span>Shows a general estimate first, then final pricing is verified before contract signing.</span>
          </div>
          <div className="mini-card">
            <strong>How pricing works</strong>
            <span>Mowing is size-based. Cleanups are labor-based. Add-ons are shown as separate line items.</span>
          </div>
          <div className="mini-card">
            <strong>How service starts</strong>
            <span>Review → verification → contract → signed approval → service begins.</span>
          </div>
        </div>
      </section>

      <main className="main-grid">
        <section className="panel" id="estimate">
          <h2>Instant estimate</h2>
          <div className="disclaimer">
            Estimated quote only. Final price is subject to verification of property size, site conditions, and selected services. Service begins only after contract review and signing.
          </div>

          <div className="form-grid">
            <label>
              Property address
              <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main St, City, State" />
            </label>

            <label>
              County
              <select value={form.county} onChange={e => update('county', e.target.value)}>
                <option>{COUNTY}</option>
                <option>Outside Salt Lake County</option>
              </select>
            </label>

            {form.county !== COUNTY && (
              <label>
                Estimated round-trip miles outside county
                <input type="number" min="0" value={form.outsideCountyMilesRoundTrip} onChange={e => update('outsideCountyMilesRoundTrip', e.target.value)} placeholder="0" />
              </label>
            )}

            <label>
              I want to...
              <select value={form.serviceMode} onChange={e => update('serviceMode', e.target.value)}>
                <option value="service">Request service now</option>
                <option value="verify">Request verification first</option>
              </select>
            </label>

            <label>
              Quote type
              <select value={form.quoteType} onChange={e => update('quoteType', e.target.value)}>
                <option value="mowing">Mowing service</option>
                <option value="cleanup">Spring cleanup</option>
              </select>
            </label>

            {form.quoteType === 'mowing' ? (
              <>
                <label>
                  Property size range
                  <select value={form.sizeRange} onChange={e => update('sizeRange', e.target.value)}>
                    {sizeRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Frequency
                  <select value={form.frequency} onChange={e => update('frequency', e.target.value)}>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                  </select>
                </label>

                <label>
                  Mow style
                  <select value={form.mowStyle} onChange={e => update('mowStyle', e.target.value)}>
                    <option value="mulch">Mulch mow</option>
                    <option value="bagLeave">Bag and leave</option>
                    <option value="bagHaulAway">Bag and haul away</option>
                  </select>
                </label>

                <label className="checkbox-row">
                  <input type="checkbox" checked={form.overgrownFirstCut} onChange={e => update('overgrownFirstCut', e.target.checked)} />
                  Add overgrown first-cut fee
                </label>

                <label className="checkbox-row">
                  <input type="checkbox" checked={form.dogWaste} onChange={e => update('dogWaste', e.target.checked)} />
                  Add recurring dog waste cleanup
                </label>

                <label>
                  Deep edging linear feet
                  <input type="number" min="0" value={form.deepEdgingFeet} onChange={e => update('deepEdgingFeet', e.target.value)} placeholder="0" />
                </label>

                <label>
                  Shrub trimming blocks (30 minutes each)
                  <input type="number" min="0" value={form.shrubBlocks} onChange={e => update('shrubBlocks', e.target.value)} placeholder="0" />
                </label>
              </>
            ) : (
              <>
                <label>
                  Number of people
                  <input type="number" min="1" value={form.cleanupPeople} onChange={e => update('cleanupPeople', e.target.value)} />
                </label>

                <label>
                  Estimated labor hours
                  <input type="number" min="1" step="0.5" value={form.cleanupHours} onChange={e => update('cleanupHours', e.target.value)} />
                </label>

                <label>
                  Additional trailer loads
                  <input type="number" min="0" value={form.cleanupExtraLoads} onChange={e => update('cleanupExtraLoads', e.target.value)} />
                </label>

                <label>
                  Shrub trimming blocks (30 minutes each)
                  <input type="number" min="0" value={form.shrubBlocks} onChange={e => update('shrubBlocks', e.target.value)} placeholder="0" />
                </label>
              </>
            )}

            <label>
              Your name
              <input value={form.contactName} onChange={e => update('contactName', e.target.value)} placeholder="Your full name" />
            </label>

            <label>
              Phone
              <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="801-898-0281" />
            </label>

            <label>
              Email
              <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="customer@example.com" />
            </label>

            <label>
              Preferred contact method
              <select value={form.preferredContact} onChange={e => update('preferredContact', e.target.value)}>
                <option value="text">Text</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
              </select>
            </label>

            <label className="full-width">
              Notes
              <textarea rows="4" value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Gate notes, pets, photos to request, special requests, or details you want us to know" />
            </label>
          </div>
        </section>

        <aside className="panel estimate-panel">
          <h2>Your estimate</h2>

          {estimate.recurringLines.length > 0 && (
            <>
              <h3 className="subhead">Recurring line items</h3>
              <div className="line-list">
                {estimate.recurringLines.map((line, index) => (
                  <div className="line-row" key={`r-${index}`}>
                    <span>{line.label}</span>
                    <strong>{currency(line.amount)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}

          {estimate.oneTimeLines.length > 0 && (
            <>
              <h3 className="subhead">One-time line items</h3>
              <div className="line-list">
                {estimate.oneTimeLines.map((line, index) => (
                  <div className="line-row" key={`o-${index}`}>
                    <span>{line.label}</span>
                    <strong>{currency(line.amount)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="totals-box">
            {form.quoteType === 'mowing' ? (
              <>
                <div className="estimate-row"><span>Estimated per visit</span><strong>{currency(estimate.perVisit)}</strong></div>
                <div className="estimate-row"><span>Estimated monthly service</span><strong>{currency(estimate.recurringMonthly)}</strong></div>
                <div className="estimate-row"><span>One-time add-ons / first visit</span><strong>{currency(estimate.oneTimeTotal + estimate.travel)}</strong></div>
                <div className="estimate-total"><span>Estimated first bill</span><strong>{currency(estimate.firstBill)}</strong></div>
                <div className="estimate-row muted"><span>Estimated recurring monthly after first bill</span><strong>{currency(estimate.recurringAfterFirst)}</strong></div>
              </>
            ) : (
              <>
                <div className="estimate-row"><span>Estimated cleanup total</span><strong>{currency(estimate.oneTimeTotal)}</strong></div>
                <div className="estimate-row"><span>Travel charge</span><strong>{currency(estimate.travel)}</strong></div>
                <div className="estimate-total"><span>Estimated total</span><strong>{currency(estimate.oneTimeTotal + estimate.travel)}</strong></div>
              </>
            )}
          </div>

          <button className="send-button" onClick={sendEstimate} disabled={sendState.status === 'sending'}>
            {sendState.status === 'sending' ? 'Sending...' : 'Send Estimate to Customer and Me'}
          </button>

          {sendState.message && (
            <div className={`message-box ${sendState.status}`}>
              {sendState.message}
            </div>
          )}

          <ul className="policy-list">
            <li>Monthly statements available for recurring service.</li>
            <li>Payment due within 10 days of billing.</li>
            <li>Late fee begins after day 10.</li>
            <li>Service may pause on the next scheduled visit if past due.</li>
            <li>Contracts are sent after review and verification.</li>
          </ul>
        </aside>
      </main>

      <section className="panel request-panel" id="request-care">
        <div className="request-header">
          <div>
            <h2>Request Property Care</h2>
            <p>Use the estimate builder above, or skip it and contact us directly. We can review the property, verify details, and send the contract after review.</p>
          </div>
        </div>

        <div className="request-grid">
          <a className="contact-card" href={`tel:${PHONE_LINK}`}>
            <strong>Call</strong>
            <span>{PHONE_DISPLAY}</span>
          </a>
          <a className="contact-card" href={`sms:${PHONE_LINK}`}>
            <strong>Text</strong>
            <span>{PHONE_DISPLAY}</span>
          </a>
          <a className="contact-card" href={`mailto:${PUBLIC_EMAIL}`}>
            <strong>Email</strong>
            <span>{PUBLIC_EMAIL}</span>
          </a>
        </div>
      </section>
    </div>
  )
}

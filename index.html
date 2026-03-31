import { useMemo, useState } from 'react'

const COUNTY = 'Salt Lake County'
const MILE_RATE = 0.75

const sizeRanges = [
  { value: '0.10', label: 'Up to 0.10 acre', weeklyMulch: 55, weeklyBagLeave: 65, biweeklyMulch: 70 },
  { value: '0.25', label: '0.11 to 0.25 acre', weeklyMulch: 65, weeklyBagLeave: 75, biweeklyMulch: 85 },
  { value: '0.50', label: '0.26 to 0.50 acre', weeklyMulch: 85, weeklyBagLeave: 95, biweeklyMulch: 110 },
  { value: '0.75', label: '0.51 to 0.75 acre', weeklyMulch: 110, weeklyBagLeave: 120, biweeklyMulch: 140 },
  { value: '1.00', label: '0.76 to 1.00 acre', weeklyMulch: 135, weeklyBagLeave: 145, biweeklyMulch: 170 },
  { value: '1.50', label: '1.01 to 1.50 acres', weeklyMulch: 175, weeklyBagLeave: 190, biweeklyMulch: 220 },
  { value: '2.00', label: '1.51 to 2.00 acres', weeklyMulch: 225, weeklyBagLeave: 245, biweeklyMulch: 285 }
]

const cleanupRate = 35
const cleanupMin = 70
const extraLoad = 95
const dogWaste = 25
const overgrown = 40
const bagHaulAwayUpcharge = 25
const deepEdgingRate = 4
const deepEdgingMin = 40
const shrubBlock = 30
const shrubMin = 40

function currency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0))
}

export default function App() {
  const [form, setForm] = useState({
    address: '',
    county: COUNTY,
    contactName: '',
    phone: '',
    email: '',
    preferredContact: 'text',
    serviceMode: 'estimate',
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

  function update(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const estimate = useMemo(() => {
    const selectedRange = sizeRanges.find(r => r.value === form.sizeRange) || sizeRanges[0]
    let perVisit = 0
    let monthly = 0
    let oneTime = 0

    if (form.quoteType === 'mowing') {
      if (form.frequency === 'weekly') {
        perVisit = form.mowStyle === 'bagLeave' ? selectedRange.weeklyBagLeave : selectedRange.weeklyMulch
      } else {
        perVisit = selectedRange.biweeklyMulch
      }

      if (form.mowStyle === 'bagHaulAway') {
        perVisit = selectedRange.weeklyBagLeave + bagHaulAwayUpcharge
      }

      if (form.overgrownFirstCut) oneTime += overgrown
      if (form.dogWaste) oneTime += dogWaste

      const deepEdgingFeet = Number(form.deepEdgingFeet || 0)
      if (deepEdgingFeet > 0) {
        oneTime += Math.max(deepEdgingFeet * deepEdgingRate, deepEdgingMin)
      }

      const shrubBlocksCount = Number(form.shrubBlocks || 0)
      if (shrubBlocksCount > 0) {
        oneTime += Math.max(shrubBlocksCount * shrubBlock, shrubMin)
      }

      monthly = form.frequency === 'weekly' ? perVisit * 4 : perVisit * 2
    } else {
      const people = Number(form.cleanupPeople || 1)
      const hours = Math.max(Number(form.cleanupHours || 1), 1)
      const loads = Number(form.cleanupExtraLoads || 0)
      oneTime = Math.max(people * hours * cleanupRate * 2, cleanupMin)
      oneTime += loads * extraLoad

      const shrubBlocksCount = Number(form.shrubBlocks || 0)
      if (shrubBlocksCount > 0) {
        oneTime += Math.max(shrubBlocksCount * shrubBlock, shrubMin)
      }
    }

    const travelMiles = form.county === COUNTY ? 0 : Number(form.outsideCountyMilesRoundTrip || 0)
    const travel = travelMiles > 0 ? travelMiles * MILE_RATE : 0
    const totalNow = oneTime + travel
    const monthlyWithTravel = monthly + travel

    return { perVisit, monthly, oneTime, travel, totalNow, monthlyWithTravel }
  }, [form])

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <img src="/logo.png" alt="In House Property Care" className="brand-logo" />
          <div>
            <div className="eyebrow">Premium • Friendly • Trustworthy</div>
            <h1>In House Property Care</h1>
            <p className="lead">Fast, professional property care with instant estimates and personal follow-up.</p>
          </div>
        </div>
        <div className="cta-stack">
          <a className="button button-primary" href="#estimate">Get an Instant Estimate</a>
          <a className="button button-secondary" href="#contact">Request Property Care</a>
        </div>
      </header>

      <main className="main-grid">
        <section className="panel hero-panel">
          <h2>Property care without wasting your time</h2>
          <p>
            Enter your address, choose your services, and see a general estimate before you ever need to meet in person.
            Final pricing is subject to verification of property size, site conditions, and selected services.
          </p>
          <div className="feature-grid">
            <div className="feature-card"><strong>Weekly & Biweekly Mowing</strong><span>Trim, standard edging, and blower cleanup included.</span></div>
            <div className="feature-card"><strong>Spring Cleanups</strong><span>Labor-based quotes with debris removal included for normal jobs.</span></div>
            <div className="feature-card"><strong>Request Service or Verification</strong><span>Choose the contact method you prefer: text, call, or email.</span></div>
          </div>
        </section>

        <section className="panel" id="estimate">
          <h2>Instant estimate</h2>
          <div className="disclaimer">Estimated quote only. Final price is subject to verification of property size, site conditions, and selected services. Service begins only after contract review and signing.</div>

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
                <input type="number" min="0" value={form.outsideCountyMilesRoundTrip} onChange={e => update('outsideCountyMilesRoundTrip', e.target.value)} placeholder="40" />
              </label>
            )}

            <label>
              I want to...
              <select value={form.serviceMode} onChange={e => update('serviceMode', e.target.value)}>
                <option value="estimate">Request service now</option>
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
                    {sizeRanges.map(range => <option key={range.value} value={range.value}>{range.label}</option>)}
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
                  Add dog waste cleanup
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
              <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Your phone number" />
            </label>

            <label>
              Email
              <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="Your email address" />
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
              <textarea rows="4" value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Gate notes, pets, special requests, or details you want us to know" />
            </label>
          </div>
        </section>

        <aside className="panel estimate-panel">
          <h2>Your estimate</h2>
          {form.quoteType === 'mowing' ? (
            <>
              <div className="estimate-row"><span>Estimated per visit</span><strong>{currency(estimate.perVisit)}</strong></div>
              <div className="estimate-row"><span>Estimated monthly service</span><strong>{currency(estimate.monthly)}</strong></div>
              <div className="estimate-row"><span>One-time add-ons / first visit</span><strong>{currency(estimate.oneTime)}</strong></div>
              <div className="estimate-row"><span>Travel charge</span><strong>{currency(estimate.travel)}</strong></div>
              <div className="estimate-total"><span>Estimated first bill</span><strong>{currency(estimate.monthlyWithTravel + estimate.oneTime)}</strong></div>
              <div className="estimate-row muted"><span>Estimated recurring monthly after first bill</span><strong>{currency(estimate.monthlyWithTravel)}</strong></div>
            </>
          ) : (
            <>
              <div className="estimate-row"><span>Estimated cleanup total</span><strong>{currency(estimate.oneTime)}</strong></div>
              <div className="estimate-row"><span>Travel charge</span><strong>{currency(estimate.travel)}</strong></div>
              <div className="estimate-total"><span>Estimated total</span><strong>{currency(estimate.totalNow)}</strong></div>
            </>
          )}
          <ul className="policy-list">
            <li>Monthly statements available for recurring service.</li>
            <li>Payment due within 10 days of billing.</li>
            <li>Late fee begins after day 10.</li>
            <li>Service may pause on the next scheduled visit if past due.</li>
            <li>Contracts are sent after review and verification.</li>
          </ul>
        </aside>

        <section className="panel" id="contact">
          <h2>Request property care</h2>
          <p>Prefer to skip the estimate builder? Reach out by text, call, or email and we’ll review your property care needs with you.</p>
          <div className="contact-grid">
            <a className="contact-card" href="tel:5555555555"><strong>Call</strong><span>Add your business number here</span></a>
            <a className="contact-card" href="sms:5555555555"><strong>Text</strong><span>Fastest for quick questions</span></a>
            <a className="contact-card" href="mailto:hello@propertycare.inhouseinstall.com"><strong>Email</strong><span>Best for photos and details</span></a>
          </div>
        </section>
      </main>
    </div>
  )
}

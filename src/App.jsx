import { useMemo, useState } from 'react'

const PHONE_DISPLAY = '801-898-0281'
const PHONE_LINK = '8018980281'
const PUBLIC_EMAIL = 'ihiutah@gmail.com'

const serviceAreas = {
  saltLakeCounty: { label: 'Salt Lake County', adjustment: 0, minimum: 0, review: false },
  jeremyRanch: { label: 'Jeremy Ranch / Kimball Junction', adjustment: 45, minimum: 175, review: false },
  parkCity: { label: 'Park City', adjustment: 65, minimum: 225, review: false },
  deerValley: { label: 'Deer Valley', adjustment: 85, minimum: 250, review: false },
  otherMountain: { label: 'Other mountain / vacation property area', adjustment: 0, minimum: 0, review: true }
}

const basicPrices = {
  weekly: { small: 55, medium: 65, large: 85, largePlus: 110 },
  biweekly: { small: 70, medium: 85, large: 110, largePlus: 140 }
}

const exteriorPrices = {
  weekly: { small: 95, medium: 125, large: 165, largePlus: 210 },
  biweekly: { small: 125, medium: 160, large: 210, largePlus: 275 }
}

const rentalPrices = {
  studio: 145,
  twoBed: 185,
  threeBed: 225,
  fourBed: 295,
  fivePlus: 375
}

const addOnPrices = {
  shrubMaintenance: 45,
  yardCleanup: 95,
  seasonalCleanup: 145,
  exteriorWindowCleaning: 75,
  curbAppealDetail: 65,
  propertyPhotoUpdates: 35,
  minorRepairCoordination: 45,
  sprinklerSupport: 55,
  petWaste: 25,
  trashBinService: 15,
  trashRemoval: 25,
  restockOnSite: 15,
  sameDay: 50,
  tightWindow: 75,
  emergencyBackup: 100,
  laundryOnSite: 35,
  laundryFull: 65,
  overgrownFirstCut: 40
}

const propertySizes = {
  small: 'Small property',
  medium: 'Medium property',
  large: 'Large property',
  largePlus: 'Large / corner lot / heavier care'
}

const rentalSizes = {
  studio: 'Studio / 1 bed / 1 bath',
  twoBed: '2 bed / 1–2 bath',
  threeBed: '3 bed / 2 bath',
  fourBed: '4 bed / 3 bath',
  fivePlus: '5+ bed / larger vacation property'
}

const galleryPhotos = [
  {
    src: '/photos/lawn-care-yard-maintenance.jpg',
    title: 'Lawn Care & Yard Maintenance',
    alt: 'Lawn care and yard maintenance in Salt Lake County'
  },
  {
    src: '/photos/spring-fall-cleanup-south-jordan-utah.jpg',
    title: 'Spring & Fall Cleanup',
    alt: 'Spring and fall yard cleanup in South Jordan Utah'
  },
  {
    src: '/photos/exterior-property-care.jpg',
    title: 'Exterior Property Care',
    alt: 'Exterior property care cleanup'
  },
  {
    src: '/photos/landscape-maintenance.jpg',
    title: 'Landscape Maintenance',
    alt: 'Landscape maintenance and cleanup'
  }
]

const addOnServices = [
  { key: 'shrubMaintenance', label: 'Shrub trimming / shrub maintenance', price: addOnPrices.shrubMaintenance },
  { key: 'yardCleanup', label: 'Yard cleanup / weeding cleanup', price: addOnPrices.yardCleanup },
  { key: 'seasonalCleanup', label: 'Seasonal cleanup', price: addOnPrices.seasonalCleanup },
  { key: 'exteriorWindowCleaning', label: 'Exterior window cleaning', price: addOnPrices.exteriorWindowCleaning },
  { key: 'curbAppealDetail', label: 'Curb Appeal & Exterior Detail', price: addOnPrices.curbAppealDetail },
  { key: 'propertyPhotoUpdates', label: 'Property Checks & Photo Updates', price: addOnPrices.propertyPhotoUpdates },
  { key: 'minorRepairCoordination', label: 'Minor Repair Coordination', price: addOnPrices.minorRepairCoordination },
  { key: 'sprinklerSupport', label: 'Sprinkler Adjustment & Minor Irrigation Support', price: addOnPrices.sprinklerSupport },
  { key: 'trashBinService', label: 'Trash Bin / Curbside Service', price: addOnPrices.trashBinService }
]

const buildYourOwnServices = [
  { key: 'basicLawnService', label: 'Basic lawn service', type: 'basicLawn' },
  { key: 'fullExteriorService', label: 'Full exterior care service', type: 'fullExterior' },
  ...addOnServices
]

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

function toBoolean(value) {
  return value === true || value === 'true'
}

function getPath() {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

async function readPhotoFiles(fileList) {
  const files = Array.from(fileList || []).slice(0, 4)

  const readers = files.map(file => (
    new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const result = String(reader.result || '')
        const base64 = result.includes(',') ? result.split(',')[1] : result

        resolve({
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          content: base64
        })
      }

      reader.onerror = () => reject(new Error(`Unable to read ${file.name}`))
      reader.readAsDataURL(file)
    })
  ))

  return Promise.all(readers)
}

export default function App() {
  const [page, setPage] = useState(() => {
    const path = getPath()
    if (path === '/estimate') return 'estimate'
    if (path === '/gallery') return 'gallery'
    return 'home'
  })

  function goToPage(nextPage, path = '/') {
    setPage(nextPage)
    window.history.pushState({}, '', path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goHome(sectionId = '') {
    setPage('home')
    window.history.pushState({}, '', sectionId ? `/#${sectionId}` : '/')

    setTimeout(() => {
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 50)
  }

  return (
    <div className="site-shell">
      <Header
        goHome={goHome}
        goToEstimate={() => goToPage('estimate', '/estimate')}
        goToGallery={() => goToPage('gallery', '/gallery')}
      />

      {page === 'estimate' && <EstimatePage />}
      {page === 'gallery' && <GalleryPage goToEstimate={() => goToPage('estimate', '/estimate')} />}
      {page === 'home' && (
        <HomePage
          goToEstimate={() => goToPage('estimate', '/estimate')}
          goToGallery={() => goToPage('gallery', '/gallery')}
        />
      )}

      <a
        className="mobile-estimate-button"
        href="/estimate"
        onClick={event => {
          event.preventDefault()
          goToPage('estimate', '/estimate')
        }}
      >
        Request Free Estimate
      </a>
    </div>
  )
}

function Header({ goHome, goToEstimate, goToGallery }) {
  return (
    <header className="topbar">
      <button className="brand-button" type="button" onClick={() => goHome()}>
        <img src="/logo.png" alt="In House Property Care" className="brand-logo" />
      </button>

      <nav className="nav-links" aria-label="Main navigation">
        <button type="button" onClick={() => goHome()}>Home</button>
        <button type="button" onClick={() => goHome('services')}>Services</button>
        <button type="button" onClick={goToGallery}>Gallery</button>
        <button className="nav-cta" type="button" onClick={goToEstimate}>Request Free Estimate</button>
      </nav>
    </header>
  )
}

function HomePage({ goToEstimate, goToGallery }) {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">Based in West Jordan • Serving Salt Lake County</div>
          <h1>Reliable Property Care for Homes, Rentals &amp; Short-Term Stays</h1>
          <p className="lead">
            Helping Airbnb hosts, VRBO hosts, rental property owners, and vacation homeowners keep properties clean,
            maintained, guest-ready, and looking their best.
          </p>
          <p className="service-area-line">
            Based in West Jordan and serving Salt Lake County, with short-term rental and vacation property care available
            in Park City, Deer Valley, Jeremy Ranch, and select surrounding areas.
          </p>

          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={goToEstimate}>Request Free Estimate</button>
            <a className="button button-secondary" href={`tel:${PHONE_LINK}`}>Call or Text Now</a>
          </div>
        </div>

        <div className="hero-card">
          <strong>Weekly lawn care starting at $55</strong>
          <span>Small, regularly maintained lawns. Larger yards, overgrowth, pet waste, access issues, or extra cleanup may increase the estimate.</span>
        </div>
      </section>

      <section className="section-panel compact" id="services">
        <div className="section-heading">
          <span className="eyebrow">Services</span>
          <h2>Choose a Care Plan or Individual Service</h2>
          <p>
            Choose a recurring care plan, build your own service request, or add individual services as needed.
            We’ll review your property details, photos, and service needs before confirming final pricing.
          </p>
        </div>

        <div className="plan-grid">
          <PlanCard
            title="Basic Lawn Care Plan"
            price="Starting at $55/week"
            text="Mowing, edging, driveway and sidewalk blow-off, light yard check, and optional photo updates."
            button="Request Lawn Care Estimate"
            onClick={goToEstimate}
          />
          <PlanCard
            title="Full Exterior Care Plan"
            price="Starting at $95/week"
            text="Mowing, edging, weed control, basic exterior check, and ongoing curb appeal support."
            button="Request Exterior Care Estimate"
            onClick={goToEstimate}
          />
          <PlanCard
            title="Rental / Short-Term Rental Care"
            price="Turnovers from $145"
            text="Guest-ready resets, trash checks, restocking checks, and issue reporting for rentals, Airbnb, VRBO, and vacation homes."
            button="Request Rental Care Estimate"
            onClick={goToEstimate}
          />
        </div>
      </section>

      <section className="section-panel service-summary">
        <div>
          <span className="eyebrow">Flexible Services</span>
          <h2>Build Your Own / Add-On Services</h2>
          <p>
            Not ready for a full plan? Build your own request with individual services like yard cleanup, shrub trimming,
            exterior window cleaning, curb appeal detail, sprinkler support, trash bin service, or property photo updates.
          </p>
        </div>
        <button className="button button-primary" type="button" onClick={goToEstimate}>Build Your Estimate</button>
      </section>

      <section className="section-panel compact" id="gallery">
        <div className="section-heading">
          <span className="eyebrow">Recent Work</span>
          <h2>Recent Property Care Work</h2>
          <p>See examples of lawn care, cleanup, exterior detail, and property care work completed for local properties.</p>
        </div>

        <div className="gallery-grid">
          {galleryPhotos.map(photo => (
            <figure className="gallery-card" key={photo.src}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
              <figcaption>{photo.title}</figcaption>
            </figure>
          ))}
        </div>

        <div className="section-footer-action">
          <button className="button button-secondary" type="button" onClick={goToGallery}>View Full Gallery</button>
        </div>
      </section>

      <section className="section-panel contact-panel">
        <div>
          <span className="eyebrow">Get Started</span>
          <h2>Ready for a property care estimate?</h2>
          <p>
            Send your property details and photos when available. We’ll review the request and follow up before service is confirmed.
          </p>
        </div>

        <div className="contact-actions">
          <button className="button button-primary" type="button" onClick={goToEstimate}>Request Free Estimate</button>
          <a className="button button-secondary" href={`sms:${PHONE_LINK}`}>Text {PHONE_DISPLAY}</a>
        </div>
      </section>
    </main>
  )
}

function GalleryPage({ goToEstimate }) {
  return (
    <main>
      <section className="section-panel compact">
        <div className="section-heading">
          <span className="eyebrow">Gallery</span>
          <h1>Property Care Gallery</h1>
          <p>
            A growing collection of lawn care, cleanup, exterior detail, and property care work. More project photos will be added as new work is completed.
          </p>
        </div>

        <div className="gallery-grid gallery-grid-large">
          {galleryPhotos.map(photo => (
            <figure className="gallery-card" key={photo.src}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
              <figcaption>{photo.title}</figcaption>
            </figure>
          ))}
        </div>

        <div className="section-footer-action">
          <button className="button button-primary" type="button" onClick={goToEstimate}>Request Free Estimate</button>
        </div>
      </section>
    </main>
  )
}

function PlanCard({ title, price, text, button, onClick }) {
  return (
    <article className="plan-card">
      <div>
        <h3>{title}</h3>
        <strong>{price}</strong>
        <p>{text}</p>
      </div>
      <button className="button button-card" type="button" onClick={onClick}>{button}</button>
    </article>
  )
}

function EstimatePage() {
  const [form, setForm] = useState({
    selectedPlan: 'basic',
    contactName: '',
    phone: '',
    email: '',
    preferredContact: 'text',
    propertyAddress: '',
    serviceArea: 'saltLakeCounty',
    propertyType: 'home',
    propertySize: 'small',
    frequency: 'weekly',
    mowingArea: 'front-and-back',
    overgrown: 'false',
    petWaste: 'false',
    photoUpdates: 'false',
    accessNotes: '',
    rentalSize: 'studio',
    rentalNeed: 'one-time-backup',
    sameDay: 'none',
    checkoutTime: '',
    checkinTime: '',
    laundry: 'clean-on-site',
    restocking: 'check-report',
    trashRemoval: 'false',
    serviceSelections: [],
    notes: ''
  })

  const [photoFiles, setPhotoFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [sendMessage, setSendMessage] = useState('')

  function update(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function setPlan(plan) {
    setForm(prev => ({
      ...prev,
      selectedPlan: plan,
      serviceSelections: []
    }))
  }

  function toggleService(key) {
    setForm(prev => {
      const exists = prev.serviceSelections.includes(key)
      return {
        ...prev,
        serviceSelections: exists
          ? prev.serviceSelections.filter(item => item !== key)
          : [...prev.serviceSelections, key]
      }
    })
  }

  const estimate = useMemo(() => buildEstimate(form), [form])

  async function sendEstimateRequest() {
    setSendMessage('')

    if (!form.contactName.trim() || !form.phone.trim() || !form.email.trim() || !form.propertyAddress.trim()) {
      setSendMessage('Please enter your name, phone, email, and property address before submitting.')
      return
    }

    if (form.selectedPlan === 'build' && form.serviceSelections.length === 0) {
      setSendMessage('Please choose at least one Build Your Own / Add-On Service before submitting.')
      return
    }

    setSending(true)

    try {
      const photos = await readPhotoFiles(photoFiles)

      const response = await fetch('/.netlify/functions/send-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, estimate, photos })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Unable to send your request right now.')
      }

      setSendMessage('Your estimate request was sent. We will review it and follow up before service is confirmed.')
    } catch (error) {
      setSendMessage(error.message || 'Something went wrong while sending the request.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="estimate-layout">
      <section className="section-panel estimate-form-panel">
        <div className="section-heading">
          <span className="eyebrow">Free Estimate</span>
          <h1>Request a Free Property Care Estimate</h1>
          <p>
            Choose a plan or build your own service request. The estimator shows an estimated total, and final pricing is reviewed before service is confirmed.
          </p>
        </div>

        <div className="plan-choice-grid">
          <ChoiceButton active={form.selectedPlan === 'basic'} onClick={() => setPlan('basic')} title="Basic Lawn Care" text="Mowing, edging, and blow-off" />
          <ChoiceButton active={form.selectedPlan === 'exterior'} onClick={() => setPlan('exterior')} title="Full Exterior Care" text="Mowing, weed control, exterior care" />
          <ChoiceButton active={form.selectedPlan === 'rental'} onClick={() => setPlan('rental')} title="Rental / Short-Term Rental" text="Turnovers and guest-ready resets" />
          <ChoiceButton active={form.selectedPlan === 'build'} onClick={() => setPlan('build')} title="Build Your Own / Add-On Services" text="Choose only the services you need" />
        </div>

        <div className="form-grid">
          <label>
            Name
            <input value={form.contactName} onChange={e => update('contactName', e.target.value)} placeholder="Your name" />
          </label>

          <label>
            Phone
            <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Phone number" />
          </label>

          <label>
            Email
            <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email address" />
          </label>

          <label>
            Preferred contact
            <select value={form.preferredContact} onChange={e => update('preferredContact', e.target.value)}>
              <option value="text">Text</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
            </select>
          </label>

          <label className="full-width">
            Property address or city
            <input value={form.propertyAddress} onChange={e => update('propertyAddress', e.target.value)} placeholder="Property address or city" />
          </label>

          <label>
            Service area
            <select value={form.serviceArea} onChange={e => update('serviceArea', e.target.value)}>
              {Object.entries(serviceAreas).map(([key, area]) => (
                <option key={key} value={key}>{area.label}</option>
              ))}
            </select>
          </label>

          <label>
            Property type
            <select value={form.propertyType} onChange={e => update('propertyType', e.target.value)}>
              <option value="home">Home</option>
              <option value="rental">Rental property</option>
              <option value="short-term-rental">Short-term rental</option>
              <option value="vacation-home">Vacation home</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        {(form.selectedPlan === 'basic' || form.selectedPlan === 'exterior') && (
          <LawnExteriorQuestions form={form} update={update} selectedPlan={form.selectedPlan} toggleService={toggleService} />
        )}

        {form.selectedPlan === 'rental' && (
          <RentalQuestions form={form} update={update} toggleService={toggleService} />
        )}

        {form.selectedPlan === 'build' && (
          <BuildYourOwnQuestions form={form} update={update} toggleService={toggleService} />
        )}

        <div className="form-grid">
          <label className="full-width">
            Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={e => setPhotoFiles(e.target.files)}
            />
            <span className="field-help">
              Photos are optional but strongly encouraged. Upload up to 4 photos of the lawn, cleanup area, rental, exterior, access, or problem areas.
            </span>
          </label>

          <label className="full-width">
            Gate, fence, access, or special instructions
            <textarea
              rows="3"
              value={form.accessNotes}
              onChange={e => update('accessNotes', e.target.value)}
              placeholder="Gates, fences, locked areas, dogs, slopes, parking, trash location, laundry location, or access details"
            />
          </label>

          <label className="full-width">
            Notes
            <textarea
              rows="3"
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="Anything else we should know?"
            />
          </label>
        </div>
      </section>

      <aside className="section-panel estimate-summary">
        <span className="eyebrow">Estimated Total</span>
        <h2>{currency(estimate.total)}</h2>
        <p>{estimate.reviewRequired ? `${estimate.summary} Final pricing still requires review.` : estimate.summary}</p>

        <div className="estimate-lines">
          {estimate.lines.map(line => (
            <div className="estimate-row" key={line.label}>
              <span>{line.label}</span>
              <strong>{line.value}</strong>
            </div>
          ))}

          <div className="estimate-row estimate-total-row">
            <span>Estimated Total</span>
            <strong>{currency(estimate.total)}</strong>
          </div>
        </div>

        <div className="disclaimer">
          This is an estimated quote based on the information provided. Final pricing may change if the property size,
          condition, access, photos, timing, service needs, pet waste, trash, overgrowth, laundry, restocking, add-ons,
          or submitted details are incomplete or different from the actual work required.
        </div>

        <button className="button button-primary full-button" type="button" onClick={sendEstimateRequest} disabled={sending}>
          {sending ? 'Sending...' : 'Submit Estimate Request'}
        </button>

        {sendMessage ? <div className="status-message">{sendMessage}</div> : null}

        <div className="mini-contact">
          <a href={`tel:${PHONE_LINK}`}>Call {PHONE_DISPLAY}</a>
          <a href={`sms:${PHONE_LINK}`}>Text {PHONE_DISPLAY}</a>
          <a href={`mailto:${PUBLIC_EMAIL}`}>{PUBLIC_EMAIL}</a>
        </div>
      </aside>
    </main>
  )
}

function ChoiceButton({ active, title, text, onClick }) {
  return (
    <button className={`choice-card ${active ? 'active' : ''}`} type="button" onClick={onClick}>
      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  )
}

function LawnExteriorQuestions({ form, update, selectedPlan, toggleService }) {
  const showExteriorAddOns = selectedPlan === 'exterior'

  return (
    <>
      <div className="question-block">
        <h3>{selectedPlan === 'basic' ? 'Basic Lawn Care Details' : 'Full Exterior Care Details'}</h3>

        <div className="form-grid">
          <label>
            Property size
            <select value={form.propertySize} onChange={e => update('propertySize', e.target.value)}>
              {Object.entries(propertySizes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            Service frequency
            <select value={form.frequency} onChange={e => update('frequency', e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every other week</option>
            </select>
          </label>

          <label>
            Areas needing mowing
            <select value={form.mowingArea} onChange={e => update('mowingArea', e.target.value)}>
              <option value="front-only">Front yard only</option>
              <option value="back-only">Back yard only</option>
              <option value="front-and-back">Front and back yard</option>
              <option value="large-corner">Large or corner lot</option>
            </select>
          </label>

          <label>
            Is the lawn currently overgrown?
            <select value={form.overgrown} onChange={e => update('overgrown', e.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>

          <label>
            Pet waste in service areas?
            <select value={form.petWaste} onChange={e => update('petWaste', e.target.value)}>
              <option value="false">No, areas will be clear</option>
              <option value="true">Yes, cleanup is needed</option>
            </select>
          </label>

          <label>
            Photo updates after service?
            <select value={form.photoUpdates} onChange={e => update('photoUpdates', e.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
        </div>
      </div>

      {showExteriorAddOns && (
        <div className="question-block">
          <h3>Add-On Services</h3>
          <p className="small-copy">Normal weed control is included. Larger cleanup, shrubs, seasonal work, and irrigation support are added when needed.</p>
          <ServiceCheckboxes selected={form.serviceSelections} toggleService={toggleService} services={addOnServices.filter(service => [
            'shrubMaintenance',
            'yardCleanup',
            'seasonalCleanup',
            'curbAppealDetail',
            'sprinklerSupport',
            'exteriorWindowCleaning'
          ].includes(service.key))} />
        </div>
      )}
    </>
  )
}

function RentalQuestions({ form, update, toggleService }) {
  return (
    <>
      <div className="question-block">
        <h3>Rental / Short-Term Rental Details</h3>

        <div className="form-grid">
          <label>
            Rental care needed
            <select value={form.rentalNeed} onChange={e => update('rentalNeed', e.target.value)}>
              <option value="one-time-backup">One-time backup turnover help</option>
              <option value="recurring-turnover">Recurring turnover service</option>
              <option value="same-day-turnover">Same-day turnover</option>
              <option value="move-out-cleanup">Move-out cleanup</option>
              <option value="guest-ready-reset">Guest-ready reset</option>
            </select>
          </label>

          <label>
            Property size
            <select value={form.rentalSize} onChange={e => update('rentalSize', e.target.value)}>
              {Object.entries(rentalSizes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            Same-day or rush timing
            <select value={form.sameDay} onChange={e => update('sameDay', e.target.value)}>
              <option value="none">No same-day rush</option>
              <option value="sameDay">Same-day turnover</option>
              <option value="tightWindow">Same-day under 4-hour window</option>
              <option value="emergencyBackup">Last-minute emergency / backup cleaner request</option>
            </select>
          </label>

          <label>
            Linen / laundry setup
            <select value={form.laundry} onChange={e => update('laundry', e.target.value)}>
              <option value="clean-on-site">Clean replacement linens/towels already on-site</option>
              <option value="onsite">On-site laundry during turnover</option>
              <option value="full">Full laundry service / multiple loads</option>
              <option value="offsite">Off-site laundry handling</option>
              <option value="host-handles">Host / owner handles laundry separately</option>
            </select>
          </label>

          <label>
            Guest checkout time
            <input value={form.checkoutTime} onChange={e => update('checkoutTime', e.target.value)} placeholder="Example: 10:00 AM" />
          </label>

          <label>
            Next guest check-in time
            <input value={form.checkinTime} onChange={e => update('checkinTime', e.target.value)} placeholder="Example: 4:00 PM" />
          </label>

          <label>
            Restocking
            <select value={form.restocking} onChange={e => update('restocking', e.target.value)}>
              <option value="check-report">Check supplies and report low items</option>
              <option value="restock-on-site">Restock using supplies already on-site</option>
              <option value="notify-before">Notify host before replacing anything</option>
              <option value="setup-system">Help set up a restocking system</option>
            </select>
          </label>

          <label>
            Extra trash removal needed?
            <select value={form.trashRemoval} onChange={e => update('trashRemoval', e.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
        </div>
      </div>

      <div className="question-block">
        <h3>Add-On Services</h3>
        <ServiceCheckboxes selected={form.serviceSelections} toggleService={toggleService} services={addOnServices.filter(service => [
          'trashBinService',
          'exteriorWindowCleaning',
          'curbAppealDetail',
          'propertyPhotoUpdates',
          'minorRepairCoordination',
          'sprinklerSupport',
          'shrubMaintenance',
          'yardCleanup'
        ].includes(service.key))} />
      </div>
    </>
  )
}

function BuildYourOwnQuestions({ form, update, toggleService }) {
  return (
    <>
      <div className="question-block">
        <h3>Build Your Own / Add-On Services</h3>
        <p className="small-copy">
          Choose only the services you need. This option does not force you into a care plan.
        </p>

        <div className="form-grid">
          <label>
            Property size
            <select value={form.propertySize} onChange={e => update('propertySize', e.target.value)}>
              {Object.entries(propertySizes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            Frequency, if recurring
            <select value={form.frequency} onChange={e => update('frequency', e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every other week</option>
            </select>
          </label>
        </div>

        <ServiceCheckboxes selected={form.serviceSelections} toggleService={toggleService} services={buildYourOwnServices} />
      </div>
    </>
  )
}

function ServiceCheckboxes({ selected, toggleService, services }) {
  return (
    <div className="service-check-grid">
      {services.map(option => (
        <label className="service-check" key={option.key}>
          <input
            type="checkbox"
            checked={selected.includes(option.key)}
            onChange={() => toggleService(option.key)}
          />
          <span>
            <strong>{option.label}</strong>
            <small>{getServicePriceText(option)}</small>
          </span>
        </label>
      ))}
    </div>
  )
}

function getServicePriceText(option) {
  if (option.type === 'basicLawn') return 'Based on size and frequency'
  if (option.type === 'fullExterior') return 'Based on size and frequency'
  if (option.key === 'trashBinService') return `Starting at ${currency(option.price)} / visit`
  return `Starting at ${currency(option.price)}`
}

function addServiceLine(lines, label, value) {
  lines.push({ label, value })
}

function addSelectedAddOns(form, lines) {
  let subtotal = 0
  let reviewRequired = false
  const selected = addOnServices.filter(option => form.serviceSelections.includes(option.key))

  selected.forEach(option => {
    subtotal += option.price
    addServiceLine(lines, option.label, option.key === 'trashBinService' ? `${currency(option.price)} / visit` : `${currency(option.price)}+`)

    if (['minorRepairCoordination', 'sprinklerSupport', 'yardCleanup', 'seasonalCleanup', 'exteriorWindowCleaning'].includes(option.key)) {
      reviewRequired = true
    }
  })

  return { subtotal, reviewRequired }
}

function buildEstimate(form) {
  const lines = []
  let subtotal = 0
  let reviewRequired = false
  const area = serviceAreas[form.serviceArea] || serviceAreas.saltLakeCounty

  if (form.selectedPlan === 'basic') {
    const base = basicPrices[form.frequency]?.[form.propertySize] || 55
    subtotal += base
    addServiceLine(lines, 'Basic lawn care', currency(base))

    if (toBoolean(form.overgrown)) {
      subtotal += addOnPrices.overgrownFirstCut
      addServiceLine(lines, 'Overgrown first cut', currency(addOnPrices.overgrownFirstCut))
    }

    if (toBoolean(form.petWaste)) {
      subtotal += addOnPrices.petWaste
      addServiceLine(lines, 'Pet waste cleanup', currency(addOnPrices.petWaste))
    }

    if (form.propertySize === 'largePlus') reviewRequired = true
  }

  if (form.selectedPlan === 'exterior') {
    const base = exteriorPrices[form.frequency]?.[form.propertySize] || 95
    subtotal += base
    addServiceLine(lines, 'Full exterior care', currency(base))

    if (toBoolean(form.overgrown)) {
      subtotal += addOnPrices.overgrownFirstCut
      addServiceLine(lines, 'Overgrown / heavy weed adjustment', currency(addOnPrices.overgrownFirstCut))
    }

    if (toBoolean(form.petWaste)) {
      subtotal += addOnPrices.petWaste
      addServiceLine(lines, 'Pet waste cleanup', currency(addOnPrices.petWaste))
    }

    if (form.propertySize === 'largePlus') reviewRequired = true
  }

  if (form.selectedPlan === 'rental') {
    const base = rentalPrices[form.rentalSize] || 145
    subtotal += base
    addServiceLine(lines, 'Rental / short-term rental reset', currency(base))

    if (form.sameDay === 'sameDay') {
      subtotal += addOnPrices.sameDay
      addServiceLine(lines, 'Same-day turnover', currency(addOnPrices.sameDay))
    }

    if (form.sameDay === 'tightWindow') {
      subtotal += addOnPrices.tightWindow
      addServiceLine(lines, 'Tight turnover window', currency(addOnPrices.tightWindow))
    }

    if (form.sameDay === 'emergencyBackup') {
      subtotal += addOnPrices.emergencyBackup
      addServiceLine(lines, 'Emergency / backup cleaner request', `${currency(addOnPrices.emergencyBackup)}+`)
      reviewRequired = true
    }

    if (form.laundry === 'onsite') {
      subtotal += addOnPrices.laundryOnSite
      addServiceLine(lines, 'On-site laundry', currency(addOnPrices.laundryOnSite))
    }

    if (form.laundry === 'full') {
      subtotal += addOnPrices.laundryFull
      addServiceLine(lines, 'Full laundry service', `${currency(addOnPrices.laundryFull)}+`)
      reviewRequired = true
    }

    if (form.laundry === 'offsite') {
      addServiceLine(lines, 'Off-site laundry', 'Review required')
      reviewRequired = true
    }

    if (form.restocking === 'restock-on-site') {
      subtotal += addOnPrices.restockOnSite
      addServiceLine(lines, 'Restock from on-site supplies', currency(addOnPrices.restockOnSite))
    }

    if (form.restocking === 'setup-system') {
      addServiceLine(lines, 'Restocking system setup', 'Review required')
      reviewRequired = true
    }

    if (toBoolean(form.trashRemoval)) {
      subtotal += addOnPrices.trashRemoval
      addServiceLine(lines, 'Extra trash removal', currency(addOnPrices.trashRemoval))
    }

    if (form.rentalSize === 'fivePlus') reviewRequired = true
  }

  if (form.selectedPlan === 'build') {
    if (form.serviceSelections.includes('basicLawnService')) {
      const base = basicPrices[form.frequency]?.[form.propertySize] || 55
      subtotal += base
      addServiceLine(lines, 'Basic lawn service', currency(base))
    }

    if (form.serviceSelections.includes('fullExteriorService')) {
      const base = exteriorPrices[form.frequency]?.[form.propertySize] || 95
      subtotal += base
      addServiceLine(lines, 'Full exterior care service', currency(base))
    }

    if (form.propertySize === 'largePlus') reviewRequired = true
  }

  const addOns = addSelectedAddOns(form, lines)
  subtotal += addOns.subtotal
  if (addOns.reviewRequired) reviewRequired = true

  if (area.review) {
    addServiceLine(lines, 'Service area', 'Review required')
    reviewRequired = true
  } else {
    if (area.adjustment > 0) {
      subtotal += area.adjustment
      addServiceLine(lines, `${area.label} service-area adjustment`, currency(area.adjustment))
    }

    if (area.minimum > 0 && subtotal < area.minimum && subtotal > 0) {
      addServiceLine(lines, `${area.label} minimum visit`, currency(area.minimum))
      subtotal = area.minimum
    }
  }

  if (form.selectedPlan === 'build' && form.serviceSelections.length === 0) {
    addServiceLine(lines, 'Build Your Own / Add-On Services', 'Choose services to estimate')
  }

  const summary = reviewRequired
    ? 'Some selected services require review before the final price is confirmed.'
    : 'Final price is subject to review before service is confirmed.'

  return {
    subtotal,
    total: subtotal,
    lines,
    reviewRequired,
    summary,
    serviceArea: area.label
  }
}

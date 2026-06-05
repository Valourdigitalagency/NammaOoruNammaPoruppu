const menuToggle = document.querySelector('.menu-toggle')
const mainNav = document.querySelector('.main-nav')
const searchButton = document.querySelector('.search-button')
const searchPanel = document.querySelector('.search-panel')
const closeSearch = document.querySelector('.close-search')
const newsletterForm = document.querySelector('.newsletter-form')

const STORAGE_KEY = 'geoBottleRecycler'
const GOAL_COUNT = 100000000
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyziyQCmPCigTBxJv8TQdi4Xw7zCrv399B8c4VKyOl_yTWFH5Tj77MK4sP8k4Fp3-uomQ/exec'
const heroRegister = document.querySelector('.hero-register')
const recycleSection = document.querySelector('.recycle-section')
const bottleDashboard = document.querySelector('#bottleDashboard')
const recycleCard = document.querySelector('.recycle-card')
const registerForm = document.querySelector('.register-form')
const bottleForm = document.querySelector('.bottle-form')
const bottleInput = document.querySelector('#bottleCount')
const welcomeName = document.querySelector('.welcome-name')
const bottleTotal = document.querySelector('.bottle-total')
const progressText = document.querySelector('.progress-text')
const progressPercent = document.querySelector('.progress-percent')
const progressBar = document.querySelector('.progress-bar')
const completionMessage = document.querySelector('.completion-message')
const downloadCertificate = document.querySelector('.download-certificate')
const certificateSection = document.querySelector('.certificate-preview-section')
const certificatePreview = document.querySelector('#certificatePreview')
const certificateName = document.querySelector('.certificate-name')
const isRegisterPage = document.body.classList.contains('register-page')

let submittedThisPageOpen = false

menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open')
  menuToggle.setAttribute('aria-expanded', String(isOpen))
})

searchButton?.addEventListener('click', () => {
  searchPanel.hidden = false
  searchPanel.querySelector('input')?.focus()
})

closeSearch?.addEventListener('click', () => {
  searchPanel.hidden = true
})

newsletterForm?.addEventListener('submit', (event) => {
  event.preventDefault()
  newsletterForm.reset()
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && searchPanel) searchPanel.hidden = true
})

function getRecycler() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

function saveRecycler(recycler) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recycler))
}

async function sendToGoogleSheet(payload) {
  if (!GOOGLE_SCRIPT_URL) return false

  const body = new URLSearchParams()
  Object.entries(payload).forEach(([key, value]) => {
    body.append(key, value == null ? '' : String(value))
  })

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      body,
    })
    return true
  } catch {
    return navigator.sendBeacon?.(GOOGLE_SCRIPT_URL, body) || false
  }
}

function setFlowView(view) {
  if (!recycleCard) return

  const isRegistered = view === 'bottle'
  if (registerForm) registerForm.hidden = isRegistered
  if (bottleForm) bottleForm.hidden = !isRegistered
  recycleCard.dataset.view = view
}

function updateHeroForUser(recycler) {
  if (!heroRegister) return

  if (recycler) {
    heroRegister.textContent = 'Add Bottle'
    heroRegister.href = './index.html#bottleDashboard'
    heroRegister.classList.add('is-returning')
  } else {
    heroRegister.textContent = 'Register Now'
    heroRegister.href = './register.html'
    heroRegister.classList.remove('is-returning')
  }
}

function renderRecycler() {
  const recycler = getRecycler()
  updateHeroForUser(recycler)

  if (isRegisterPage && recycler) {
    window.location.href = './index.html#bottleDashboard'
    return
  }

  if (!recycler) {
    setFlowView('register')
    if (bottleDashboard) bottleDashboard.hidden = true
    if (certificateSection) certificateSection.hidden = true
    return
  }

  const count = Math.min(Number(recycler.count) || 0, GOAL_COUNT)
  const percent = Math.min(100, Math.round((count / GOAL_COUNT) * 100))

  setFlowView('bottle')
  if (bottleDashboard) bottleDashboard.hidden = false
  if (welcomeName) welcomeName.textContent = recycler.name
  if (bottleTotal) bottleTotal.textContent = String(count)
  if (progressText) progressText.textContent = `${count} / ${GOAL_COUNT} bottles`
  if (progressPercent) progressPercent.textContent = `${percent}%`
  if (progressBar) progressBar.style.width = `${percent}%`
  if (certificateName) certificateName.textContent = recycler.name

  const isComplete = count >= GOAL_COUNT
  if (completionMessage) completionMessage.hidden = !isComplete
  if (downloadCertificate) {
    downloadCertificate.hidden = false
    downloadCertificate.disabled = !isComplete
    downloadCertificate.textContent = isComplete ? 'Download Certificate' : 'Complete the Task to Download the Certificate'
  }
  if (certificateSection) certificateSection.hidden = false
  recycleSection?.classList.toggle('is-complete', isComplete)
}

function celebrate() {
  if (!recycleSection) return
  recycleSection.classList.remove('is-celebrating')
  window.requestAnimationFrame(() => {
    recycleSection.classList.add('is-celebrating')
    window.setTimeout(() => recycleSection.classList.remove('is-celebrating'), 1800)
  })
}

registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault()

  const formData = new FormData(registerForm)
  const name = String(formData.get('userName') || '').trim()
  const email = String(formData.get('userEmail') || '').trim()
  const phone = String(formData.get('userPhone') || '').trim()

  if (!name || !email || !phone) return

  const registeredAt = new Date().toISOString()
  const recycler = {
    name,
    email,
    phone,
    count: 0,
    registeredAt,
  }

  saveRecycler(recycler)
  const submitButton = registerForm.querySelector('button[type="submit"]')
  if (submitButton) {
    submitButton.textContent = 'Saving...'
    submitButton.disabled = true
  }

  await sendToGoogleSheet({
    action: 'register',
    username: name,
    emailId: email,
    phoneNumber: phone,
    name,
    email,
    phone,
    bottleCount: 0,
    totalBottleCount: 0,
    count: 0,
    registeredAt,
    timestamp: registeredAt,
  })

  submittedThisPageOpen = false
  registerForm.reset()
  window.location.href = './index.html#bottleDashboard'
})

bottleForm?.addEventListener('submit', async (event) => {
  event.preventDefault()

  if (submittedThisPageOpen) return

  const recycler = getRecycler()
  if (!recycler) {
    setFlowView('register')
    return
  }

  const bottleCount = Math.min(1, Math.max(1, Number(bottleInput?.value) || 1))
  recycler.count = Math.min(GOAL_COUNT, (Number(recycler.count) || 0) + bottleCount)
  recycler.lastSubmittedAt = new Date().toISOString()
  saveRecycler(recycler)
  submittedThisPageOpen = true
  const submitButton = bottleForm.querySelector('button[type="submit"]')
  if (submitButton) {
    submitButton.textContent = 'Saving...'
    submitButton.disabled = true
  }

  await sendToGoogleSheet({
    action: 'bottle_submit',
    username: recycler.name,
    emailId: recycler.email,
    phoneNumber: recycler.phone,
    name: recycler.name,
    email: recycler.email,
    phone: recycler.phone,
    bottleCount,
    totalBottleCount: recycler.count,
    submittedBottles: bottleCount,
    totalBottles: recycler.count,
    lastSubmittedAt: recycler.lastSubmittedAt,
    timestamp: recycler.lastSubmittedAt,
  })

  if (submitButton) {
    submitButton.textContent = 'Bottle Submitted'
    submitButton.disabled = true
  }

  renderRecycler()
  celebrate()
})

downloadCertificate?.addEventListener('click', async () => {
  const recycler = getRecycler()
  if (!recycler) return
  if ((Number(recycler.count) || 0) < GOAL_COUNT) return
  await downloadCertificateImage(recycler.name)
})

certificatePreview?.addEventListener('contextmenu', (event) => {
  event.preventDefault()
})

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function drawCenteredText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  const lines = []
  let line = ''

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  })

  if (line) lines.push(line)
  lines.forEach((currentLine, index) => {
    ctx.fillText(currentLine, x, y + index * lineHeight)
  })
}

async function downloadCertificateImage(name) {
  const certificate = await loadImage('./assets/Certificate.jpeg')
  const canvas = document.createElement('canvas')
  canvas.width = certificate.naturalWidth || certificate.width
  canvas.height = certificate.naturalHeight || certificate.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(certificate, 0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#003a70'
  ctx.font = '700 72px Georgia, "Times New Roman", serif'
  ctx.fillText(name, canvas.width / 2, canvas.height * 0.5, canvas.width * 0.6)

  const link = document.createElement('a')
  link.download = `${name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'recycler'}-certificate.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

renderRecycler()

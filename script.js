const menuToggle = document.querySelector('.menu-toggle')
const mainNav = document.querySelector('.main-nav')
const searchButton = document.querySelector('.search-button')
const searchPanel = document.querySelector('.search-panel')
const closeSearch = document.querySelector('.close-search')
const newsletterForm = document.querySelector('.newsletter-form')

const STORAGE_KEY = 'geoBottleRecycler'
const GOAL_COUNT = 50
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSjzsVhp74Zc5w9UFs36QqOp2kL6ZOnG4T2JB8ym62ppp-fUOoXIudlPihalZGTumu/exec'

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
const registerNewUser = document.querySelector('.register-new-user')
const certificateSection = document.querySelector('.certificate-preview-section')
const certificatePreview = document.querySelector('#certificatePreview')
const certificateName = document.querySelector('.certificate-name')
const isRegisterPage = document.body.classList.contains('register-page')
const registerStatus = document.querySelector('.register-status')
const bottleStatus = document.querySelector('.bottle-status')

let submittedThisPageOpen = false
let autoFocusedDashboard = false

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

registerNewUser?.addEventListener('click', () => {
  clearRecycler()
  submittedThisPageOpen = false
  window.location.href = './register.html'
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

function clearRecycler() {
  localStorage.removeItem(STORAGE_KEY)
}

function setStatus(element, message, type = 'info') {
  if (!element) return
  element.textContent = message
  element.dataset.type = type
  element.hidden = !message
}

function createParticipantId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `participant-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function sendToGoogleSheet(payload) {
  if (!GOOGLE_SCRIPT_URL) throw new Error('Google Apps Script URL is not configured.')

  const params = new URLSearchParams()
  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, value == null ? '' : String(value))
  })

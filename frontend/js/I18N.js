let I18N = {}

export function loadI18N(callback) {
  fetch("/api/i18n/")
    .then(res => res.json())
    .then(data => {
      I18N = data
      applyI18N()
      if (callback) callback()
    })
}

function applyI18N() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const keys = el.dataset.i18n.split(".")
    let value = I18N
    keys.forEach(k => value = value?.[k])
    if (value) el.innerText = value
  })

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const keys = el.dataset.i18nPlaceholder.split(".")
    let value = I18N
    keys.forEach(k => value = value?.[k])
    if (value) el.placeholder = value
  })
}

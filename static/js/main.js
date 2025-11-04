const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
  document.body.classList.add("modal-backdrop");
}

const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
  document.body.classList.remove("modal-backdrop")
}

document.addEventListener("DOMContentLoaded", () => {
  const idx = new Date().getDay()
  const song = [
    {"title": "im the visual - yoo mi", "url":"https://youtu.be/p08l5f3oOSY"},
    { "title": "baddie - ive", "url": "https://youtu.be/Da4P2uT4mVc" },
    { "title": "nuuamm - maho", "url": "https://youtu.be/l5aEgNjU8xQ" },
    { "title": "真昼の月 - noisycell", "url": "https://youtu.be/VTKeRmd90NY" },
    { "title": "cure - honeydip", "url": "https://youtu.be/CljBDaSOr3g" },
    { "title": "btg - kiiikiii", "url": "https://youtu.be/hnCd1RyTaOA" },
    { "title": "life in these islands - kawika kahiapo", "url": "https://youtu.be/ps_8HFp3PyI" },
  ][idx]

  document.getElementById("sotd").innerHTML = `<a style="color: white" href="${song.url}" target="_blank">${song.title}</a>`
})

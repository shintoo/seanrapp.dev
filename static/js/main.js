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
  document.getElementById("sotd").innerHTML = [
    "im the visual - yoo mi",
    "kill ma bo$$ - kiiras",
    "jellyous - illit",
    "baddie - ive",
    "zero - newjeans",
    "btg - kiiikiii",
    "shiwa - buzzg"
  ][idx]
})

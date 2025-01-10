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
    "young love - lyrical school",
    "live my life - aespa",
    "landscape with a fairy - aspidistrafly",
    "how sweet - newjeans",
    "prismatism - gregory and the hawk",
    "blazing in the dark - gnb chili",
    "海と花束 - きのこ帝国"
  ][idx]
})
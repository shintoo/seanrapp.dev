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
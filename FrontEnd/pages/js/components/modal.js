// js/components/modal.js
// modal.js
const activeModals = new Set();

export function initModals() {
  console.log("Initializing modals...");
  
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-target');
      const modal = document.getElementById(modalId);
      
      if (modal) {
        openModal(modal);
      }
    });
  });
  
  document.querySelectorAll('.modal-close').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
      const modal = closeButton.closest('.modal');
      if (modal) {
        closeModal(modal);
      }
    });
  });
  
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const modal = overlay.querySelector('.modal');
        if (modal) {
          closeModal(modal);
        }
      }
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModals.size > 0) {
      const lastModal = Array.from(activeModals).pop();
      closeModal(lastModal);
    }
  });
}

export function openModal(modal) {
  if (!modal) return;
  
  const overlay = modal.closest('.modal-overlay') || createOverlay(modal);
  
  overlay.style.display = 'flex';
  overlay.classList.add('fade-in');
  
  document.body.classList.add('modal-open');
  
  activeModals.add(modal);
}

export function closeModal(modal) {
  if (!modal) return;
  
  const overlay = modal.closest('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('fade-out');
      
      activeModals.delete(modal);
      if (activeModals.size === 0) {
        document.body.classList.remove('modal-open');
      }
    }, 300);
  }
}

function createOverlay(modal) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  modal.parentNode.insertBefore(overlay, modal);
  overlay.appendChild(modal);
  
  return overlay;
}
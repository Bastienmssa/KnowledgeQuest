/**
 * Module pour gérer les fenêtres modales
 * Utilisé pour les confirmations, alertes et formulaires popup
 */

// Collection des modales actives
const activeModals = new Set();

export function initModals() {
    console.log("Initializing modals...");
    
    // Initialiser toutes les modales présentes dans le DOM
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                openModal(modal);
            }
        });
    });
    
    // Fermer les modales avec les boutons de fermeture
    document.querySelectorAll('.modal-close').forEach(closeButton => {
        closeButton.addEventListener('click', () => {
            const modal = closeButton.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // Fermer les modales en cliquant en dehors
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
    
    // Fermer avec la touche Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModals.size > 0) {
            const lastModal = Array.from(activeModals).pop();
            closeModal(lastModal);
        }
    });
}

// Ouvrir une modale
export function openModal(modal) {
    if (!modal) return;
    
    const overlay = modal.closest('.modal-overlay') || createOverlay(modal);
    
    // Ajouter les classes d'animation
    overlay.style.display = 'flex';
    overlay.classList.add('fade-in');
    
    // Bloquer le scroll de la page
    document.body.classList.add('modal-open');
    
    // Ajouter à la liste des modales actives
    activeModals.add(modal);
}

// Fermer une modale
export function closeModal(modal) {
    if (!modal) return;
    
    const overlay = modal.closest('.modal-overlay');
    if (overlay) {
        overlay.classList.remove('fade-in');
        overlay.classList.add('fade-out');
        
        // Attendre la fin de l'animation
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.classList.remove('fade-out');
            
            // Si c'est la dernière modale, débloquer le scroll
            activeModals.delete(modal);
            if (activeModals.size === 0) {
                document.body.classList.remove('modal-open');
            }
        }, 300);
    }
}

// Créer une modale de confirmation
export function createConfirmModal(message, onConfirm, onCancel) {
    // Créer les éléments de la modale
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal confirmation-modal';
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>Confirmation</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>${message}</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-cancel-btn">Annuler</button>
            <button class="btn btn-primary" id="modal-confirm-btn">Confirmer</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Ajouter les écouteurs d'événements
    const closeButton = modal.querySelector('.modal-close');
    const cancelButton = modal.querySelector('#modal-cancel-btn');
    const confirmButton = modal.querySelector('#modal-confirm-btn');
    
    closeButton.addEventListener('click', () => {
        closeModal(modal);
        if (onCancel) onCancel();
    });
    
    cancelButton.addEventListener('click', () => {
        closeModal(modal);
        if (onCancel) onCancel();
    });
    
    confirmButton.addEventListener('click', () => {
        closeModal(modal);
        if (onConfirm) onConfirm();
    });
    
    // Ouvrir la modale
    openModal(modal);
    
    return modal;
}

// Créer l'overlay pour une modale
function createOverlay(modal) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Insérer la modale dans l'overlay
    modal.parentNode.insertBefore(overlay, modal);
    overlay.appendChild(modal);
    
    return overlay;
}
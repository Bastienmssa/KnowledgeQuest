/**
 * Gestionnaire pour la page de téléchargement de documents
 */

import { auth } from '../auth.js';
import { showMessage } from '../component/component.js';

// Initialiser la page de téléchargement
export function initUploadPage() {
    console.log("Initializing upload page...");
    
    // Vérifier l'authentification
    if (!auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialiser l'interface de téléchargement
    initUploadInterface();
}

// Initialiser l'interface de téléchargement
function initUploadInterface() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadPreview = document.getElementById('upload-preview');
    const generateButton = document.getElementById('generate-qcm-btn');
    
    if (!dropArea || !fileInput || !uploadPreview || !generateButton) {
        console.error('Missing required elements for upload interface');
        return;
    }
    
    // Désactiver le bouton de génération jusqu'à ce qu'un fichier soit sélectionné
    generateButton.disabled = true;
    
    // Empêcher le comportement par défaut du navigateur pour le glisser-déposer
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Ajouter la classe highlight quand un fichier est survolé
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Gérer le dépôt de fichier
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
    
    // Gérer la sélection de fichier via le bouton
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFiles(this.files);
        }
    });
    
    // Traiter les fichiers sélectionnés
    function handleFiles(files) {
        const file = files[0]; // Pour l'instant, nous ne traitons qu'un seul fichier
        
        // Vérifier le type de fichier
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!validTypes.includes(file.type)) {
            showMessage(uploadPreview, 'Format de fichier non supporté. Veuillez télécharger un document PDF ou Word.', 'error');
            return;
        }
        
        // Afficher un aperçu du fichier
        uploadPreview.innerHTML = `
            <div class="file-preview">
                <div class="file-icon">${getFileIcon(file.type)}</div>
                <div class="file-details">
                    <h3>${file.name}</h3>
                    <p>${formatFileSize(file.size)}</p>
                </div>
            </div>
        `;
        
        // Activer le bouton de génération
        generateButton.disabled = false;
        
        // Ajouter un écouteur d'événements pour le bouton de génération
        generateButton.addEventListener('click', () => {
            generateQcmFromDocument(file);
        }, { once: true }); // Utiliser once: true pour éviter les événements multiples
    }
    
    // Générer des QCM à partir du document
    async function generateQcmFromDocument(file) {
        try {
            // Afficher un état de chargement
            generateButton.disabled = true;
            generateButton.innerHTML = '<span class="spinner"></span> Génération en cours...';
            
            // Zone de message pour les mises à jour
            const messageContainer = document.createElement('div');
            messageContainer.className = 'upload-messages';
            uploadPreview.appendChild(messageContainer);
            
            // Étape 1: Téléverser le document
            showMessage(messageContainer, 'Téléversement du document...', 'info');
            
            const uploadResponse = await window.KnowledgeQuestAPI.uploadDocument(file);
            
            if (!uploadResponse.success) {
                throw new Error(uploadResponse.message || 'Erreur lors du téléversement');
            }
            
            // Étape 2: Générer le QCM
            showMessage(messageContainer, 'Analyse du document et génération du QCM...', 'info');
            
            const generateResponse = await window.KnowledgeQuestAPI.generateQCM(uploadResponse.documentId);
            
            if (!generateResponse.success) {
                throw new Error(generateResponse.message || 'Erreur lors de la génération du QCM');
            }
            
            // Étape 3: Succès!
            showMessage(messageContainer, 'QCM généré avec succès!', 'success');
            
            // Afficher un aperçu du QCM et options
            displayQcmPreview(generateResponse.qcm, messageContainer);
            
        } catch (error) {
            console.error('Erreur de génération:', error);
            
            // Réinitialiser le bouton
            generateButton.disabled = false;
            generateButton.innerHTML = 'Générer des QCM';
            
            // Afficher l'erreur
            showMessage(uploadPreview, `Erreur: ${error.message || 'Erreur lors de la génération du QCM'}`, 'error');
        }
    }
    
    // Afficher un aperçu du QCM généré
    function displayQcmPreview(qcm, container) {
        // Créer une zone d'aperçu
        const previewElement = document.createElement('div');
        previewElement.className = 'qcm-preview';
        
        previewElement.innerHTML = `
            <h3>QCM généré: ${qcm.title}</h3>
            <p>${qcm.questions.length} questions créées pour le sujet "${qcm.subject}"</p>
            
            <div class="preview-question-sample">
                <h4>Exemple de question:</h4>
                <p class="question-text">${qcm.questions[0].question}</p>
                <ul class="question-choices">
                    ${qcm.questions[0].choices.map(choice => `<li>${choice}</li>`).join('')}
                </ul>
            </div>
            
            <div class="preview-actions">
                <a href="take-test.html?qcmId=${qcm._id}" class="btn-primary">Commencer le test</a>
                <a href="dashboard.html" class="btn-secondary">Retour au tableau de bord</a>
            </div>
        `;
        
        // Remplacer le conteneur par l'aperçu
        container.parentNode.replaceChild(previewElement, container);
        
        // Réinitialiser le bouton, car nous montrons maintenant les actions dans l'aperçu
        generateButton.style.display = 'none';
    }
}

// Fonctions utilitaires

// Obtenir l'icône correspondant au type de fichier
function getFileIcon(fileType) {
    if (fileType === 'application/pdf') {
        return '📄';
    } else if (fileType.includes('word')) {
        return '📝';
    } else {
        return '📄';
    }
}

// Formater la taille du fichier
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}
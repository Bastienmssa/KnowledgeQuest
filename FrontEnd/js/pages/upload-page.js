// js/pages/upload-page.js
/**
 * Gestionnaire pour la page de téléchargement de documents
 */
import { auth } from '../utils/auth.js';
import { documentService } from '../services/document-service.js';
import { qcmService } from '../services/qcm-service.js';
import { showNotification } from '../components/notification.js';

export function initUploadPage() {
  console.log("Initialisation de la page de téléchargement...");
  
  // Vérifier l'authentification
  if (!auth.isLoggedIn) {
    window.location.href = '../pages/login.html';
    return;
  }
  
  // Initialiser l'interface de téléchargement
  setupDropzone();
  setupUploadForm();
}

function setupDropzone() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  
  if (!dropArea || !fileInput) return;
  
  // Prévenir le comportement par défaut
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Ajouter des classes visuelles pendant le drag
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add('highlight');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove('highlight');
    }, false);
  });
  
  // Gérer le dépôt de fichier
  dropArea.addEventListener('drop', handleDrop, false);
  
  // Gérer le clic sur la zone de dépôt
  dropArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Gérer la sélection de fichier via l'input
  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      handleFiles(this.files);
    }
  });
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }
  
  function handleFiles(files) {
    if (files.length > 0) {
      // Afficher le nom du fichier sélectionné
      const fileList = document.getElementById('file-list');
      if (fileList) {
        fileList.innerHTML = '';
        for (let i = 0; i < files.length; i++) {
          const item = document.createElement('div');
          item.className = 'file-item';
          item.innerHTML = `
            <span class="file-name">${files[i].name}</span>
            <span class="file-size">(${formatFileSize(files[i].size)})</span>
          `;
          fileList.appendChild(item);
        }
      }
      
      // Activer le bouton d'upload
      const uploadButton = document.getElementById('upload-button');
      if (uploadButton) {
        uploadButton.disabled = false;
      }
    }
  }
}

function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function setupUploadForm() {
  const uploadForm = document.getElementById('upload-form');
  const progressBar = document.getElementById('upload-progress');
  const progressContainer = document.querySelector('.progress-container');
  
  if (!uploadForm) return;
  
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files || fileInput.files.length === 0) {
      showNotification('Veuillez sélectionner un fichier', 'error');
      return;
    }
    
    const file = fileInput.files[0];
    
    // Vérifier le type de fichier
    if (!documentService.isValidFileType(file)) {
      showNotification('Format de fichier non supporté. Veuillez télécharger un document PDF, Word ou TXT.', 'error');
      return;
    }
    
    // Désactiver le bouton pendant le téléchargement
    const submitButton = uploadForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Téléchargement...';
    
    // Afficher la barre de progression
    if (progressContainer) progressContainer.style.display = 'block';
    
    try {
      // Télécharger le document
      const response = await documentService.uploadDocument(file, (progress) => {
        if (progressBar) progressBar.value = progress;
      });
      
      if (response) {
        showNotification('Document téléchargé avec succès!', 'success');
        
        // Afficher les options pour générer un QCM
        showGenerateOptions(response._id);
      } else {
        showNotification('Erreur lors du téléchargement', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(error.message || 'Erreur lors du téléchargement', 'error');
    } finally {
      // Réactiver le bouton
      submitButton.disabled = false;
      submitButton.innerHTML = 'Télécharger';
      
      // Cacher la barre de progression
      if (progressContainer) progressContainer.style.display = 'none';
    }
  });
}

function showGenerateOptions(documentId) {
  const optionsContainer = document.getElementById('generate-options');
  if (!optionsContainer) return;
  
  optionsContainer.innerHTML = `
    <h3>Document téléchargé avec succès!</h3>
    <p>Que souhaitez-vous faire?</p>
    <div class="options-buttons">
      <button id="generate-qcm-btn" class="btn-primary">Générer un QCM automatiquement</button>
      <a href="../pages/create-qcm.html?document=${documentId}" class="btn-secondary">Créer un QCM manuellement</a>
    </div>
  `;
  
  optionsContainer.style.display = 'block';
  
  // Ajouter un écouteur pour le bouton de génération
  const generateButton = document.getElementById('generate-qcm-btn');
  if (generateButton) {
    generateButton.addEventListener('click', () => {
      generateQCM(documentId);
    });
  }
}

async function generateQCM(documentId) {
  // Afficher un indicateur de chargement
  const optionsContainer = document.getElementById('generate-options');
  optionsContainer.innerHTML = `
    <h3>Génération en cours...</h3>
    <p>Veuillez patienter pendant que nous analysons votre document.</p>
    <div class="loading-spinner"></div>
  `;
  
  try {
    const userDomain = auth.user?.domain || 'Médecine';
    const response = await qcmService.generateQcm(documentId, userDomain);
    
    if (response) {
      showNotification('QCM généré avec succès!', 'success');
      
      // Rediriger vers la page de révision
      setTimeout(() => {
        window.location.href = `../pages/take-test.html?qcmId=${response._id}`;
      }, 1000);
    } else {
      optionsContainer.innerHTML = `
        <h3>Erreur de génération</h3>
        <p>Une erreur est survenue lors de la génération du QCM.</p>
        <div class="options-buttons">
          <a href="../pages/create-qcm.html?document=${documentId}" class="btn-primary">Créer un QCM manuellement</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erreur:', error);
    optionsContainer.innerHTML = `
      <h3>Erreur de génération</h3>
      <p>${error.message || 'Une erreur est survenue lors de la génération du QCM.'}</p>
      <div class="options-buttons">
        <a href="../pages/create-qcm.html?document=${documentId}" class="btn-primary">Créer un QCM manuellement</a>
      </div>
    `;
  }
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initUploadPage);
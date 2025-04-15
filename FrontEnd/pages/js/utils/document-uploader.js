/**
 * Module pour gérer l'upload de documents
 */
import { documentService } from '../services/document-service.js';
import { qcmService } from '../services/qcm-service.js';
import { showNotification } from '../components/notification.js';

export function initDocumentUploader() {
  console.log("Initializing document uploader...");
  
  const dropZone = document.getElementById('document-drop-zone');
  const fileInput = document.getElementById('document-file-input');
  const uploadButton = document.getElementById('upload-document-btn');
  
  if (!dropZone || !fileInput) return;
  
  setupDropZone(dropZone, fileInput);
  
  if (uploadButton) {
    uploadButton.addEventListener('click', () => {
      const files = fileInput.files;
      if (files.length > 0) {
        uploadDocument(files[0]);
      } else {
        showNotification('Veuillez sélectionner un document à télécharger', 'error');
      }
    });
  }
}

async function uploadDocument(file) {
  const uploadStatus = document.getElementById('upload-status');
  const progressBar = document.getElementById('upload-progress-bar');
  
  // Vérifier le type de fichier
  if (!documentService.isValidFileType(file)) {
    showNotification('Type de fichier non supporté. Veuillez télécharger un fichier PDF, Word ou TXT.', 'error');
    return;
  }
  
  // Vérifier la taille du fichier
  if (!documentService.isValidFileSize(file, 10)) { // 10 Mo max
    showNotification('Fichier trop volumineux. La taille maximale est de 10 Mo.', 'error');
    return;
  }
  
  if (uploadStatus) {
    uploadStatus.textContent = 'Téléchargement en cours...';
    uploadStatus.className = 'status-uploading';
  }
  
  if (progressBar) {
    progressBar.style.width = '0%';
    progressBar.parentElement.style.display = 'block';
  }
  
  try {
    const updateProgress = (progress) => {
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    };
    
    const response = await documentService.uploadDocument(file, updateProgress);
    
    if (response) {
      if (uploadStatus) {
        uploadStatus.textContent = 'Document téléchargé avec succès!';
        uploadStatus.className = 'status-success';
      }
      showGenerateOptions(response._id);
    } else {
      showNotification('Erreur lors du téléchargement', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(error.message || 'Une erreur est survenue lors du téléchargement', 'error');
  }
}

function setupDropZone(dropZone, fileInput) {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add('drop-zone-active');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('drop-zone-active');
    }, false);
  });
  
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    fileInput.files = files;
    updateFileList(files);
  }, false);
  
  fileInput.addEventListener('change', () => {
    updateFileList(fileInput.files);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function updateFileList(files) {
  const fileListContainer = document.getElementById('selected-files');
  if (!fileListContainer) return;
  
  fileListContainer.innerHTML = '';
  
  if (files.length > 0) {
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const file = files[0];
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    
    fileInfo.innerHTML = `
      <div class="file-name">${file.name}</div>
      <div class="file-details">
        <span class="file-type">${file.type || 'Document'}</span>
        <span class="file-size">${sizeInMB} MB</span>
      </div>
    `;
    
    fileListContainer.appendChild(fileInfo);
    fileListContainer.style.display = 'block';
  } else {
    fileListContainer.style.display = 'none';
  }
}

function showUploadError(message) {
  const uploadStatus = document.getElementById('upload-status');
  if (uploadStatus) {
    uploadStatus.textContent = message;
    uploadStatus.className = 'status-error';
  }
}

function showGenerateOptions(documentId) {
  const uploadContainer = document.querySelector('.upload-container');
  if (!uploadContainer) return;
  
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'generation-options';
  
  optionsContainer.innerHTML = `
    <h3>Document téléchargé avec succès!</h3>
    <p>Que souhaitez-vous faire avec ce document?</p>
    
    <div class="options-buttons">
      <button id="generate-qcm-btn" class="btn-primary">
        <span class="icon">🎯</span>
        Générer un QCM automatiquement
      </button>
      <a href="create-qcm.html?document=${documentId}" class="btn-secondary">
        <span class="icon">✏️</span>
        Créer un QCM manuellement
      </a>
    </div>
  `;
  
  uploadContainer.appendChild(optionsContainer);
  
  document.getElementById('generate-qcm-btn').addEventListener('click', async () => {
    try {
      const userDomain = window.auth?.user?.domain || 'Médecine';
      
      optionsContainer.innerHTML = '<div class="loading-spinner">Génération du QCM en cours...</div>';
      
      const response = await KnowledgeQuestAPI.qcm.generateQCM(documentId, userDomain);
      
      if (response.success) {
        window.location.href = `take-test.html?qcmId=${response.data._id}`;
      } else {
        optionsContainer.innerHTML = `
          <div class="error-message">
            ${response.message || 'Erreur lors de la génération du QCM'}
          </div>
          <button id="retry-btn" class="btn-secondary">Réessayer</button>
        `;
        
        document.getElementById('retry-btn').addEventListener('click', () => {
          showGenerationOptions(documentId);
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      optionsContainer.innerHTML = `
        <div class="error-message">
          Une erreur est survenue lors de la génération du QCM
        </div>
        <button id="retry-btn" class="btn-secondary">Réessayer</button>
      `;
      
      document.getElementById('retry-btn').addEventListener('click', () => {
        showGenerationOptions(documentId);
      });
    }
  });
  
  document.getElementById('create-manual-qcm-btn').addEventListener('click', () => {
    window.location.href = `create-qcm.html?documentId=${documentId}`;
  });
}
/**
 * Module pour gérer l'upload de documents
 */
import { documentService } from '../services/document-service.js';
import { qcmService } from '../services/qcm-service.js';
import { showNotification } from '../components/notification.js';
import { auth } from '../utils/auth.js';

export function initDocumentUploader() {
  console.log("Initialisation du gestionnaire de téléchargement de documents...");

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
        showNotification('Veuillez sélectionner un document à télécharger.', 'error');
      }
    });
  }
}

async function uploadDocument(file) {
  const uploadStatus = document.getElementById('upload-status');
  const progressBar = document.getElementById('upload-progress-bar');

  if (!documentService.isValidFileType(file)) {
    showNotification('Type de fichier non pris en charge. PDF, Word ou TXT requis.', 'error');
    return;
  }

  if (!documentService.isValidFileSize(file, 10)) {
    showNotification('Fichier trop volumineux (max 10 Mo).', 'error');
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
      showNotification('Document téléchargé avec succès!', 'success');
      uploadStatus.textContent = 'Document prêt.';
      uploadStatus.className = 'status-success';
      showGenerateOptions(response._id);
    } else {
      showNotification('Erreur lors du téléchargement.', 'error');
    }
  } catch (error) {
    console.error(error);
    showNotification('Erreur lors du téléchargement du document.', 'error');
  }
}

function setupDropZone(dropZone, fileInput) {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drop-zone-active'));
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drop-zone-active'));
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    fileInput.files = files;
    updateFileList(files);
  });

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
    const file = files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
      <strong>${file.name}</strong>
      <small>${file.type} - ${sizeMB} Mo</small>
    `;
    fileListContainer.appendChild(fileInfo);
    fileListContainer.style.display = 'block';
  } else {
    fileListContainer.style.display = 'none';
  }
}

function showGenerateOptions(documentId) {
  const uploadContainer = document.querySelector('.upload-container');
  if (!uploadContainer) return;

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'generation-options';
  optionsContainer.innerHTML = `
    <h3>Document téléchargé avec succès!</h3>
    <p>Que souhaitez-vous faire avec ce document ?</p>
    <div class="options-buttons">
      <button id="generate-qcm-btn" class="btn-primary">
        <span class="icon">🎯</span> Générer un QCM automatiquement
      </button>
      <a href="create-qcm.html?document=${documentId}" class="btn-secondary">
        <span class="icon">✏️</span> Créer un QCM manuellement
      </a>
    </div>
  `;

  uploadContainer.appendChild(optionsContainer);

  const generateBtn = document.getElementById('generate-qcm-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      try {
        optionsContainer.innerHTML = '<div class="loading-spinner">Génération du QCM en cours...</div>';
        const userDomain = auth.user?.domain || 'Médecine';
        const response = await qcmService.generateQcm(documentId, userDomain);

        if (response && response._id) {
          window.location.href = `take-test.html?qcmId=${response._id}`;
        } else {
          showNotification('Erreur lors de la génération du QCM.', 'error');
        }
      } catch (error) {
        console.error(error);
        showNotification('Une erreur est survenue lors de la génération.', 'error');
      }
    });
  }
}

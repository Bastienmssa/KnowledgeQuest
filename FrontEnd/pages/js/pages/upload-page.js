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

  if (!auth.isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  setupDropzone();
  setupUploadForm();
}

function setupDropzone() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const fileSelectBtn = document.getElementById('file-select-btn');

  if (!dropArea || !fileInput) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
  });

  dropArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
  fileInput.addEventListener('change', () => handleFiles(fileInput.files));
  fileSelectBtn?.addEventListener('click', () => fileInput.click());
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleFiles(files) {
  if (!files || files.length === 0) return;

  const fileList = document.getElementById('file-list');
  const uploadButton = document.getElementById('upload-button');

  if (fileList) {
    fileList.innerHTML = '';
    for (const file of files) {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-size">(${formatFileSize(file.size)})</span>
      `;
      fileList.appendChild(item);
    }
  }

  if (uploadButton) uploadButton.disabled = false;
}

function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

function setupUploadForm() {
  const uploadForm = document.getElementById('upload-form');
  const progressBar = document.getElementById('upload-progress');
  const progressContainer = document.querySelector('.progress-container');

  if (!uploadForm) return;

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('file-input');
    const file = fileInput?.files[0];
    const submitButton = uploadForm.querySelector('button[type="submit"]');

    if (!file) {
      showNotification('Veuillez sélectionner un fichier.', 'error');
      return;
    }

    if (!documentService.isValidFileType(file)) {
      showNotification('Format non supporté. PDF, Word ou TXT uniquement.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Téléchargement...';
    progressContainer.style.display = 'block';

    try {
      const response = await documentService.uploadDocument(file, (progress) => {
        progressBar.value = progress;
      });

      if (response?._id) {
        showNotification('Document téléchargé avec succès !', 'success');
        showGenerateOptions(response._id);
      } else {
        throw new Error('Échec du téléchargement');
      }
    } catch (error) {
      console.error(error);
      showNotification(error.message || 'Erreur lors du téléchargement.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Télécharger';
      progressContainer.style.display = 'none';
    }
  });
}

function showGenerateOptions(documentId) {
  const optionsContainer = document.getElementById('generate-options');
  if (!optionsContainer) return;

  optionsContainer.innerHTML = `
    <h3>Document téléchargé avec succès !</h3>
    <p>Que souhaitez-vous faire ?</p>
    <div class="options-buttons">
      <button id="generate-qcm-btn" class="btn-primary">Générer un QCM automatiquement</button>
      <a href="create-qcm.html?document=${documentId}" class="btn-secondary">Créer un QCM manuellement</a>
    </div>
  `;
  optionsContainer.style.display = 'block';

  document.getElementById('generate-qcm-btn')?.addEventListener('click', () => {
    generateQCM(documentId);
  });
}

async function generateQCM(documentId) {
  const optionsContainer = document.getElementById('generate-options');
  const userDomain = auth.user?.domain || 'Médecine';

  optionsContainer.innerHTML = `
    <h3>Génération en cours...</h3>
    <p>Analyse du document pour générer un QCM adapté...</p>
    <div class="loading-spinner"></div>
  `;

  try {
    const result = await qcmService.generateQcm(documentId, userDomain);
    if (result?._id) {
      showNotification('QCM généré avec succès 🎉', 'success');
      setTimeout(() => {
        window.location.href = `take-test.html?qcmId=${result._id}`;
      }, 1200);
    } else {
      throw new Error('Échec de la génération automatique');
    }
  } catch (err) {
    optionsContainer.innerHTML = `
      <h3>Erreur lors de la génération</h3>
      <p>${err.message || 'Veuillez réessayer ou créer manuellement.'}</p>
      <div class="options-buttons">
        <a href="create-qcm.html?document=${documentId}" class="btn-primary">Créer un QCM manuellement</a>
      </div>
    `;
    showNotification(err.message, 'error');
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', initUploadPage);

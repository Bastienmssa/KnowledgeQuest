/**
 * Module pour gérer l'upload de documents (PDF, Word)
 * et leur traitement avant envoi à l'API
 */

export function initDocumentUploader() {
    console.log("Initializing document uploader...");
    
    const dropZone = document.getElementById('document-drop-zone');
    const fileInput = document.getElementById('document-file-input');
    const uploadButton = document.getElementById('upload-document-btn');
    
    if (!dropZone || !fileInput) return;
    
    // Configuration de la zone de glisser-déposer
    setupDropZone(dropZone, fileInput);
    
    // Configuration du bouton d'upload
    if (uploadButton) {
        uploadButton.addEventListener('click', () => {
            const files = fileInput.files;
            if (files.length > 0) {
                uploadDocuments(files);
            } else {
                showUploadError('Veuillez sélectionner un document à télécharger');
            }
        });
    }
}

// Configuration de la zone de glisser-déposer
function setupDropZone(dropZone, fileInput) {
    // Prévenir le comportement par défaut du navigateur
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    // Ajouter des effets visuels pendant le drag
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
    
    // Gérer le drop de fichiers
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        fileInput.files = files;
        updateFileList(files);
    }, false);
    
    // Gérer la sélection de fichiers via le bouton
    fileInput.addEventListener('change', () => {
        updateFileList(fileInput.files);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// Afficher la liste des fichiers sélectionnés
function updateFileList(files) {
    const fileList = document.getElementById('selected-files-list');
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Déterminer l'icône selon le type de fichier
        let fileIcon = '📄';
        if (file.type.includes('pdf')) {
            fileIcon = '📑';
        } else if (file.type.includes('word')) {
            fileIcon = '📝';
        }
        
        fileItem.innerHTML = `
            <span class="file-icon">${fileIcon}</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
        `;
        
        fileList.appendChild(fileItem);
    }
}

// Télécharger les documents vers le serveur
async function uploadDocuments(files) {
    const uploadStatus = document.getElementById('upload-status');
    const progressBar = document.getElementById('upload-progress-bar');
    
    if (uploadStatus) {
        uploadStatus.textContent = 'Téléchargement en cours...';
        uploadStatus.className = 'status-uploading';
    }
    
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.parentElement.style.display = 'block';
    }
    
    try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('documents', files[i]);
        }
        
        const response = await window.KnowledgeQuestAPI.uploadDocuments(formData, updateProgress);
        
        if (response.success) {
            if (uploadStatus) {
                uploadStatus.textContent = 'Document(s) téléchargé(s) avec succès!';
                uploadStatus.className = 'status-success';
            }
            
            // Rediriger vers la génération de QCM après 2 secondes
            setTimeout(() => {
                window.location.href = `create-qcm.html?fromDoc=${response.documentId}`;
            }, 2000);
        } else {
            showUploadError(response.message || 'Erreur lors du téléchargement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showUploadError('Une erreur est survenue lors du téléchargement');
    }
    
    function updateProgress(progress) {
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
}

// Afficher une erreur d'upload
function showUploadError(message) {
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
        uploadStatus.textContent = message;
        uploadStatus.className = 'status-error';
    }
}

// Formater la taille du fichier (KB, MB)
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1048576) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / 1048576).toFixed(1) + ' MB';
    }
}
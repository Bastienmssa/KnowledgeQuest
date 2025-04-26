// controllers/documentController.js
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const multer = require('multer');
const logger = require('../utils/logger');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour n'accepter que certains types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Veuillez télécharger un fichier PDF, Word ou TXT.'));
  }
};

// Configuration de l'upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Mo
  }
});

// Middleware pour le téléchargement de fichier
exports.uploadDocument = upload.single('document');

// Contrôleur pour traiter le téléchargement
exports.processUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier téléchargé.' });
    }

    // 1️ Créer l’entrée en base
    const document = await Document.create({
      filename:     req.file.filename,
      originalName: req.file.originalname,
      path:         req.file.path,
      mimetype:     req.file.mimetype,
      size:         req.file.size,
      userId:       req.user.id
    });

    // 2️ Lire le PDF et en extraire le texte
    const buffer = fs.readFileSync(document.path);
    const { text: extractedText } = await pdf(buffer);

    await document.save();

    // 3️ Configurer l’API OpenAI
    // (Déjà fait au début du fichier avec le module OpenAI)

    // 4️ Préparer le prompt
    const prompt = `
      Extrait du document "${document.originalName}" :
      ${extractedText}

      Génère-moi un QCM de 5 questions avec 4 choix chacune.
      Répond uniquement en JSON :
      {
        "questions": [
          { "question":"...", "choices":["…","…","…","…"], "correctAnswerIndex":2 },
          …
        ]
      }
    `;

    // 5️ Appel à OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu es un générateur de QCM.' },
        { role: 'user',   content: prompt }
      ]
    });

    let raw = aiResponse.choices[0].message.content.trim();
    if (raw.startsWith('```'))
      {
        raw = raw.replace(/^```(?:json)?\r?\n/, '').replace(/```$/, '');
      }

    // 6️ Parser la réponse JSON
    const aiJson = JSON.parse(raw);
    // 7️ (Optionnel) enregistrer le QCM via votre logique existante…
    //    – Soit vous redirigez vers votre /api/qcms/generate,
    //    – Soit vous appelez Qcm.create() ici directement.

    // Pour l’instant on renvoie juste l’extraction et la recette IA :
    res.status(201).json({
      success: true,
      document,
      extractedText: extractedText.slice(0, 200) + '…',  // aperçu
      aiJson
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Télécharger un document généré
exports.downloadDocument = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../uploads', filename);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }
    
    res.download(filepath);
  } catch (error) {
    logger.error(`Erreur lors du téléchargement du document: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du document',
      error: error.message
    });
  }
};
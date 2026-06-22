const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Define local uploads directory
const uploadDir = path.join(__dirname, '../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure Multer validation rules
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit size to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Format error: Only JPEG, JPG, PNG, WEBP, and SVG assets are supported.'));
  }
});

// POST /api/uploads - Upload single image (Admin authorized)
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // Local file path accessible through the static middleware
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(201).json({
      success: true,
      message: 'Asset uploaded successfully to pipeline',
      url: fileUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'File upload pipeline failed', error: error.message });
  }
});

module.exports = router;

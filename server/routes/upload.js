const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config (Memory Storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'drakewears_products' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Single Image Upload
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const url = await uploadBufferToCloudinary(req.file.buffer);
    res.status(200).json({ 
      message: 'Image uploaded successfully',
      url
    });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
  }
});

// Multiple Images Upload (Up to 20 images at once)
router.post('/multiple', verifyToken, isAdmin, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => uploadBufferToCloudinary(file.buffer));
    const urls = await Promise.all(uploadPromises);

    res.status(200).json({
      message: 'Images uploaded successfully',
      urls
    });
  } catch (error) {
    console.error('Multiple upload route error:', error);
    res.status(500).json({ message: 'Failed to upload images to Cloudinary' });
  }
});

// Customer Payment Receipt Upload (Public / Guest accessible for EasyPaisa checkout)
router.post('/receipt', (req, res, next) => {
  upload.single('receipt')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Max 5MB allowed.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message || 'Invalid file format. Please upload an image.' });
    }
    next();
  });
}, async (req, res) => {
  try {
    // 1. If file uploaded via Multer
    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'drakewears_receipts' },
        (error, result) => {
          if (error) {
            console.error('[Upload Receipt] Cloudinary stream error:', error);
            return res.status(500).json({ message: 'Failed to upload receipt image to Cloudinary' });
          }
          return res.status(200).json({
            message: 'Payment screenshot uploaded successfully',
            url: result.secure_url
          });
        }
      );
      return streamifier.createReadStream(req.file.buffer).pipe(stream);
    }

    // 2. If base64 uploaded in JSON body
    if (req.body && req.body.imageBase64) {
      const result = await cloudinary.uploader.upload(req.body.imageBase64, {
        folder: 'drakewears_receipts'
      });
      return res.status(200).json({
        message: 'Payment screenshot uploaded successfully',
        url: result.secure_url
      });
    }

    return res.status(400).json({ message: 'No screenshot file provided' });
  } catch (error) {
    console.error('[Upload Receipt] Handler error:', error);
    res.status(500).json({ message: error.message || 'Error processing receipt upload' });
  }
});

module.exports = router;


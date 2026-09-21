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

module.exports = router;

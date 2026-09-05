const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
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

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Upload from buffer to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'drakewears_products' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
        }
        
        res.status(200).json({ 
          message: 'Image uploaded successfully',
          url: result.secure_url
        });
      }
    );
    
    streamifier.createReadStream(req.file.buffer).pipe(stream);

  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ message: 'Failed to process upload request' });
  }
});

module.exports = router;

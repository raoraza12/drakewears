const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const settings = await req.prisma.setting.findMany();
    // Convert array of {key, value} to object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

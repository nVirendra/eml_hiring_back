const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, resume, cb) => {
    const ext = path.extname(resume.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

module.exports = upload;

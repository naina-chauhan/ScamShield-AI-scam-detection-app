import multer from 'multer';

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();

// File filter for email files
const emailFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['message/rfc822', 'application/octet-stream', 'text/plain'];
  const allowedExtensions = ['.eml', '.msg', '.txt'];
  
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .eml and .msg files are allowed.'));
  }
};

// File filter for audio files
const audioFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/webm',
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files (WAV, MP3, OGG, WebM) are allowed.'));
  }
};

// Multer configurations
export const uploadEmail = multer({
  storage,
  fileFilter: emailFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
}).single('emailFile');

export const uploadAudio = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
}).single('audioFile');

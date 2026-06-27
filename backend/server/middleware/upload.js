const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "craftroots",
    format: "webp",
    transformation: [
      {
        width: 800,
        height: 800,
        crop: "limit",
        quality: "auto:good",
        fetch_format: "auto",
      },
    ],
  }),
});

const upload = multer({ storage });

module.exports = upload;
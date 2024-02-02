const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || "3000";
const staticpath = path.join(__dirname, "public");

app.use(express.json());
app.use(express.static(staticpath));
app.get("/", (req, res) => {
  res.sendFile("./main.html", { root: __dirname });
});

app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 2024 * 1024 },
  })
);

// Cloudinary Configuration starts
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
//Cloudinary Configuration ends

app.put("/", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: "No files were uploaded." });
  }

  const file = req.files.file;

  // Check if the uploaded file is a PDF
  if (file.mimetype !== "application/pdf") {
    return res.status(400).json({ message: "Only PDF files are allowed." });
  }

  // Use Cloudinary to upload the file
  cloudinary.uploader.upload(
    file.tempFilePath,
    { folder: "pdfs" },
    (err, result) => {
      if (err) {
        alert("Error while uploading file, please try again.");
        return res
          .status(500)
          .json({ message: "Error uploading file to Cloudinary." });
      }

      // You can store the Cloudinary URL in a database or return it in the response
      const fileUrl = result.secure_url;
      res.json({ message: "File uploaded successfully", fileUrl });
    }
  );
});

app.listen(PORT, (req, res) => {
  console.log("server");
});

const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

//            P A S T E   Y O U R   M O N G O   U R I   I N   T H E   C O D E   B E L O W           //

// Set up MongoDB connection
mongoose.connect('', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for the PDF model
const pdfSchema = new mongoose.Schema({
  name: String,
  data: Buffer,
});

const Pdf = mongoose.model('Pdf', pdfSchema);

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define a route to handle PDF file uploads
app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    // Create a new PDF document instance
    const newPdf = new Pdf({
      name: req.file.originalname,
      data: req.file.buffer,
    });

    // Save the PDF document to the collection
    await newPdf.save();

    res.status(201).json({ message: 'PDF file uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route to view PDF files
app.get('/view/:id', async (req, res) => {
    try {
      // Find the PDF document in the database using its ID
      const pdf = await Pdf.findById(req.params.id);
  
      // Check if the PDF document was found
      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }
  
      // Set the response headers to display the PDF file in the browser
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + pdf.name + '"');
  
      // Send the PDF data in the response
      res.send(pdf.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

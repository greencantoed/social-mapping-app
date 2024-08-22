const express = require('express');
const path = require('path');
const multer = require('multer');
const knex = require('knex')(require('./knexfile').development);  // Import Knex and connect to the database
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Handle report submissions
app.post('/api/reports', upload.single('photo'), async (req, res) => {
    const { description, location } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Split the location into latitude and longitude
    const [latitude, longitude] = location.split(',');

    const report = {
        description,
        // Use Knex to insert the location as a geography point
        location: knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [longitude, latitude]),
        imageUrl,
    };

    try {
        // Insert the report into the 'reports' table
        await knex('reports').insert(report);
        
        // Return a simple success message with relevant parts of the report
        res.status(201).json({
            message: 'Report submitted successfully!',
            report: { description, location: [latitude, longitude], imageUrl }
        });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ message: 'Failed to submit report' });
    }
});

// Endpoint to retrieve reports from the database
app.get('/api/reports', async (req, res) => {
    try {
        // Select all reports from the 'reports' table
        const reports = await knex('reports').select('*');
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const multer = require('multer');
const db = require('../db');
const bodyParser = require('body-parser');
const router = express.Router();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads'); // Specify the folder to store images
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Create a unique filename
    }
});

const upload = multer({ storage: storage });

// Route to display the form
router.get('/addVillage', (req, res) => {
    res.render('pages/villages/addVillage');
});

// Route to handle form submission
router.post('/addVillage', urlencodedParser, upload.single('image'), (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null; // Get the uploaded image filename

    const query = `
    INSERT INTO villages (name, description) VALUES (?, ?)
  `;

    db.query(query, [name, description], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        const villageId = result.insertId;

        if (image) {
            const imageQuery = `
          INSERT INTO village_images (village_id, file_name) VALUES (?, ?)
        `;
            db.query(imageQuery, [villageId, image], (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.redirect('/villages');
            });
        } else {
            res.redirect('/villages');
        }

    });
});

module.exports = router;

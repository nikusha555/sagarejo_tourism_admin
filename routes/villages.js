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
    cb(null, 'public/images'); // Specify the folder to store images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Create a unique filename
  }
});

const upload = multer({ storage: storage });

// Route to display the form
router.get('/addVillage', (req, res) => {
  res.render('pages/villages/add_village'); // Ensure you have this EJS file
});

// Route to handle form submission
router.post('/addVillage', urlencodedParser, upload.single('image'), (req, res) => {
  const { name, description } = req.body;
  const created_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const image = req.file ? req.file.filename : null; // Get the uploaded image filename

  const query = `
    INSERT INTO villages (name, description, created_date) VALUES (?, ?, ?)
  `;

  db.query(query, [name, description, created_date], (err, result) => {
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
        res.redirect('/villages'); // Redirect to the villages list after successful insertion
      });
    } else {
      res.redirect('/villages'); // Redirect to the villages list if no image is uploaded
    }
  });
});

// Route to fetch and display villages
router.get('/', (req, res) => {
  const query = `
    SELECT 
      v.id,
      v.name,
      v.description,
      (SELECT vi.file_name 
       FROM village_images vi 
       WHERE vi.village_id = v.id 
       LIMIT 1) AS village_image
    FROM 
      villages v;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching villages:', err);
      return res.status(500).send('Server error');
    }
    res.render('pages/villages/villages', { title: 'Villages', data: results });
  });
});

// Route to display details of a single village
router.get('/village/:id', (req, res) => {
  const villageId = req.params.id;

  if (!villageId) {
    return res.status(400).send('Village ID is required');
  }

  const query = `
    SELECT 
      v.id,
      v.name,
      v.description,
      vi.file_name AS village_image
    FROM 
      villages v
      LEFT JOIN village_images vi ON v.id = vi.village_id
    WHERE 
      v.id = ?;
  `;

  db.query(query, [villageId], (err, results) => {
    if (err) {
      console.error('Error fetching village details:', err);
      return res.status(500).send('Server error');
    }
    if (results.length > 0) {
      res.render('pages/villages/village', { village: results[0] });
    } else {
      res.status(404).send('Village not found');
    }
  });
});


router.get('/updateVillage/:id', (req, res) => {
  const villageId = req.params.id;

  const query = `
    SELECT villages.id, villages.name, villages.description, village_images.file_name
    FROM villages 
    LEFT JOIN village_images ON villages.id = village_images.village_id
    WHERE villages.id = ?
  `;

  db.query(query, [villageId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (results.length === 0) {
      return res.status(404).send('Village not found');
    }

    const villageDetail = {
      id: results[0].id,
      name: results[0].name,
      description: results[0].description,
      images: results.map(row => row.file_name ? `/images/uploads/${row.file_name}` : null).filter(Boolean)
    };

    res.render("pages/villages/updateVillage", { villageDetail });
  });
});



router.post('/updateVillage/:id', urlencodedParser, upload.single('image'), (req, res) => {
  const villageId = req.params.id;
  const { name, description } = req.body;
  const image = req.file ? req.file.filename : null; // Get the uploaded image filename

  const updateQuery = `
    UPDATE villages SET name = ?, description = ? WHERE id = ?
  `;

  db.query(updateQuery, [name, description, villageId], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (image) {
      const imageQuery = `
        INSERT INTO village_images (village_id, file_name) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE file_name = VALUES(file_name)
      `;
      db.query(imageQuery, [villageId, image], (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.redirect('/villages'); // Redirect to the villages list after successful update
      });
    } else {
      res.redirect('/villages'); // Redirect to the villages list if no new image is uploaded
    }
  });
});



module.exports = router;

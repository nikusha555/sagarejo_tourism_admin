const express = require('express');
const path = require('path');
const connection = require('./db');
const app = express();
const indexRouter = require('./routes/index');
const addVillageRoutes = require('./routes/add_village');
const villagesRouter = require('./routes/villages')

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter)
app.use('/villages', villagesRouter);
app.use('/', addVillageRoutes); // Use addVillage routes




const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

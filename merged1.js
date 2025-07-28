// Updated memberApp.js for full functionality: Auth, Role-based CRUD, Search
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/image'); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use(flash());

const connection = mysql.createConnection({
    host: 'hsafi8.h.filess.io',
    user: 'C237CA2_topsortjar',
    password: '7a19b1fa6075866d1b321e5554d63c85d7cb1480',
    database: 'C237CA2_topsortjar',
    port: 3307
});

connection.connect(err => {
    if (err) return console.error('MySQL Error:', err);
    console.log('Connected to MySQL database');
});

const checkAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    req.flash('error', 'Please log in to continue');
    res.redirect('/login');
};

const checkAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') return next();
    req.flash('error', 'Admin access only');
    res.redirect('/');

// Define routes
//members page
};

// Home page with search
app.get('/', (req, res) => {
    const keyword = req.query.keyword || '';
    const sql = keyword
        ? 'SELECT memberID, memberName FROM members WHERE memberName LIKE ? OR memberID = ?'
        : 'SELECT memberID, memberName FROM members';
    const params = keyword ? [`%${keyword}%`, keyword] : [];
    connection.query(sql, params, (err, results) => {
        if (err) throw err;
        res.render('index', {
            user: req.session.user,
            members: results,
            messages: req.flash('success'),
            errors: req.flash('error'),
            keyword
        });
    });
});

app.get('/register', (req, res) => {
    res.render('register', {
        messages: req.flash('error'),
        formData: req.flash('formData')[0] || {}
    });
});

app.post('/register', (req, res) => {
    const { memberName, email, password, address, phone, role } = req.body;
    if (!memberName || !email || !password || !address || !phone || !role) {
        req.flash('error', 'All fields are required.');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters.');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    const sql = 'INSERT INTO members (memberName, email, password, address, phone, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    connection.query(sql, [memberName, email, password, address, phone, role], err => {
        if (err) {
            req.flash('error', 'Email exists or DB error.');
            req.flash('formData', req.body);
            return res.redirect('/register');
        }
        req.flash('success', 'Registered! Please login.');
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        messages: req.flash('success'),
        errors: req.flash('error')
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM members WHERE email = ? AND password = SHA1(?)';
    connection.query(sql, [email, password], (err, results) => {
        if (err) throw err;
        if (!results.length) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/login');
        }
        req.session.user = results[0];
        res.redirect('/dashboard');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Dashboard
app.get('/dashboard', checkAuthenticated, (req, res) => {
    const keyword = req.query.keyword || '';
    const sql = req.session.user.role === 'admin'
        ? (keyword
            ? 'SELECT * FROM members WHERE memberName LIKE ? OR memberID = ?'
            : 'SELECT * FROM members')
        : 'SELECT * FROM members WHERE memberID = ?';

    const params = req.session.user.role === 'admin'
        ? (keyword ? [`%${keyword}%`, keyword] : [])
        : [req.session.user.memberID];

    connection.query(sql, params, (err, results) => {
        if (err) throw err;
        res.render('dashboard', {
            user: req.session.user,
            members: results,
            keyword // this must be passed to avoid "keyword is not defined" error in EJS
        });
    }); 
}); 


// Edit member (login required)
app.get('/members/edit/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM members WHERE memberID = ?', [id], (err, results) => {
        if (err) throw err;
        res.render('edit', { member: results[0], user: req.session.user });
    });
});

app.post('/members/edit/:id', checkAuthenticated, (req, res) => {
    const id = req.params.id;
    const { memberName, email, address, phone, role } = req.body;
    const sql = 'UPDATE members SET memberName=?, email=?, address=?, phone=?, role=? WHERE memberID=?';
    connection.query(sql, [memberName, email, address, phone, role, id], err => {
        if (err) throw err;
        req.flash('success', 'Member updated.');
        res.redirect('/');
    });
});

// Delete (admin only)
app.post('/members/delete/:id', checkAuthenticated, checkAdmin, (req, res) => {
    connection.query('DELETE FROM members WHERE memberID = ?', [req.params.id], err => {
        if (err) throw err;
        req.flash('success', 'Member deleted.');
        res.redirect('/');
    });
});

// View member list (all members)
app.get('/members', checkAuthenticated, (req, res) => {
    connection.query('SELECT * FROM members', (err, results) => {
        if (err) throw err;
        res.render('memberList', { user: req.session.user, members: results });
    });
});
// Show form to create a new member (admin only)
app.get('/members/new', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('newmember', {
        user: req.session.user,
        messages: req.flash('error'),
        formData: req.flash('formData')[0] || {}
    });
});

// Handle new member submission (admin only)
app.post('/members/new', checkAuthenticated, checkAdmin, (req, res) => {
    const { memberName, email, password, address, phone, role } = req.body;

    if (!memberName || !email || !password || !address || !phone || !role) {
        req.flash('error', 'All fields are required.');
        req.flash('formData', req.body);
        return res.redirect('/members/new');
    }

    if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters.');
        req.flash('formData', req.body);
        return res.redirect('/members/new');
    }

    const sql = 'INSERT INTO members (memberName, email, password, address, phone, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    connection.query(sql, [memberName, email, password, address, phone, role], err => {
        if (err) {
            req.flash('error', 'Email exists or DB error.');
            req.flash('formData', req.body);
            return res.redirect('/members/new');
        }
        req.flash('success', 'New member added.');
        res.redirect('/dashboard');
    });
});

/*****************************************************************************************************/

//location
app.get('/loc', (req, res) => {
  const keyword = req.query.keyword;
  let sql = 'SELECT * FROM locations';
  let params = [];

  if (keyword && keyword.trim() !== '') {
    sql += ' WHERE location_name LIKE ? OR address LIKE ?';
    const likeKeyword = `%${keyword}%`;
    params.push(likeKeyword, likeKeyword);
  }

  connection.query(sql, params, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error retrieving locations');
    }
    res.render('loc', { locations: results, keyword: keyword });
  });
});

app.get('/loc/:id', (req, res) => {
  const locationId = req.params.id;
  const sql = 'SELECT * FROM locations WHERE location_id = ?';
  connection.query(sql, [locationId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error retrieving location');
    }
    if (results.length > 0) {
      res.render('loc', { location: results[0] });
    } else {
      res.status(404).send('Location not found');
    }
  });
});

app.get('/addLocation', (req, res) => {
  res.render('addLocation');
});

app.post('/addLocation', upload.single('image'), (req, res) => {
  const { name, address, unit, postal, country, capacity } = req.body;
  let image;
  if (req.file) {
    image = req.file.filename; 
  } else {
    image = null;
  }
  const sql = `
    INSERT INTO locations 
    (location_name, address, unit, postal_code, country, image, capacity) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  connection.query(sql, [name, address, unit, postal, country, image, capacity], (error, results) => {
    if (error) {
      console.error('Error adding location:', error);
      res.status(500).send('Error adding location');
    }
    res.redirect('/loc');
  });
});

app.get('/editLocation/:id', (req, res) => {
  const locationId = req.params.id;
  const sql = 'SELECT * FROM locations WHERE location_id = ?';
  connection.query(sql, [locationId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error retrieving location');
    }
    if (results.length > 0) {
      res.render('editLocation', { location: results[0] });
    } else {
      res.status(404).send('Location not found');
    }
  });
});

app.post('/editLocation/:id', upload.single('image'), (req, res) => {
  const locationId = req.params.id;
  const { name, address, unit, postal, country,capacity } = req.body;
  let image = req.body.currentImage; 
  if (req.file) { 
    image = req.file.filename; 
  }
  const sql = `
    UPDATE locations 
    SET location_name = ?, address = ?, unit = ?, postal_code = ?, country = ?, image = ?,capacity = ?
    WHERE location_id = ?
  `;
  connection.query(sql, [name, address, unit, postal, country,image,capacity, locationId], (error) => {
    if (error) {
      console.error('Error updating location:', error);
      return res.status(500).send('Error updating location');
    }
    res.redirect('/loc');
  });
});

app.get('/deleteLocation/:id', (req, res) => {
  const locationId = req.params.id;
  const sql = 'DELETE FROM locations WHERE location_id = ?';
  connection.query(sql, [locationId], (error, results) => {
    if (error) {
      console.error('Error deleting location:', error);
      return res.status(500).send('Error deleting location');
    }
    res.redirect('/loc');
  });
});

/********************************************************************* */
/*classes page */
// View all classes

app.get('/classView', checkAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM classT';
    connection.query(sql, (err, classes) => {
        if (err) {
            console.error('Database error:', err);
            req.flash('error', 'Error loading classes: ' + err.message);
            return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/dashboard');
        }
        
        res.render('classView', { 
            classT: classes,
            user: req.session.user,
            isAdmin: req.session.user.role === 'admin'
        });
    });
});

// Add class GET
app.get('/addClass', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('addClass', { user: req.session.user });
});

// Add class POST
app.post('/addClass', checkAuthenticated, checkAdmin, (req, res) => {
    const { className, description, startTime, endTime, price ,location} = req.body;
    const sql = 'INSERT INTO classT (className, description, startTime, endTime, price,location ) VALUES (?, ?, ?, ?, ?,?)';
    connection.query(sql, [className, description, startTime, endTime, price,location ], err => {
        if (err) {
            console.error('Error adding class:', err);
            return res.status(500).send('Error adding class');
            }
            else
            {
                res.redirect('/classView'); // Redirect to the class view page after adding the class
            }
        });
});


app.get('/editClass/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const classID = req.params.id;
    const sql = 'SELECT * FROM classT WHERE classID = ?';
    connection.query(sql, [classID], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            req.flash('error', 'Error retrieving class');
            return res.redirect('/classView');
        }
        if (results.length > 0) {
            res.render('editClass', { 
                classItem: results[0],  // Changed from classID to classItem for clarity
                user: req.session.user 
            }); 
        } else {
            req.flash('error', 'Class not found');
            res.redirect('/classView');
        }
    });
});

// Fixed editClass POST route
app.post('/editClass/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const classID = req.params.id;
    const { className, description, startTime, endTime, price } = req.body;
    const sql = 'UPDATE classT SET className = ?, description = ?, startTime = ?, endTime = ?, price = ? WHERE classID = ?';
    connection.query(sql, [className, description, startTime, endTime, price, classID], (error, results) => {
        if (error) {
            console.error('Error updating class:', error);
            req.flash('error', 'Error updating class');
            return res.redirect('/editClass/' + classID);
        }
        req.flash('success', 'Class updated successfully');
        res.redirect('/classView'); 
    });
});

// Add delete class route 
app.get('/deleteClass/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const classID = req.params.id;
    const sql = 'DELETE FROM classT WHERE classID = ?';
    connection.query(sql, [classID], (error, results) => {
        if (error) {
            console.error('Error deleting class:', error);
            req.flash('error', 'Error deleting class');
        } else {
            req.flash('success', 'Class deleted successfully');
        }
        res.redirect('/classView');
    });
});
//room
// View all rooms
app.get('/rooms', checkAuthenticated, (req, res) => {
  const sql = 'SELECT * FROM room';
  connection.query(sql, (err, rooms) => {
    if (err) throw err;
    res.render('rooms', { rooms, user: req.session.user });
  });
});

// Add Room GET
app.get('/addRoom', checkAuthenticated, checkAdmin, (req, res) => {
  res.render('addRoom', { user: req.session.user });
});

// Add Room POST
app.post('/addRoom', checkAuthenticated, checkAdmin, (req, res) => {
  const { roomName, capacity } = req.body;
  const sql = 'INSERT INTO room (roomName, capacity) VALUES ( ?, ?)';
  connection.query(sql, [ roomName, capacity], err => {
    if (err) throw err;
    res.redirect('/rooms');
  });
});

// Update Room GET
app.get('/rooms/update/:id', checkAuthenticated, checkAdmin, (req, res) => {
  const sql = 'SELECT * FROM room WHERE roomID = ?';
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      req.flash('error', 'Database error occurred');
      return res.redirect('/rooms');
    }
    if (result.length === 0) {
      req.flash('error', 'Room not found');
      return res.redirect('/rooms');
    }
    res.render('updateRoom', { 
      room: result[0], 
      user: req.session.user,
      messages: req.flash('error')
    });
  });
});

// Update Room POST - with validation and better error handling
app.post('/rooms/update/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const roomID = req.params.id;
    const { roomName, capacity } = req.body;
    
    // Basic validation
    if (!roomName || !capacity) {
        req.flash('error', 'All fields are required');
        return res.redirect(`/rooms/update/${roomID}`);
    }   
    
    const sql = 'UPDATE room SET roomName = ?, capacity = ? WHERE roomID = ?';
    connection.query(sql, [roomName, capacity, roomID], (err, result) => {
        if (err) {
            console.error('Update error:', err);
            req.flash('error', 'Failed to update room. Please try again.');
            return res.redirect(`/rooms/update/${roomID}`);
        }
        
        req.flash('success', 'Room updated successfully');
        res.redirect('/rooms');
    });
});

// Delete Room
app.get('/rooms/delete/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const roomID = req.params.id;
    const sql = 'DELETE FROM room WHERE roomID = ?';
    connection.query(sql, [roomID], (error, results) => {
        if (error) {
            console.error('Error deleting room:', error);
            req.flash('error', 'Error deleting room');
        } else {
            req.flash('success', 'Class deleted successfully');
        }
        res.redirect('/rooms');
    });
});
/***********************************************************/


//billing

app.get('/billing', checkAuthenticated, (req, res) => {
    const month = req.query.month;
    const year = req.query.year;
    let sql = 'SELECT * FROM billing';
    const values = [];

    if (month && year) {
        sql += ' WHERE MONTH(due_date) = ? AND YEAR(due_date) = ?';
        values.push(month, year);
    }

    connection.query(sql, values, (err, results) => {
        if (err) throw err;
        res.render('billing', {
            user: req.session.user,
            billings: results,
            messages: req.flash('success'),
            errors: req.flash('error'),
            query: req.query
        });
    });
});

app.get('/billings', (req, res) => {
    res.redirect('/billing');
});

// Add Billing Form (admin only)
app.get('/billing/add', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('billingForm', { billing: null });
});

// Handle Add Billing POST (admin only)
app.post('/billing/add', checkAuthenticated, checkAdmin, (req, res) => {
    const { member_id, price, description, payment_date, payment_method, status } = req.body;
    const sql = 'INSERT INTO billing (member_id, price, description, payment_date, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [member_id, price, description, payment_date, payment_method, status], (err) => {
        if (err) throw err;
        req.flash('success', 'Billing record added successfully.');
        res.redirect('/billing');
    });
});

// Render Edit Billing Form (admin only)
app.get('/billing/edit/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'SELECT * FROM billing WHERE billing_id = ?';
    connection.query(sql, [req.params.id], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            req.flash('error', 'Billing record not found.');
            return res.redirect('/billing');
        }
        res.render('billingForm', { billing: results[0] });
    });
});

// Handle Edit Billing POST (admin only)
app.post('/billing/edit/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const { member_id, price, description, payment_date, payment_method, status } = req.body;
    const sql = 'UPDATE billing SET member_id=?, price=?, description=?, payment_date=?, payment_method=?, status=? WHERE billing_id=?';
    connection.query(sql, [member_id, price, description, payment_date, payment_method, status, req.params.id], (err) => {
        if (err) throw err;
        req.flash('success', 'Billing updated successfully.');
        res.redirect('/billing');
    });
});

// Confirm Delete Billing (admin only)
app.get('/billing/delete/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'SELECT * FROM billing WHERE billing_id = ?';
    connection.query(sql, [req.params.id], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            req.flash('error', 'Billing record not found.');
            return res.redirect('/billing');
        }
        res.render('deleteBilling', { billing: results[0] });
    });
});

// Handle Delete Billing POST (admin only)
app.post('/billing/delete/:id', checkAuthenticated, checkAdmin, (req, res) => {
    const sql = 'DELETE FROM billing WHERE billing_id = ?';
    connection.query(sql, [req.params.id], (err) => {
        if (err) throw err;
        req.flash('success', 'Billing deleted.');
        res.redirect('/billing');
    });
});


/***********************/
//booking 
app.get('/book', (req, res) => {
  const sql = "SELECT b.bookingID, m.name, m.memberID, c.className, b.booking_date, b.timeslot, b.status " +
              "FROM bookings b " +
              "JOIN members m ON b.memberID = m.memberID " +
              "JOIN classes c ON b.classID = c.classID";
  db.query(sql, (err, results) => {
    if (err) throw err;
    db.query('SELECT * FROM classes', (err, classes) => {
      if (err) throw err;
      res.render('book', { bookings: results, classes });
    });
  });
});

app.post('/book', (req, res) => {
  const { name, memberID, classID, booking_date, timeslot } = req.body;
  if (memberID) {
    db.query(
      'INSERT INTO bookings (memberID, classID, booking_date, timeslot) VALUES (?, ?, ?, ?)',
      [memberID, classID, booking_date, timeslot],
      err => {
        if (err) throw err;
        res.redirect('/book');
      }
    );
  } else {
    db.query('INSERT INTO members (name) VALUES (?)', [name], (err, result) => {
      if (err) throw err;
      const newMemberID = result.insertId;
      db.query(
        'INSERT INTO bookings (memberID, classID, booking_date, timeslot) VALUES (?, ?, ?, ?)',
        [newMemberID, classID, booking_date, timeslot],
        err => {
          if (err) throw err;
          res.redirect('/book');
        }
      );
    });
  }
});

app.post('/cancel/:id', (req, res) => {
  db.query('UPDATE bookings SET status = "Cancelled" WHERE bookingID = ?', [req.params.id], err => {
    if (err) throw err;
    res.redirect('/book');
  });
});

app.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM classes', (err, classes) => {
    if (err) throw err;
    db.query(
      "SELECT b.bookingID, m.name, c.classID, b.booking_date, b.timeslot " +
      "FROM bookings b " +
      "JOIN members m ON b.memberID = m.memberID " +
      "JOIN classes c ON b.classID = c.classID " +
      "WHERE b.bookingID = ?",
      [id],
      (err, result) => {
        if (err) throw err;
        res.render('edit', { booking: result[0], classes });
      }
    );
  });
});

app.post('/edit/:id', (req, res) => {
  const { classID, booking_date, timeslot } = req.body;
  db.query(
    'UPDATE bookings SET classID = ?, booking_date = ?, timeslot = ? WHERE bookingID = ?',
    [classID, booking_date, timeslot, req.params.id],
    err => {
      if (err) throw err;
      res.redirect('/');
    }
  );
});

//******************* */

const PORT = process.env.PORT || 3307;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`));

//test commit
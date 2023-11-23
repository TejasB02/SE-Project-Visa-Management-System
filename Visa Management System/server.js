const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const upload = multer();
const app = express();
const port = 3000;
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Create a MySQL database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Establish the database connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Log HTTP requests to the console
app.use(morgan('dev'));

// Add CORS setup
app.use(cors());

// Add body-parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (including JavaScript)
app.use(express.static('public'));

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.send('Server is running and this is the root URL.');
});

// Define a route for getting a visa application by passport number
app.get('/visa_applications', (req, res) => {
  const passportNumber = req.query.passportNumber;

  // Check if passportNumber is provided
  if (!passportNumber) {
    return res.status(400).json({ error: 'Passport number is required.' });
  }

  // SQL query to select visa application and associated documents by passport number
  const sql = `
  SELECT 
    va.*, 
    vad.document_name, 
    vad.document_type, 
    vad.document_data,
    vap.application_date,
    vap.application_status
  FROM visa_applicants va
  LEFT JOIN visa_application_documents vad ON va.id = vad.visa_application_id
  LEFT JOIN visa_applications vap ON va.id = vap.applicant_id
  WHERE va.passport_number = ?`;

  // Execute the query
  connection.query(sql, [passportNumber], (err, results) => {
    if (err) {
      console.error('Error executing SQL query: ' + err);
      res.status(500).json({ error: 'An error occurred while fetching visa application.' });
      return;
    }

    // Check if the result is not empty
    if (results.length === 0) {
      res.status(404).json({ error: 'No visa application found for the given passport number.' });
      return;
    }

    // Send the query results as a JSON response
    res.json(results);

    // Send the query results as a JSON response
    const enrichedData = {
      ...results[0],  // Assuming you want to enrich the first result
      application_date: results[0].application_date,
      application_status: results[0].application_status,
    };

    res.json(enrichedData);  
  });
});

// Define API endpoints
app.get('/visa_types', (req, res) => {
  // SQL query to select all visa types
  const sql = 'SELECT id, name, description FROM visa_types';

  // Execute the query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query: ' + err);
      res.status(500).json({ error: 'An error occurred while fetching visa types.' });
      return;
    }

    // Send the query results as a JSON response
    res.json(results);
  });
});

// File upload middleware
app.use((req, res, next) => {
  upload.single('document_data')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred (e.g., file size limit exceeded)
      res.status(400).json({ error: 'File upload error.' });
    } else if (err) {
      // An unknown error occurred during file upload
      res.status(500).json({ error: 'Internal server error.' });
    } else {
      // No file upload error, proceed to the next middleware
      next();
    }
  });
});

app.post('/visa_applications', (req, res) => {
  // Extract data from the request body
  const {
    first_name,
    last_name,
    passport_number,
    date_of_birth,
    nationality,
    visa_type,
    application_status,
    application_date,
    document_name,
    document_type,
    consulate_name,
    first_name_officer,
    last_name_officer,
  } = req.body;

  // Handle file information from the request
  const file = req.file;

  // Check if a file is present
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const documentSize = file.size;
  const documentData = file.buffer;

  // Set the payment amount based on visa type
  let paymentAmount;
  switch (visa_type) {
    case '1': // Tourist Visa
      paymentAmount = 8500;
      break;
    case '2': // Business Visa
      paymentAmount = 11850;
      break;
    case '3': // Student Visa
      paymentAmount = 10880;
      break;
    default:
      paymentAmount = 0; // Handle other cases if needed
  }

  // Insert data into visa_applicants table
  connection.query(
    'INSERT INTO visa_applicants (first_name, last_name, passport_number, date_of_birth, nationality) VALUES (?, ?, ?, ?, ?)',
    [first_name, last_name, passport_number, date_of_birth, nationality],
    (err, results) => {
      if (err) {
        console.error('Error inserting into visa_applicants: ' + err);
        res.status(500).json({ error: 'An error occurred while processing the application.' });
        return;
      }

      const applicantId = results.insertId;

      function generatePaymentDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
      
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
      }
      
      // Other parts of your code...
      
      // Assuming you have applicationId and paymentAmount defined elsewhere in your code
      const paymentDate = generatePaymentDate();
      
      
      // Insert data into visa_applications table
      connection.query(
        'INSERT INTO visa_applications (visa_type_id, applicant_id, application_status, application_date) VALUES (?, ?, ?, ?)',
        [visa_type, applicantId, application_status, application_date],
        (err, results) => {
          if (err) {
            console.error('Error inserting into visa_applications: ' + err);
            res.status(500).json({ error: 'An error occurred while processing the application.' });
            return;
          }

          const applicationId = results.insertId;

          // Insert data into visa_application_documents table
          connection.query(
            'INSERT INTO visa_application_documents (visa_application_id, document_name, document_type, document_size, document_data) VALUES (?, ?, ?, ?, ?)',
            [applicationId, document_name, document_type, documentSize, documentData],
            (err) => {
              if (err) {
                console.error('Error inserting into visa_application_documents: ' + err);
                res.status(500).json({ error: 'An error occurred while processing the application.' });
                return;
              }

              // Insert data into payments table
              connection.query(
                'INSERT INTO payments (application_id, payment_amount, payment_date) VALUES (?, ?, ?)',
                [applicationId, paymentAmount, paymentDate],
                (err) => {
                  if (err) {
                    console.error('Error inserting into payments table: ' + err);
                    res.status(500).json({ error: 'An error occurred while processing the payment.' });
                    return;
                  }

                  // Log the form data
                  console.log('Received form data:', {
                    first_name,
                    last_name,
                    passport_number,
                    date_of_birth,
                    nationality,
                    visa_type,
                    application_status,
                    application_date,
                    document_name,
                    document_type,
                    consulate_name,
                    first_name_officer,
                    last_name_officer,
                    documentSize,
                  });

                  // Send a response to the frontend
                  res.status(200).json({
                    message: 'Application submitted successfully',
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Add more API endpoints for your specific requirements

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Close the database connection when the server is terminated
process.on('SIGINT', () => {
  connection.end();
  process.exit();
});

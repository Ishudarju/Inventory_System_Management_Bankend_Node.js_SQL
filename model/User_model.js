const db = require('../config/Database'); 

const User = {
 

    create: (username, email, hashedPassword, role, contact_number, address_details, user_id_proof, callback) => {
      const query = `INSERT INTO users (username, email, encrypted_password, role, contact_number, address_details, user_id_proof)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(query, [username, email, hashedPassword, role, contact_number, address_details, user_id_proof], callback);
    },


    // getAllStaff: (callback) => {
    //   const query = `
    //     SELECT id, username, email, role, contact_number, address_details, user_id_proof
    //     FROM users
    //     WHERE role = 'staff'
    //   `;
    //   db.query(query, callback);
    // },

    // Fetch all users without showing password
  
  //   getAllStaff: (page, limit, callback) => {
  //     const offset = (page - 1) * limit; // Calculate offset
  
  //     const query = `
  //         SELECT id, username, email, role, contact_number, address_details, user_id_proof
  //         FROM users
  //         WHERE role = 'staff'
  //         LIMIT ? OFFSET ?`; // Apply LIMIT and OFFSET
  
  //     db.query(query, [limit, offset], callback);
  // },
  
  getAllStaff: (page, limit, callback) => {
    const offset = (page - 1) * limit; // Calculate offset

    // Query to get paginated staff users
    const query = `
        SELECT id, username, email, role, contact_number, address_details, user_id_proof
        FROM users
        WHERE role = 'staff'
        LIMIT ? OFFSET ?`;

    // Query to get total count of staff users
    const countQuery = `SELECT COUNT(*) AS total FROM users WHERE role = 'staff'`;

    // Execute both queries
    db.query(countQuery, (countErr, countResults) => {
        if (countErr) {
            return callback(countErr, null);
        }

        const totalRecords = countResults[0].total;
        const totalPages = Math.ceil(totalRecords / limit); // Calculate total pages

        db.query(query, [limit, offset], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            // Return paginated data + total pages & records
            callback(null, { users: results, totalPages, totalRecords });
        });
    });
},

  
  
  
  
    getAll: (callback) => {
    const query = `SELECT id, username, email, role, contact_number, address_details, user_id_proof FROM users`;
    db.query(query, callback);
  },
  
  

  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?'; // Use parameterized query to avoid SQL injection
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('Database query error:', err); // Log any database error
      }
      callback(err, results); // Pass the results back to the callback
    });
  },

  // ✅ Check if Aadhar number already exists
  findByAadhar: (user_id_proof, callback) => {
    const query = 'SELECT * FROM users WHERE user_id_proof = ?';
    db.query(query, [user_id_proof], callback);
  },

  findByContact: (contact_number, callback) => {
    db.query('SELECT * FROM users WHERE contact_number = ?', [contact_number], callback);
  },
  
  

  findById: (id, callback) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], callback);
  },

  update: (id, username, email, role, callback) => {
    const query = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';
    db.query(query, [username, email, role, id], callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], callback);
  },

  // setResetToken: (email, token, expiry, callback) => {
  //   const query = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
  //   db.query(query, [token, expiry, email], callback);
  // },

  // updatePassword: (email, hashedPassword, callback) => {
  //   const query = 'UPDATE users SET password = ? WHERE email = ?';
  //   db.query(query, [hashedPassword, email], callback);
  // },

   // ✅ Update user details with password
   
   updateResetToken: (email, token, expiry, callback) => {
    const query = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
    db.query(query, [token, expiry, email], callback);
  }
  ,

  updatePassword: (email, hashedPassword, callback) => {
    const query = 'UPDATE users SET encrypted_password = ? WHERE email = ?';
    db.query(query, [hashedPassword, email], callback);
    // console.log()
  },
  
  updatePassword_id: (id, hashedPassword, callback) => {
    const query = 'UPDATE users SET encrypted_password = ? WHERE id = ?';
    db.query(query, [hashedPassword, id], callback);
  }
  
  
,  
  
  findByResetToken: (token, callback) => {
    const query = 'SELECT * FROM users WHERE reset_token = ?';
    db.query(query, [token], callback);
  },
  
  clearResetToken: (email, callback) => {
    const query = 'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE email = ?';
    db.query(query, [email], callback);
  },



  update: (id, username, email, hashedPassword, role, contact_number, address_details, user_id_proof, callback) => {
    const query = `UPDATE users 
                   SET username = ?, email = ?, encrypted_password = ?, role = ?, 
                       contact_number = ?, address_details = ?, user_id_proof = ? 
                   WHERE id = ?`;
    db.query(query, [username, email, hashedPassword, role, contact_number, address_details, user_id_proof, id], callback);
  },

  // // ✅ Update user details without changing password
  updateWithoutPassword: (id, username, email, role, contact_number, address_details, user_id_proof, callback) => {
    const query = `UPDATE users 
                   SET username = ?, email = ?, role = ?, 
                       contact_number = ?, address_details = ?, user_id_proof = ? 
                   WHERE id = ?`;
    db.query(query, [username, email, role, contact_number, address_details, user_id_proof, id], callback);
  },


};

module.exports = User;

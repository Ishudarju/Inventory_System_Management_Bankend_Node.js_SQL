﻿# Inventory_System_Management_Bankend_Node.js_SQL

Project Overview
The Inventory System Management backend is a secure and scalable Node.js application that provides core functionalities for managing inventory, billing, and account maintenance. This project uses SQL as the database (via XAMPP) and follows the MVC (Model-View-Controller) design pattern for code organization.

Features Inventory Management: Manage product details such as name, category, quantity, price, expiry dates, and discounts.
Billing Management: Handle sales transactions and generate billing records.
Account Maintenance: Manage users and roles (admin and staff) with secure login and access restrictions.
Authorization and Authentication:
Admin has full access.
Staff has restricted access.
JWT-based secure login.
Multi-user Support: Different access levels for admin and staff.
CRUD Operations:
Add, update, delete, and view products and other data.
Financial Reporting: Generates detailed reports for admins.
Alerts: Notifications for low-stock items (stock_alert).

Technology Stack
Backend: Node.js
Database: SQL (using XAMPP)
Authentication: JWT (JSON Web Tokens)
Database Driver: MySQL2
Libraries Used:
Express.js
bcrypt for password hashing
dotenv for environment variable management

#   P h a r m a  
 
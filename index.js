// Import required modules
const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const fs = require('fs');
const { initIntegrations } = require('./server/integrations');
require('dotenv').config();

// Initialize Express and Prisma
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001; // Use port 3001 instead of 3000

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false // For development
}));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'msc-wound-care-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'site')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize integrations with n8n and DocuSeal
initIntegrations(app, prisma);

// Provide configuration to the client-side JavaScript
app.get('/api/config', (req, res) => {
  res.json({
    n8n: {
      baseUrl: process.env.N8N_URL || 'https://primary-production-bef7.up.railway.app'
    },
    docuSeal: {
      baseUrl: process.env.DOCUSEAL_URL || 'https://docuseal-railway-production-d8fb.up.railway.app'
    }
  });
});

// API Routes
// =======================================

// Get manufacturers
app.get('/api/manufacturers', async (req, res) => {
  try {
    // Try to get from database first
    let manufacturers = [];
    try {
      manufacturers = await prisma.manufacturers.findMany({
        where: { status: 'active' },
        select: { manufacturerId: true, name: true }
      });
    } catch (dbError) {
      console.warn('Database error, using mock data:', dbError);
      // If database query fails, use mock data
      manufacturers = [
        { manufacturerId: 'mfr1', name: 'ACZ' },
        { manufacturerId: 'mfr2', name: 'AmnioBand' },
        { manufacturerId: 'mfr3', name: 'BioWerX' },
        { manufacturerId: 'mfr4', name: 'BioWound' },
        { manufacturerId: 'mfr5', name: 'HealingBiologix' },
        { manufacturerId: 'mfr6', name: 'Legacy' }
      ];
    }
    
    res.json(manufacturers);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch manufacturers' });
  }
});

// Get sales reps
app.get('/api/users', async (req, res) => {
  try {
    const role = req.query.role;
    
    // Try to get from database first
    let users = [];
    try {
      users = await prisma.users.findMany({
        where: { 
          status: 'active',
          ...(role ? { role } : {})
        },
        select: { userId: true, name: true, email: true, role: true }
      });
    } catch (dbError) {
      console.warn('Database error, using mock data:', dbError);
      // If database query fails, use mock data
      if (role === 'REP') {
        users = [
          { userId: 'rep1', name: 'John Smith', email: 'john.smith@example.com', role: 'REP' },
          { userId: 'rep2', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'REP' },
          { userId: 'rep3', name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'REP' },
          { userId: 'rep4', name: 'Alice Williams', email: 'alice.williams@example.com', role: 'REP' }
        ];
      } else {
        users = [
          { userId: 'rep1', name: 'John Smith', email: 'john.smith@example.com', role: 'REP' },
          { userId: 'rep2', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'REP' },
          { userId: 'admin1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
          { userId: 'manager1', name: 'Manager User', email: 'manager@example.com', role: 'MANAGER' }
        ];
      }
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Get practices for a rep
app.get('/api/users/:userId/practices', async (req, res) => {
  try {
    const { userId } = req.params;
    const practices = await prisma.practices.findMany({
      where: { 
        repId: userId,
        status: 'active'
      },
      select: { practiceId: true, name: true }
    });
    res.json(practices);
  } catch (error) {
    console.error('Error fetching practices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch practices' });
  }
});

// Get facilities for a practice
app.get('/api/practices/:practiceId/facilities', async (req, res) => {
  try {
    const { practiceId } = req.params;
    
    // Get facility IDs associated with the practice
    const facilityLinks = await prisma.practiceFacilities.findMany({
      where: { practiceId },
      select: { facilityId: true }
    });
    
    const facilityIds = facilityLinks.map(link => link.facilityId);
    
    // Get facility details
    const facilities = await prisma.facilities.findMany({
      where: { 
        facilityId: { in: facilityIds },
        status: 'active'
      },
      select: { 
        facilityId: true, 
        facilityName: true,
        address: true,
        city: true,
        state: true,
        zip: true
      }
    });
    
    res.json(facilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch facilities' });
  }
});

// Get physicians for a practice
app.get('/api/practices/:practiceId/physicians', async (req, res) => {
  try {
    const { practiceId } = req.params;
    const physicians = await prisma.physicians.findMany({
      where: { 
        practiceId,
        status: 'active'
      },
      select: { physicianId: true, name: true }
    });
    res.json(physicians);
  } catch (error) {
    console.error('Error fetching physicians:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch physicians' });
  }
});

// Get products for a manufacturer
app.get('/api/manufacturers/:manufacturerId/products', async (req, res) => {
  try {
    const { manufacturerId } = req.params;
    const products = await prisma.products.findMany({
      where: { 
        manufacturerId,
        status: 'active'
      },
      select: { 
        productId: true, 
        name: true 
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Get product details
app.get('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await prisma.products.findUnique({
      where: { productId },
      include: {
        productPricing: {
          where: {
            effectiveDate: { lte: new Date() },
            OR: [
              { endDate: { gte: new Date() } },
              { endDate: null }
            ]
          },
          orderBy: { effectiveDate: 'desc' },
          take: 1
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
});

// Handle Insurance Verification Request form submission
app.post('/api/submit-ivr', async (req, res) => {
  try {
    // Extract form data
    const formData = req.body;
    const files = req.files;
    
    // Generate a unique ID for the document
    const documentId = uuidv4();
    
    // Save uploaded files if present
    const fileUrls = {};
    if (files) {
      for (const [key, file] of Object.entries(files)) {
        const fileName = `${documentId}-${file.name}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Move file to uploads directory
        await file.mv(filePath);
        fileUrls[key] = fileName;
      }
    }
    
    // Create document record in database
    const document = await prisma.documents.create({
      data: {
        documentId,
        documentType: 'IVR',
        status: 'submitted',
        createdById: formData.repId || 'system', // Default to system if no rep ID
        // Link to order, practice, etc. based on form data
        ...(formData.practiceId ? { practiceId: formData.practiceId } : {}),
        // Add additional metadata as needed
      }
    });
    
    // Log submission
    console.log(`IVR form submitted with document ID: ${documentId}`);
    
    // Return success response
    res.json({
      success: true,
      message: 'Insurance verification request submitted successfully',
      documentId
    });
  } catch (error) {
    console.error('Error submitting IVR form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit insurance verification request'
    });
  }
});

// Handle Product Education form submission
app.post('/api/submit-product-education', async (req, res) => {
  try {
    // Extract form data
    const formData = req.body;
    const files = req.files;
    
    // Generate a unique ID for the document
    const documentId = uuidv4();
    
    // Save uploaded files if present
    const fileUrls = {};
    if (files) {
      for (const [key, file] of Object.entries(files)) {
        const fileName = `${documentId}-${file.name}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Move file to uploads directory
        await file.mv(filePath);
        fileUrls[key] = fileName;
      }
    }
    
    // Create document record in database
    const document = await prisma.documents.create({
      data: {
        documentId,
        documentType: 'EDUCATION',
        status: 'submitted',
        createdById: formData.repId || 'system', // Default to system if no rep ID
        // Link to order, practice, etc. based on form data
        ...(formData.practiceId ? { practiceId: formData.practiceId } : {}),
        // Add additional metadata as needed
      }
    });
    
    // Log submission
    console.log(`Product education form submitted with document ID: ${documentId}`);
    
    // Return success response
    res.json({
      success: true,
      message: 'Product education request submitted successfully',
      documentId
    });
  } catch (error) {
    console.error('Error submitting product education form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit product education request'
    });
  }
});

// Add a health check endpoint
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(3001, () => {
  console.log(`Server running on port 3001`);
});

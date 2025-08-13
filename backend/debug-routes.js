const express = require('express');
const app = express();

// Mock the routes to see what would be registered
console.log('🔍 Debugging Route Registration\n');

// Simulate the route mounting from app.js
const routes = [
  { path: '/admin', module: 'adminLogs' },
  { path: '/admin', module: 'bulkUpload' },
  { path: '/admin', module: 'adminUsers' },
  { path: '/admin', module: 'adminExport' },
  { path: '/admin/subscriptions', module: 'adminSubscriptions' },
  { path: '/admin/dashboard', module: 'adminDashboard' },
  { path: '/admin/profiles', module: 'adminProfiles' },
  { path: '/admin/education', module: 'adminEducation' },
  { path: '/admin/employment', module: 'adminEmployment' },
  { path: '/admin/family', module: 'adminFamily' }
];

console.log('Route mounting order:');
routes.forEach((route, index) => {
  console.log(`${index + 1}. ${route.path} -> ${route.module}`);
});

console.log('\n📋 Expected bulk upload routes:');
console.log('   POST /admin/bulkUpload/upload/users');
console.log('   GET  /admin/bulkUpload/upload/logs');
console.log('   POST /admin/bulkUpload/upload');

console.log('\n⚠️  Potential issues:');
console.log('1. Multiple routes mounted under /admin could cause conflicts');
console.log('2. Route order matters - later routes might override earlier ones');
console.log('3. Check if bulkUpload route is properly loaded');

console.log('\n🔧 Suggested fixes:');
console.log('1. Move bulkUpload route to a unique path');
console.log('2. Or ensure proper route ordering');
console.log('3. Add route debugging to see actual registered routes');

// Test route loading
try {
  const bulkUploadRouter = require('./routes/bulkUpload');
  console.log('\n✅ bulkUpload route module loads successfully');
  
  // Check if the routes are properly defined
  if (bulkUploadRouter.stack) {
    console.log('   Routes in bulkUpload:');
    bulkUploadRouter.stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        console.log(`   ${methods.join(',').toUpperCase()} ${layer.route.path}`);
      }
    });
  }
} catch (error) {
  console.log('\n❌ Error loading bulkUpload route:', error.message);
}

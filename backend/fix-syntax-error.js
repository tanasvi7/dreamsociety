const fs = require('fs');
const path = require('path');

// Path to the authController.js file
const authControllerPath = path.join(__dirname, 'controllers', 'authController.js');

console.log('🔍 Checking for syntax errors in authController.js...');

try {
  // Read the file content
  const content = fs.readFileSync(authControllerPath, 'utf8');
  
  // Look for the problematic pattern
  const problematicPattern = /console\.log\('📧 Email database query result:', existingEmail \? FOUND - User ID: \$\{existingEmail\.id\}` : 'NOT `FOUND - Email is available'\);/;
  
  if (problematicPattern.test(content)) {
    console.log('❌ Found problematic syntax error!');
    console.log('The line has malformed template literals.');
    
    // Fix the problematic line
    const fixedContent = content.replace(
      /console\.log\('📧 Email database query result:', existingEmail \? FOUND - User ID: \$\{existingEmail\.id\}` : 'NOT `FOUND - Email is available'\);/g,
      "console.log('📧 Email database query result:', existingEmail ? `FOUND - User ID: ${existingEmail.id}` : 'NOT FOUND - Email is available');"
    );
    
    // Write the fixed content back
    fs.writeFileSync(authControllerPath, fixedContent, 'utf8');
    console.log('✅ Fixed the syntax error!');
    console.log('🔄 Please restart your backend server now.');
  } else {
    console.log('✅ No syntax errors found in the current file.');
    console.log('📝 The server might be running an older version of the file.');
    console.log('🔄 Please restart your backend server to load the latest changes.');
  }
  
} catch (error) {
  console.error('❌ Error reading or fixing the file:', error.message);
}

console.log('\n📋 Next steps:');
console.log('1. Restart your backend server');
console.log('2. Check if the syntax error is resolved');
console.log('3. Test the login functionality');

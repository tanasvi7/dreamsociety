const crypto = require('crypto');

console.log('🔐 Generating secure JWT secret...');

// Generate a 64-character random string
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('\n✅ Generated JWT Secret:');
console.log('='.repeat(50));
console.log(jwtSecret);
console.log('='.repeat(50));

console.log('\n📝 Add this to your .env file:');
console.log(`JWT_SECRET=${jwtSecret}`);

console.log('\n⚠️  Important Security Notes:');
console.log('1. Keep this secret secure and never share it');
console.log('2. Use different secrets for development and production');
console.log('3. Store this in your .env file (never commit to version control)');
console.log('4. Consider rotating this secret periodically');

console.log('\n🔒 Secret Strength:');
console.log(`- Length: ${jwtSecret.length} characters`);
console.log(`- Entropy: ${jwtSecret.length * 4} bits`);
console.log('- Status: ✅ Strong (recommended minimum: 32 characters)');

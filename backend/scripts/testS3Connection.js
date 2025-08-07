require('dotenv').config();
const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');

async function testS3Connection() {
  console.log('🔍 Testing S3 Connection...');
  console.log('==========================');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log('AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
  console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || 'NOT SET');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
  
  // Create S3 client
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'unitynest';
  
  try {
    console.log('\n🔍 Testing bucket access...');
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    console.log('✅ Successfully connected to S3 bucket:', bucketName);
    console.log('✅ Your AWS credentials and permissions are working correctly!');
  } catch (error) {
    console.log('❌ Failed to connect to S3 bucket');
    console.error('Error details:', {
      name: error.name,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      message: error.message
    });
    
    // Provide specific guidance based on error type
    if (error.name === 'AccessDenied') {
      console.log('\n🔧 Access Denied - IAM Permission Issues:');
      console.log('1. Check if your IAM user has S3 permissions');
      console.log('2. Verify the bucket name is correct');
      console.log('3. Ensure the bucket exists in the specified region');
      console.log('4. Run the fix script: node scripts/fixS3Permissions.js');
    } else if (error.name === 'NoSuchBucket') {
      console.log('\n🔧 Bucket Not Found:');
      console.log('1. Check if the bucket name is correct');
      console.log('2. Verify the bucket exists in the specified region');
      console.log('3. Create the bucket if it doesn\'t exist');
    } else if (error.name === 'InvalidAccessKeyId') {
      console.log('\n🔧 Invalid Access Key:');
      console.log('1. Check your AWS_ACCESS_KEY_ID in .env file');
      console.log('2. Verify the access key is correct and active');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('\n🔧 Invalid Secret Key:');
      console.log('1. Check your AWS_SECRET_ACCESS_KEY in .env file');
      console.log('2. Verify the secret key is correct');
    } else {
      console.log('\n🔧 Unknown Error:');
      console.log('1. Check your network connection');
      console.log('2. Verify AWS region is correct');
      console.log('3. Try running: node scripts/fixS3Permissions.js');
    }
  }
}

// Run the test
if (require.main === module) {
  testS3Connection().catch(console.error);
}

module.exports = { testS3Connection }; 
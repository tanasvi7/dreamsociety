const AWS = require('aws-sdk');
const { S3Client, PutBucketCorsCommand, PutBucketPolicyCommand, HeadBucketCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

// Configuration
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'unitynest';
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';

// Create S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  
  const requiredVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME'
  ];
  
  const missing = [];
  const present = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  }
  
  console.log('✅ Present variables:', present);
  if (missing.length > 0) {
    console.log('❌ Missing variables:', missing);
    console.log('\n📝 Please add these to your .env file:');
    missing.forEach(varName => {
      console.log(`${varName}=your_value_here`);
    });
    return false;
  }
  
  console.log('✅ All environment variables are set');
  return true;
}

async function testAWSCredentials() {
  console.log('\n🔍 Testing AWS credentials...');
  
  try {
    // Test basic S3 access
    const headCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
    await s3Client.send(headCommand);
    console.log('✅ AWS credentials are valid and bucket access confirmed');
    return true;
  } catch (error) {
    console.log('❌ AWS credentials test failed');
    console.error('Error details:', {
      name: error.name,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      message: error.message
    });
    
    if (error.name === 'AccessDenied') {
      console.log('\n🔧 IAM Permission Issues Detected:');
      console.log('1. Check if your IAM user has the required S3 permissions');
      console.log('2. Ensure the bucket name is correct');
      console.log('3. Verify the bucket exists in the specified region');
    }
    
    return false;
  }
}

async function configureCORS() {
  console.log('\n🔧 Configuring CORS...');
  
  try {
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'], // In production, specify your domain
          ExposeHeaders: ['ETag', 'Content-Length'],
          MaxAgeSeconds: 3000
        }
      ]
    };

    const corsCommand = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    });
    
    await s3Client.send(corsCommand);
    console.log('✅ CORS configuration set successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to configure CORS');
    console.error('Error:', error.message);
    return false;
  }
}

async function configureBucketPolicy() {
  console.log('\n🔧 Configuring bucket policy...');
  
  try {
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
        }
      ]
    };

    const policyCommand = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    });
    
    await s3Client.send(policyCommand);
    console.log('✅ Bucket policy set successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to configure bucket policy');
    console.error('Error:', error.message);
    return false;
  }
}

async function testPresignedUrlGeneration() {
  console.log('\n🔍 Testing presigned URL generation...');
  
  try {
    // Test with a dummy key
    const testKey = 'test-file.txt';
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('✅ Presigned URL generation works');
    console.log('📝 Test URL generated (will fail to access but proves generation works)');
    return true;
  } catch (error) {
    console.log('❌ Presigned URL generation failed');
    console.error('Error:', error.message);
    return false;
  }
}

async function generateIAMPolicy() {
  console.log('\n📋 Required IAM Policy:');
  console.log('Copy this policy to your IAM user:');
  
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'S3BucketAccess',
        Effect: 'Allow',
        Action: [
          's3:GetBucketLocation',
          's3:GetBucketPolicy',
          's3:PutBucketPolicy',
          's3:GetBucketCors',
          's3:PutBucketCors',
          's3:ListBucket'
        ],
        Resource: `arn:aws:s3:::${BUCKET_NAME}`
      },
      {
        Sid: 'S3ObjectAccess',
        Effect: 'Allow',
        Action: [
          's3:PutObject',
          's3:PutObjectAcl',
          's3:GetObject',
          's3:GetObjectAcl',
          's3:DeleteObject',
          's3:HeadObject'
        ],
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
      }
    ]
  };
  
  console.log(JSON.stringify(policy, null, 2));
}

async function main() {
  console.log('🚀 S3 Permissions Fix Script');
  console.log('============================');
  
  // Step 1: Check environment variables
  const envOk = await checkEnvironmentVariables();
  if (!envOk) {
    console.log('\n❌ Please fix environment variables and run again');
    return;
  }
  
  // Step 2: Test AWS credentials
  const credentialsOk = await testAWSCredentials();
  if (!credentialsOk) {
    console.log('\n❌ AWS credentials test failed');
    await generateIAMPolicy();
    return;
  }
  
  // Step 3: Configure CORS
  await configureCORS();
  
  // Step 4: Configure bucket policy
  await configureBucketPolicy();
  
  // Step 5: Test presigned URL generation
  await testPresignedUrlGeneration();
  
  console.log('\n✅ S3 configuration completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Restart your backend server');
  console.log('2. Test profile photo upload and retrieval');
  console.log('3. Check browser console for any remaining errors');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 
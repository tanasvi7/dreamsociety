const AWS = require('aws-sdk');
const { S3Client, PutBucketPolicyCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

// Configure AWS
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'unitynest';

async function configureS3Bucket() {
  try {
    console.log('Configuring S3 bucket for public read access...');
    console.log('Bucket name:', BUCKET_NAME);
    console.log('Region:', process.env.AWS_REGION || 'us-east-1');

    // 1. Configure CORS for web access
    const corsParams = {
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'], // In production, specify your domain
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000
          }
        ]
      }
    };

    console.log('Setting CORS configuration...');
    await s3Client.send(new PutBucketCorsCommand(corsParams));
    console.log('✅ CORS configuration set successfully');

    // 2. Configure bucket policy for public read access
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

    const policyParams = {
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    };

    console.log('Setting bucket policy for public read access...');
    await s3Client.send(new PutBucketPolicyCommand(policyParams));
    console.log('✅ Bucket policy set successfully');

    console.log('\n🎉 S3 bucket configured successfully!');
    console.log('Your profile photos will now be accessible via direct URLs.');
    console.log(`Example URL format: https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/profile-photos/user-123/photo.jpg`);

  } catch (error) {
    console.error('❌ Error configuring S3 bucket:', error);
    console.error('Error details:', {
      name: error.name,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      message: error.message
    });
    
    if (error.name === 'AccessDenied') {
      console.error('\n🔧 Access Denied Error:');
      console.error('Your IAM user needs the following permissions:');
      console.error('- s3:PutBucketPolicy');
      console.error('- s3:PutBucketCors');
      console.error('- s3:GetBucketPolicy');
      console.error('- s3:GetBucketCors');
    }
    
    process.exit(1);
  }
}

// Run the configuration
if (require.main === module) {
  configureS3Bucket();
}

module.exports = { configureS3Bucket }; 
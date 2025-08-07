# S3 UnknownError Troubleshooting Guide

## Problem
You're getting an "UnknownError" when testing bucket access, which indicates a fundamental connectivity or configuration issue.

## Step-by-Step Troubleshooting

### Step 1: Check Environment Variables

First, run the environment variable checker:

```bash
cd backend
node test-env-file.js
```

**Common Issues:**
- Missing `.env` file
- Empty or missing AWS credentials
- Quotes around values in `.env` file
- Trailing spaces in `.env` file

**Correct .env format:**
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=unitynest
```

**❌ Wrong format (with quotes):**
```env
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

### Step 2: Check AWS Credentials

Run the credentials checker:

```bash
node check-aws-credentials.js
```

This will test:
- Environment variable loading
- AWS SDK import
- S3 client creation
- Network connectivity to AWS

### Step 3: Verify AWS Credentials

1. **Check IAM User**: Go to AWS Console → IAM → Users
2. **Verify Access Keys**: Check if your access keys are active
3. **Check Permissions**: Ensure the user has S3 permissions

### Step 4: Test Network Connectivity

**Test basic internet connectivity:**
```bash
ping google.com
```

**Test AWS endpoint connectivity:**
```bash
ping s3.us-east-2.amazonaws.com
```

**Test with curl (if available):**
```bash
curl -I https://s3.us-east-2.amazonaws.com
```

### Step 5: Check Firewall/Proxy Settings

**Common issues:**
- Corporate firewall blocking AWS endpoints
- VPN interfering with AWS connectivity
- Antivirus software blocking connections
- Windows Firewall blocking Node.js

**Solutions:**
1. **Disable VPN temporarily** to test
2. **Check Windows Firewall** settings
3. **Add Node.js to antivirus exclusions**
4. **Configure proxy settings** if using corporate network

### Step 6: Test with AWS CLI

If you have AWS CLI installed:

```bash
# Configure AWS CLI
aws configure

# Test bucket access
aws s3 ls s3://unitynest

# Test with specific credentials
aws s3 ls s3://unitynest --profile your-profile
```

### Step 7: Alternative Region Test

Try testing with a different region:

```bash
# Temporarily change region in .env
AWS_REGION=us-east-1
```

### Step 8: Check Node.js and Dependencies

**Verify Node.js version:**
```bash
node --version
```

**Reinstall dependencies:**
```bash
npm install
```

**Check for conflicting packages:**
```bash
npm ls @aws-sdk/client-s3
```

### Step 9: Test with Minimal Code

Create a simple test file `test-minimal.js`:

```javascript
require('dotenv').config();
const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');

async function test() {
  try {
    console.log('Testing minimal S3 connection...');
    
    const client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    const result = await client.send(new HeadBucketCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'unitynest'
    }));
    
    console.log('✅ Success!');
  } catch (error) {
    console.error('❌ Error:', error.name, error.message);
  }
}

test();
```

Run it:
```bash
node test-minimal.js
```

## Common Solutions

### Solution 1: Fix .env File
If the `.env` file is missing or malformed, create it correctly.

### Solution 2: Update IAM Permissions
Ensure your IAM user has the required S3 permissions.

### Solution 3: Network Configuration
- Disable VPN temporarily
- Configure firewall exceptions
- Check proxy settings

### Solution 4: Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Solution 5: Use Different AWS SDK Version
```bash
npm uninstall @aws-sdk/client-s3
npm install @aws-sdk/client-s3@latest
```

## When to Contact Support

Contact AWS support if:
- All troubleshooting steps fail
- You can access the bucket via AWS Console but not programmatically
- You're getting consistent network timeouts
- The issue persists across different environments

## Next Steps

After fixing the connectivity issue:

1. Run the credentials check: `node check-aws-credentials.js`
2. Run the S3 fix script: `node fix-s3-access.js`
3. Test profile photo functionality
4. Monitor logs for any remaining errors

## Emergency Workaround

If you need a temporary solution while fixing AWS issues, you can:

1. Store profile photos locally temporarily
2. Use a different cloud storage service
3. Implement a fallback mechanism

Remember: The "UnknownError" usually indicates a network or configuration issue, not an AWS service problem. 
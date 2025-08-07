const AWS = require('aws-sdk');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const crypto = require('crypto');

// Validate and set AWS region
const getValidRegion = () => {
  const region = process.env.AWS_REGION;
  if (!region) {
    console.warn('AWS_REGION not set, using default: us-east-1');
    return 'us-east-1';
  }
  
  // List of valid AWS regions
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'af-south-1', 'ap-east-1', 'ap-south-1', 'ap-northeast-1',
    'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2',
    'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
    'eu-west-3', 'eu-north-1', 'eu-south-1', 'me-south-1',
    'sa-east-1'
  ];
  
  if (!validRegions.includes(region)) {
    console.warn(`Invalid AWS region: ${region}, using default: us-east-1`);
    return 'us-east-1';
  }
  
  return region;
};

const awsRegion = getValidRegion();

// Configure AWS
const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'unitynest';

// Log S3 configuration for debugging
console.log('S3 Configuration:', {
  region: awsRegion,
  bucketName: BUCKET_NAME,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
});

class S3Service {
  constructor() {
    this.bucketName = BUCKET_NAME;
    this.s3Client = s3Client;
    this.region = awsRegion;
  }

  /**
   * Generate a unique filename for the uploaded image
   * @param {string} originalName - Original filename
   * @param {number} userId - User ID
   * @returns {string} - Unique filename
   */
  generateUniqueFileName(originalName, userId) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    return `profile-photos/user-${userId}/${timestamp}-${randomString}${extension}`;
  }

  /**
   * Check if an object exists in S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} - Whether object exists
   */
  async objectExists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`Object does not exist: ${key}`);
        return false;
      }
      // Don't log 403 errors as they're expected when permissions are limited
      if (error.$metadata?.httpStatusCode !== 403) {
        console.error('Error checking if object exists:', error);
        console.error('Error details:', {
          name: error.name,
          code: error.Code,
          statusCode: error.$metadata?.httpStatusCode,
          message: error.message,
          key: key
        });
      }
      // Return false for any error to avoid breaking the flow
      return false;
    }
  }

  /**
   * Upload a profile photo to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {number} userId - User ID
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} - Upload result with URL
   */
  async uploadProfilePhoto(fileBuffer, originalName, userId, mimeType) {
    try {
      const fileName = this.generateUniqueFileName(originalName, userId);
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          'user-id': userId.toString(),
          'upload-date': new Date().toISOString(),
          'original-name': originalName
        }
      };

      console.log('Uploading to S3:', {
        bucket: this.bucketName,
        key: fileName,
        size: fileBuffer.length,
        contentType: mimeType
      });

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      // Generate direct public URL
      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
      
      console.log('Upload successful:', publicUrl);
      
      return {
        success: true,
        photoUrl: publicUrl,
        fileName,
        message: 'Profile photo uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      console.error('Upload error details:', {
        name: error.name,
        code: error.Code,
        statusCode: error.$metadata?.httpStatusCode,
        message: error.message
      });
      throw new Error(`Failed to upload profile photo: ${error.message}`);
    }
  }

  /**
   * Delete a profile photo from S3
   * @param {string} photoUrl - S3 key, full S3 URL, or presigned URL
   * @returns {Promise<Object>} - Delete result
   */
  async deleteProfilePhoto(photoUrl) {
    try {
      let key;
      
      if (photoUrl.includes('amazonaws.com/')) {
        // Direct S3 URL
        const urlParts = photoUrl.split('.amazonaws.com/');
        key = urlParts[1];
      } else if (photoUrl.includes('?X-Amz-')) {
        // Presigned URL - extract key
        const urlParts = photoUrl.split('?')[0];
        const keyParts = urlParts.split('/');
        key = keyParts.slice(3).join('/'); // Remove protocol, bucket, and region
      } else if (photoUrl.includes('profile-photos/')) {
        // S3 key (stored in database)
        key = photoUrl;
      } else {
        return { success: false, message: 'Invalid photo URL format' };
      }

      console.log('Deleting from S3:', { bucket: this.bucketName, key });

      const deleteParams = {
        Bucket: this.bucketName,
        Key: key
      };

      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);

      return {
        success: true,
        message: 'Profile photo deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting from S3:', error);
      console.error('Delete error details:', {
        name: error.name,
        code: error.Code,
        statusCode: error.$metadata?.httpStatusCode,
        message: error.message
      });
      
      // Check if it's an access denied error
      if (error.name === 'AccessDenied' || error.Code === 'AccessDenied') {
        console.warn('Access denied when deleting from S3. This might be due to IAM permissions. Continuing without deletion.');
        return {
          success: true, // Changed to true to prevent app crashes
          message: 'Photo upload successful, but old photo could not be deleted due to permissions. Please contact administrator.',
          warning: 'Old photo deletion failed due to IAM permissions'
        };
      }
      
      throw new Error(`Failed to delete profile photo: ${error.message}`);
    }
  }

  /**
   * Update profile photo (delete old and upload new)
   * @param {Buffer} fileBuffer - New file buffer
   * @param {string} originalName - Original filename
   * @param {number} userId - User ID
   * @param {string} mimeType - File MIME type
   * @param {string} oldPhotoUrl - Old photo URL to delete
   * @returns {Promise<Object>} - Update result
   */
  async updateProfilePhoto(fileBuffer, originalName, userId, mimeType, oldPhotoUrl) {
    try {
      // Delete old photo if it exists
      if (oldPhotoUrl) {
        // Handle both presigned URLs and direct S3 URLs
        if (oldPhotoUrl.includes('amazonaws.com/')) {
          await this.deleteProfilePhoto(oldPhotoUrl);
        } else if (oldPhotoUrl.includes('?X-Amz-')) {
          // Extract key from presigned URL
          const urlParts = oldPhotoUrl.split('?')[0];
          const keyParts = urlParts.split('/');
          const key = keyParts.slice(3).join('/'); // Remove protocol, bucket, and region
          await this.deleteProfilePhoto(`https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`);
        }
      }

      // Upload new photo
      const uploadResult = await this.uploadProfilePhoto(fileBuffer, originalName, userId, mimeType);
      
      return {
        success: true,
        photoUrl: uploadResult.photoUrl,
        fileName: uploadResult.fileName,
        message: 'Profile photo updated successfully'
      };
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw new Error(`Failed to update profile photo: ${error.message}`);
    }
  }

  /**
   * Validate file type and size
   * @param {Object} file - File object
   * @returns {Object} - Validation result
   */
  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File size too large. Maximum size is 5MB.'
      };
    }

    return {
      valid: true,
      message: 'File validation passed'
    };
  }
}

module.exports = new S3Service(); 
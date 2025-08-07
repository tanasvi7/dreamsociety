const { Profile } = require('../models');
const s3Service = require('../services/s3Service');

/**
 * Script to fix profile photo URLs that are stored as presigned URLs instead of S3 keys
 */
async function fixProfilePhotoUrls() {
  try {
    console.log('Starting profile photo URL fix...');
    
    // Get all profiles with photo_url
    const profiles = await Profile.findAll({
      where: {
        photo_url: {
          [require('sequelize').Op.not]: null
        }
      }
    });

    console.log(`Found ${profiles.length} profiles with photo URLs`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      try {
        const currentUrl = profile.photo_url;
        
        // Check if it's already a presigned URL
        if (currentUrl.includes('?X-Amz-')) {
          console.log(`Fixing profile ${profile.id}: ${currentUrl.substring(0, 50)}...`);
          
          // Extract the S3 key from the presigned URL
          const urlWithoutParams = currentUrl.split('?')[0];
          const urlParts = urlWithoutParams.split('/');
          
          // Find the index after the bucket name
          const bucketIndex = urlParts.findIndex(part => part.includes('s3'));
          let key;
          
          if (bucketIndex !== -1) {
            key = urlParts.slice(bucketIndex + 1).join('/');
          } else {
            // Fallback: try to extract from the end
            key = urlParts.slice(-2).join('/'); // profile-photos/user-16/filename.jpg
          }
          
          // Clean the key - remove any URL encoding
          key = decodeURIComponent(key);
          
          // Verify the key exists in S3
          try {
            // Try to generate a new presigned URL to verify the key is valid
            await s3Service.generatePresignedUrl(key, 3600);
            
            // Update the database with the clean S3 key
            profile.photo_url = key;
            await profile.save();
            
            console.log(`✅ Fixed profile ${profile.id}: ${key}`);
            fixedCount++;
          } catch (s3Error) {
            console.log(`❌ S3 key not found for profile ${profile.id}: ${key}`);
            // Remove the invalid URL
            profile.photo_url = null;
            await profile.save();
            errorCount++;
          }
        } else if (currentUrl.includes('amazonaws.com/') && !currentUrl.includes('?X-Amz-')) {
          // Direct S3 URL - extract key
          console.log(`Fixing direct S3 URL for profile ${profile.id}`);
          const urlParts = currentUrl.split('.amazonaws.com/');
          const key = urlParts[1];
          
          // Update the database with the S3 key
          profile.photo_url = key;
          await profile.save();
          
          console.log(`✅ Fixed profile ${profile.id}: ${key}`);
          fixedCount++;
        } else if (currentUrl.includes('profile-photos/')) {
          // Already correct format
          console.log(`✅ Profile ${profile.id} already has correct format: ${currentUrl}`);
        } else {
          console.log(`❌ Unknown URL format for profile ${profile.id}: ${currentUrl}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing profile ${profile.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Fix Summary ===');
    console.log(`Total profiles processed: ${profiles.length}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Profile photo URL fix completed!');

  } catch (error) {
    console.error('Error in fixProfilePhotoUrls:', error);
  }
}

// Run the script if called directly
if (require.main === module) {
  fixProfilePhotoUrls()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixProfilePhotoUrls }; 
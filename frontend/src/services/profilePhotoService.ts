import api from './apiService';

export interface ProfilePhotoResponse {
  success: boolean;
  message: string;
  data: {
    photoUrl: string;
    fileName?: string;
    profile?: any;
    hasPhoto?: boolean;
  };
}

export interface UploadProgressCallback {
  (progress: number): void;
}

class ProfilePhotoService {
  /**
   * Upload a new profile photo
   * @param file - The image file to upload
   * @param onProgress - Optional progress callback
   * @returns Promise with upload result
   */
  async uploadProfilePhoto(file: File, onProgress?: UploadProgressCallback): Promise<ProfilePhotoResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/profile-photo/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  /**
   * Update an existing profile photo
   * @param file - The new image file
   * @param onProgress - Optional progress callback
   * @returns Promise with update result
   */
  async updateProfilePhoto(file: File, onProgress?: UploadProgressCallback): Promise<ProfilePhotoResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.put('/profile-photo/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  /**
   * Delete profile photo
   * @returns Promise with delete result
   */
  async deleteProfilePhoto(): Promise<ProfilePhotoResponse> {
    const response = await api.delete('/profile-photo/delete');
    return response.data;
  }

  /**
   * Get profile photo
   * @returns Promise with profile photo data
   */
  async getProfilePhoto(): Promise<ProfilePhotoResponse> {
    const response = await api.get('/profile-photo');
    return response.data;
  }

  /**
   * Validate file type and size
   * @param file - The file to validate
   * @returns Validation result
   */
  validateFile(file: File): { valid: boolean; message: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
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

  /**
   * Convert file to base64 for preview
   * @param file - The file to convert
   * @returns Promise with base64 string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image before upload (optional optimization)
   * @param file - The file to resize
   * @param maxWidth - Maximum width
   * @param maxHeight - Maximum height
   * @param quality - Image quality (0-1)
   * @returns Promise with resized file
   */
  async resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

export default new ProfilePhotoService(); 
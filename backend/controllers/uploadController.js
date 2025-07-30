import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a properly configured Supabase client for storage operations
const createSupabaseStorageClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export const removeProfilePicture = async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const currentUser = await User.findById(req.user.student_id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete from Supabase storage
    if (currentUser.profile_picture_filename) {
      try {
        const supabaseClient = createSupabaseStorageClient();
        await supabaseClient.storage
          .from('profile-pictures')
          .remove([currentUser.profile_picture_filename]);
        console.log('✅ Profile picture deleted from storage');
      } catch (deleteErr) {
        console.warn('⚠️ Storage deletion warning:', deleteErr.message);
      }
    }

    // Update database
    const updatedUser = await User.removeProfilePicture(req.user.student_id);

    res.json({
      message: 'Profile picture removed successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Error removing profile picture:', error);
    res.status(500).json({ 
      error: 'Failed to remove profile picture: ' + error.message 
    });
  }
};

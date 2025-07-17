import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, TagIcon, AcademicCapIcon, MagnifyingGlassIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

const UploadPaperModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    course_id: '',
    level: '',
    term: '',
    year: '',
    question_no: '',
    text: '',
    file: null,
    tags: ''
  });
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch courses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // Filter courses based on search
  useEffect(() => {
    if (courseSearch) {
      const filtered = courses.filter(course => 
        course.course_code?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.course_title?.toLowerCase().includes(courseSearch.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [courseSearch, courses]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data || []);
      setFilteredCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type (allow PDF, DOC, DOCX, images)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, DOCX, or image file');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

    const uploadFileToSupabase = async (file) => {
    try {
      if (!file) throw new Error('No file selected');
      
      setUploadProgress(10);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `papers/${fileName}`;
      
      setUploadProgress(30);
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('papers') // Make sure this bucket exists in your Supabase project
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      setUploadProgress(80);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('papers')
        .getPublicUrl(filePath);
      
      setUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
      throw error;
    }
  };

  const handleCourseSearch = (e) => {
    const value = e.target.value;
    setCourseSearch(value);
    setShowCourseDropdown(true);
    
    if (!value) {
      setSelectedCourse(null);
      setFormData(prev => ({ ...prev, course_id: '' }));
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCourseSearch(`${course.course_code} - ${course.course_title}`);
    setFormData(prev => ({ ...prev, course_id: course.course_id }));
    setShowCourseDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to upload papers');
      return;
    }

    // Validate required fields
    if (!formData.course_id || !formData.level || !formData.term || !formData.year || !formData.question_no) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = null;
      
      // Upload file to Supabase if a file is selected
      if (formData.file) {
        fileUrl = await uploadFileToSupabase(formData.file);
      }
      
      // Calculate semester_id using the formula: (level - 1) * 2 + term
      const semester_id = (parseInt(formData.level) - 1) * 2 + parseInt(formData.term);
      
      // Create the question and post
      const questionData = {
        question_no: parseInt(formData.question_no),
        question_text: '', // Empty by default as specified
        course_id: parseInt(formData.course_id),
        semester_id: semester_id,
        year: parseInt(formData.year),
        uploaded_by: user.student_id
      };

      // Generate title using the selected course and question number
      const title = `${selectedCourse.course_code} - ${selectedCourse.course_title} - Question ${formData.question_no}`;
      
      const postData = {
        title: title,
        content: formData.text || '',
        preview_text: formData.text ? formData.text.substring(0, 200) + '...' : '',
        department_id: null, // Set to NULL as specified
        file_url: fileUrl,
        tags: formData.tags || '',
        questionData: questionData
      };

      const response = await api.post('/posts/upload-paper', postData);
      
      if (response.data.success) {
        toast.success('Paper uploaded successfully!');
        onClose();
        // Reset form
        setFormData({
          course_id: '',
          level: '',
          term: '',
          year: '',
          question_no: '',
          text: '',
          file: null,
          tags: ''
        });
        setSelectedCourse(null);
        setCourseSearch('');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading paper:', error);
      toast.error(error.response?.data?.message || 'Failed to upload paper');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <DocumentArrowUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Paper</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share your academic resources with the community</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form Container with Scroll */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Course Search Dropdown */}
            <div className="relative">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course *
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={handleCourseSearch}
                  onFocus={() => setShowCourseDropdown(true)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search for a course..."
                />
                {showCourseDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map(course => (
                        <button
                          key={course.course_id}
                          type="button"
                          onClick={() => handleCourseSelect(course)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium">{course.course_code} - {course.course_title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{course.department_name}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No courses found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Level and Term */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level *
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Level</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                </select>
              </div>
              <div>
                <label htmlFor="term" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Term *
                </label>
                <select
                  id="term"
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Term</option>
                  <option value="1">Term 1</option>
                  <option value="2">Term 2</option>
                </select>
              </div>
            </div>

            {/* Year and Question No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="2000"
                  max="2030"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2024"
                />
              </div>
              <div>
                <label htmlFor="question_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question No *
                </label>
                <input
                  type="number"
                  id="question_no"
                  name="question_no"
                  value={formData.question_no}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Text */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text (Optional)
              </label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Additional information or instructions about the question..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  <span>
                    {formData.file ? formData.file.name : 'Click to upload file (PDF, DOC, DOCX, or Image)'}
                  </span>
                </label>
                {formData.file && (
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{(formData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {isUploading && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="midterm, quiz, final-exam (comma separated)"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !formData.course_id || !formData.level || !formData.term || !formData.year || !formData.question_no}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isUploading ? 'Uploading File...' : 'Uploading...'}</span>
                  </>
                ) : (
                  <>
                    <DocumentArrowUpIcon className="h-5 w-5" />
                    <span>Upload Paper</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPaperModal;
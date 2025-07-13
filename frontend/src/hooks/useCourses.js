import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export const useCourses = (autoRefreshInterval = 30000) => { // Auto-refresh every 30 seconds
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  // Fetch all courses
  const fetchCourses = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (!silent) toast.error('Failed to fetch courses');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Fetch user's enrollments
  const fetchEnrollments = useCallback(async (silent = false) => {
    try {
      const response = await api.get('/courses/my-enrollments');
      setEnrollments(response.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      if (!silent) toast.error('Failed to fetch enrollments');
    }
  }, []);

  // Fetch departments
  const fetchDepartments = useCallback(async (silent = false) => {
    try {
      const response = await api.get('/posts/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      if (!silent) toast.error('Failed to fetch departments');
    }
  }, []);

  // Enroll in a course with optimistic updates
  const enrollInCourse = async (courseId) => {
    // Find the course to get details for optimistic update
    const course = courses.find(c => c.course_id === courseId);
    if (!course) {
      toast.error('Course not found');
      return false;
    }

    // Optimistic update - immediately add to enrollments
    const optimisticEnrollment = {
      enrollment_id: `temp-${Date.now()}`, // Temporary ID
      course_id: courseId,
      course_code: course.course_code,
      course_title: course.course_title,
      department_id: course.department_id,
      department_name: course.department_name,
      department_icon: course.department_icon,
      enrolled_at: new Date().toISOString(),
      is_currently_enrolled: true
    };

    // Immediately update UI
    setEnrollments(prev => [...prev, optimisticEnrollment]);

    try {
      setEnrollmentLoading(true);
      const response = await api.post('/courses/enroll', { course_id: courseId });
      
      // Refresh to get the real enrollment ID from server (silent refresh)
      await fetchEnrollments(true);
      toast.success('Successfully enrolled in course!');
      return true;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      // Rollback optimistic update on error
      setEnrollments(prev => prev.filter(e => e.enrollment_id !== optimisticEnrollment.enrollment_id));
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
      return false;
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Drop a course with optimistic updates
  const dropCourse = async (enrollmentId) => {
    // Find the enrollment to remove for rollback purposes
    const enrollmentToRemove = enrollments.find(e => e.enrollment_id === enrollmentId);
    if (!enrollmentToRemove) {
      toast.error('Enrollment not found');
      return false;
    }

    // Optimistic update - immediately remove from enrollments
    setEnrollments(prev => prev.filter(e => e.enrollment_id !== enrollmentId));

    try {
      setEnrollmentLoading(true);
      await api.delete(`/courses/enroll/${enrollmentId}`);
      toast.success('Successfully dropped course!');
      // No need to fetch again as we already updated optimistically
      return true;
    } catch (error) {
      console.error('Error dropping course:', error);
      // Rollback optimistic update on error
      setEnrollments(prev => [...prev, enrollmentToRemove]);
      toast.error(error.response?.data?.message || 'Failed to drop course');
      return false;
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Get courses by department
  const getCoursesByDepartment = (departmentId) => {
    return courses.filter(course => course.department_id === departmentId);
  };

  // Check if user is enrolled in a course
  const isEnrolledInCourse = (courseId) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  // Get enrollment for a specific course
  const getEnrollmentForCourse = (courseId) => {
    return enrollments.find(enrollment => enrollment.course_id === courseId);
  };

  // Manual refresh function
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchCourses(true),
      fetchEnrollments(true),
      fetchDepartments(true)
    ]);
  }, [fetchCourses, fetchEnrollments, fetchDepartments]);

  // Start auto-refresh
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (autoRefreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchEnrollments(true); // Silent refresh of enrollments
      }, autoRefreshInterval);
    }
  }, [autoRefreshInterval, fetchEnrollments]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    fetchDepartments();
    startAutoRefresh();

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, [fetchCourses, fetchEnrollments, fetchDepartments, startAutoRefresh, stopAutoRefresh]);

  // Visibility change handler for smart refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh when tab becomes visible again
        refreshAll();
        startAutoRefresh();
      } else {
        // Stop auto-refresh when tab is hidden
        stopAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshAll, startAutoRefresh, stopAutoRefresh]);

  return {
    courses,
    enrollments,
    departments,
    loading,
    enrollmentLoading,
    lastRefresh,
    enrollInCourse,
    dropCourse,
    getCoursesByDepartment,
    isEnrolledInCourse,
    getEnrollmentForCourse,
    refreshAll,
    startAutoRefresh,
    stopAutoRefresh,
    refetch: refreshAll // Alias for backward compatibility
  };
};

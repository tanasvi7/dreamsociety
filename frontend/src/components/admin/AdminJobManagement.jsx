import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Trash2, Loader2, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet, apiDelete, apiPost, apiPut } from '../../services/apiService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import CustomAlert from '../common/CustomAlert';
import useCustomAlert from '../../hooks/useCustomAlert';

// Validation schema for job form
const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  skills_required: z.string().min(1, 'Skills required is required'),
  job_type: z.enum(['full-time', 'part-time', 'contract']),
  salary_range: z.string().optional(),
  location: z.string().optional(),
});

const AdminJobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const { user } = useAuth();
    const { alertState, showConfirm, closeAlert } = useCustomAlert();

    const form = useForm({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: '',
            description: '',
            skills_required: '',
            job_type: 'full-time',
            salary_range: '',
            location: '',
        }
    });

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const response = await apiGet('/jobs');
                // Handle both array and object response formats
                const jobsData = Array.isArray(response.data)
                  ? response.data
                  : Array.isArray(response.data.jobs)
                    ? response.data.jobs
                    : [];
                setJobs(jobsData);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
                setJobs([]); // Set to empty array on error
            }
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const handleView = (job) => {
        setSelectedJob(job);
        setViewModalOpen(true);
    };

    const handleEdit = (job) => {
        setSelectedJob(job);
        
        // Set form values
        form.reset({
            title: job.title || '',
            description: job.description || '',
            skills_required: job.skills_required || '',
            job_type: job.job_type || 'full-time',
            salary_range: job.salary_range || '',
            location: job.location || '',
        });
        
        setEditModalOpen(true);
    };

    const handleUpdateJob = async (data) => {
        if (!selectedJob) return;
        
        setEditLoading(true);
        try {
            const response = await apiPut(`/jobs/${selectedJob.id}`, data);
            setJobs(jobs.map(j => j.id === selectedJob.id ? response.data : j));
            setEditModalOpen(false);
            setSelectedJob(null);
        } catch (error) {
            console.error("Failed to update job:", error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (jobId) => {
        showConfirm(
            'Are you sure you want to delete this job?',
            async () => {
                try {
                    await apiDelete(`/jobs/${jobId}`);
                    setJobs(jobs.filter(j => j.id !== jobId));
                } catch (error) {
                    console.error("Failed to delete job:", error);
                }
            },
            'Confirm Delete',
            'Delete',
            'Cancel'
        );
    };

    // Add handlers for accept/reject
    const handleAccept = async (jobId) => {
        try {
            await apiPost(`/jobs/${jobId}/accept`);
            setJobs(jobs => jobs.map(j => j.id === jobId ? { ...j, status: 'accepted' } : j));
        } catch (error) {
            console.error("Failed to accept job:", error);
        }
    };

    const handleReject = async (jobId) => {
        try {
            await apiPost(`/jobs/${jobId}/reject`);
            setJobs(jobs => jobs.map(j => j.id === jobId ? { ...j, status: 'rejected' } : j));
        } catch (error) {
            console.error("Failed to reject job:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <Card>
            <CardHeader>
                <CardTitle>Job Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {loading ? (
                                <div className="text-center p-6">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                                    <p className="text-gray-500 mt-2">Loading jobs...</p>
                                </div>
                            ) : jobs && jobs.length > 0 ? (
                                jobs.map(job => (
                                    <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                                                <p className="text-sm text-gray-600 truncate">{job.company}</p>
                                                <p className="text-sm text-gray-500">{job.location}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                job.status === 'active' ? 'bg-green-100 text-green-800' :
                                                job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            } capitalize`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mb-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 h-8 text-xs"
                                                onClick={() => handleView(job)}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                View
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 h-8 text-xs"
                                                onClick={() => handleEdit(job)}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleDelete(job.id)}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                        {job.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                    onClick={() => handleAccept(job.id)}
                                                >
                                                    Accept
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 h-8 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                                                    onClick={() => handleReject(job.id)}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">{alertState.message || 'No jobs found'}</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <table className="hidden md:table w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Title</th>
                                    <th className="p-3 text-left font-semibold">Company</th>
                                    <th className="p-3 text-left font-semibold">Location</th>
                                    <th className="p-3 text-left font-semibold">Status</th>
                                    <th className="p-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-6">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                                        </td>
                                    </tr>
                                ) : jobs && jobs.length > 0 ? (
                                    jobs.map(job => (
                                        <tr key={job.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="p-3">{job.title}</td>
                                            <td className="p-3">{job.company}</td>
                                            <td className="p-3">{job.location}</td>
                                            <td className="p-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    job.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                } capitalize`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(job)}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(job)}><Edit className="h-4 w-4" /></Button>
                                                    <Button onClick={() => handleDelete(job.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-600 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                                                    {job.status === 'pending' && (
                                                        <>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="text-green-500 hover:text-green-600 h-8 w-8"
                                                                onClick={() => handleAccept(job.id)}
                                                                title="Accept Job"
                                                            >
                                                                ✓
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="text-orange-500 hover:text-orange-600 h-8 w-8"
                                                                onClick={() => handleReject(job.id)}
                                                                title="Reject Job"
                                                            >
                                                                ✗
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-6 text-gray-500">
                                            {alertState.message || 'No jobs found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* View Job Modal */}
                <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Job Details</DialogTitle>
                        </DialogHeader>
                        {selectedJob && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedJob.title}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Type</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 capitalize">{selectedJob.job_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedJob.location || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary Range</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedJob.salary_range || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 capitalize">{selectedJob.status || 'pending'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Posted Date</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{formatDate(selectedJob.created_at)}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{selectedJob.description}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills Required</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{selectedJob.skills_required}</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Job Modal */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Job</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleUpdateJob)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="job_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Job Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select job type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="full-time">Full Time</SelectItem>
                                                        <SelectItem value="part-time">Part Time</SelectItem>
                                                        <SelectItem value="contract">Contract</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="salary_range"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Salary Range</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={4} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="skills_required"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skills Required</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={3} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={editLoading}>
                                        {editLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Job'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
        
        {/* Custom Alert Modal */}
        <CustomAlert
            isOpen={alertState.isOpen}
            onClose={closeAlert}
            title={alertState.title}
            message={alertState.message}
            type={alertState.type}
            showCancel={alertState.showCancel}
            onConfirm={alertState.onConfirm}
            confirmText={alertState.confirmText}
            cancelText={alertState.cancelText}
        />
    </div>
  );
};

export default AdminJobManagement; 
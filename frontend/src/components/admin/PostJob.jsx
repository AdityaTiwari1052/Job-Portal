import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { JOB_API_END_POINT } from '@/utils/constant';

const PostJob = ({ onJobCreated }) => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        category: "",
        jobType: "",
        experienceLevel: "",
        position: 0,
        skills: [],
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (name, value) => {
        setInput(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!input.title || !input.description || !input.jobType || !input.location || !input.category) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(JOB_API_END_POINT, input);
            toast.success('Job posted successfully!');

            if (onJobCreated) {
                onJobCreated(response.data);
            }

            setInput({
                title: "",
                description: "",
                requirements: "",
                salary: "",
                location: "",
                category: "",
                jobType: "",
                experienceLevel: "",
                position: 0,
                skills: [],
            });

        } catch (error) {
            console.error('Error posting job:', error);
            toast.error(error.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Post a New Job</h2>
            <form onSubmit={submitHandler} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                        id="title"
                        name="title"
                        value={input.title}
                        onChange={changeEventHandler}
                        placeholder="e.g. Senior Software Engineer"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <textarea
                        id="description"
                        name="description"
                        value={input.description}
                        onChange={changeEventHandler}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter job description..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="jobType">Job Type *</Label>
                        <Select
                            value={input.jobType}
                            onValueChange={(value) => selectChangeHandler('jobType', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Internship">Internship</SelectItem>
                                    <SelectItem value="Temporary">Temporary</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Select
                            value={input.location}
                            onValueChange={(value) => selectChangeHandler('location', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Delhi">Delhi</SelectItem>
                                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                                    <SelectItem value="Chennai">Chennai</SelectItem>
                                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                                    <SelectItem value="Pune">Pune</SelectItem>
                                    <SelectItem value="Kolkata">Kolkata</SelectItem>
                                    <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                                    <SelectItem value="Jaipur">Jaipur</SelectItem>
                                    <SelectItem value="Noida">Noida</SelectItem>
                                    <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                                    <SelectItem value="Remote">Remote</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={input.category}
                            onValueChange={(value) => selectChangeHandler('category', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Programming">Programming</SelectItem>
                                    <SelectItem value="Data Science">Data Science</SelectItem>
                                    <SelectItem value="Designing">Designing</SelectItem>
                                    <SelectItem value="Networking">Networking</SelectItem>
                                    <SelectItem value="Management">Management</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <Select
                            value={input.experienceLevel}
                            onValueChange={(value) => selectChangeHandler('experienceLevel', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Entry Level">Entry Level</SelectItem>
                                    <SelectItem value="Mid Level">Mid Level</SelectItem>
                                    <SelectItem value="Senior">Senior</SelectItem>
                                    <SelectItem value="Lead">Lead</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Executive">Executive</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input
                            id="salary"
                            name="salary"
                            type="number"
                            value={input.salary}
                            onChange={changeEventHandler}
                            placeholder="e.g. 90000"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="skills">Skills</Label>
                        <Input
                            id="skills"
                            name="skills"
                            value={input.skills.join(', ')}
                            onChange={(e) => {
                                const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                                setInput(prev => ({ ...prev, skills: skillsArray }));
                            }}
                            placeholder="e.g. JavaScript, React, Node.js"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <textarea
                        id="requirements"
                        name="requirements"
                        value={input.requirements}
                        onChange={changeEventHandler}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="List job requirements (one per line)"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position">No of Positions</Label>
                    <Input
                        id="position"
                        name="position"
                        type="number"
                        value={input.position}
                        onChange={changeEventHandler}
                        placeholder="e.g. 1"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                            </>
                        ) : 'Post Job'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PostJob;

import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import apiClient from '@/utils/apiClient';
import axios from 'axios';
import { CheckCircle2, XCircle } from 'lucide-react';
import {Avatar} from "../../components/ui/avatar";
import { setAllApplicants } from '@/redux/applicationSlice';

const ApplicantsTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { applicants } = useSelector(store => store.application);

  const fetchAllApplicants = async () => {
    try {
      const res = await apiClient.get(`/application/${applicants?._id}/applicants`, { withCredentials: true });
      dispatch(setAllApplicants(res.data.job));
    } catch (error) {
      console.log(error);
    }
  }

  const statusHandler = async (status, id) => {
    try {
      const res = await apiClient.post(`/application/update-status/${id}`, { status });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAllApplicants();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <Table>
        <TableCaption>A list of your recent applied users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            applicants && applicants?.applications?.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div onClick={() => navigate(`/profile/id/${item.applicant._id}`)} className="cursor-pointer flex items-center gap-2">
                    {
                      item?.applicant?.profile?.profilePhoto
                        ? <img src={item.applicant.profile.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                        : <Avatar name={item?.applicant?.fullname} size="40" round={true} />
                    }
                    <span className="text-blue-600 underline text-sm">View Profile</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item?.applicant?.fullname}</TableCell>
                <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                <TableCell>
                  {
                    item.applicant?.profile?.resume
                      ? <a className="text-blue-600 cursor-pointer text-sm" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName}</a>
                      : <span>NA</span>
                  }
                </TableCell>
                <TableCell className="flex gap-4">
                  <CheckCircle2 className="text-green-600 cursor-pointer" onClick={() => statusHandler("Accepted", item?._id)} />
                  <XCircle className="text-red-600 cursor-pointer" onClick={() => statusHandler("Rejected", item?._id)} />
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  )
}

export default ApplicantsTable;

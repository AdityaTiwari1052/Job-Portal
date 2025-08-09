import { setCompanies} from '@/redux/companySlice'
import apiClient from '@/utils/apiClient';
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchCompanies = async () => {
            try {
                const res = await apiClient.get('/company/get', {withCredentials:true});
                console.log('Companies API Response:', res.data);
                if(res.data.success){
                    console.log('Dispatching companies:', res.data.companies);
                    dispatch(setCompanies(res.data.companies));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchCompanies();
    },[])
}

export default useGetAllCompanies
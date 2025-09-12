import axios from 'axios';

const IrgApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_IRG_API_URL,
});

export default IrgApi;

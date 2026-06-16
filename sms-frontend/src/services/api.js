import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.baseURL || 'http://localhost:5000',
});

export default API;
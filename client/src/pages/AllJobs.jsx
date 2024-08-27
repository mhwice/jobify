import { toast } from 'react-toastify';
import { JobsContainer, SearchContainer } from '../components';
import customFetch from '../utils/customFetch';
import { useLoaderData } from 'react-router-dom';
import { useContext, createContext } from 'react';

export const loader = async ({ request }) => {
  // Converts query params from the url into an object of key/value pairs
  const params = Object.fromEntries([...new URL(request.url).searchParams.entries()]);

  try {
    // We can pass the params object to Axios and it will create the query params url
    // for the api call
    const { data } = await customFetch.get("/jobs", { params });
    return { data, searchValues: {...params} };
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
}

const AllJobsContext = createContext();

const AllJobs = () => {

  const { data, searchValues } = useLoaderData();

  return (
    <AllJobsContext.Provider value={{ data, searchValues }}>
      <SearchContainer />
      <JobsContainer /> 
    </AllJobsContext.Provider>
  );
}

export const useAllJobsContext = () => useContext(AllJobsContext);

export default AllJobs;
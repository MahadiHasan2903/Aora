import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../lib/appWrite";

// Create a context for global state
const GlobalContext = createContext();

// Custom hook to use the global context
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  // States to keep track
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect to fetch the logged-in user information when the component mounts
  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        // If a user is found, update the state accordingly
        if (res) {
          setIsLogged(true);
          setUser(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        // Log any errors that occur during the fetch
        console.log("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    // Provide the global state and functions to the rest of the app
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        isLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;

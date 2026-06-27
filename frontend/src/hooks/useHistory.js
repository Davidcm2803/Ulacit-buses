import { useState, useEffect } from "react";
import { apiGet } from "../config/api";

export function useHistory() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet("/historial/me")
      .then(setHistorial)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { historial, loading, error };
}
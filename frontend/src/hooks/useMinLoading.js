import { useState, useEffect, useRef } from "react";

export function useMinLoading(asyncFn, deps = [], minMs = 600) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const start = Date.now();
    setLoading(true);
    setError("");

    asyncFn().then(
      (result) => {
        const elapsed = Date.now() - start;
        const wait = Math.max(0, minMs - elapsed);
        setTimeout(() => {
          if (mounted.current) {
            setData(result);
            setLoading(false);
          }
        }, wait);
      },
      (err) => {
        const elapsed = Date.now() - start;
        const wait = Math.max(0, minMs - elapsed);
        setTimeout(() => {
          if (mounted.current) {
            setError(err.message || "Something went wrong");
            setLoading(false);
          }
        }, wait);
      }
    );

    return () => {
      mounted.current = false;
    };
  }, deps);

  return { loading, data, error, setData };
}

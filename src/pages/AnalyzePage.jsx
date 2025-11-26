import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function AnalyzePage() {
  const { id } = useParams();

  useEffect(() => {
 window.location.href = `http://localhost:4000/api/analyze/${id}`;

  }, [id]);

  return <h2>Processing…</h2>;
}

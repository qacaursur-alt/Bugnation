import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function CourseManagementDebug() {
  console.log('CourseManagementDebug component rendering');

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/course-groups"],
    queryFn: async () => {
      console.log('Fetching course groups in debug component...');
      const response = await apiRequest("GET", "/api/course-groups");
      console.log('Debug response:', response);
      const json = await response.json();
      console.log('Debug JSON:', json);
      return json;
    },
  });

  console.log('Debug component state:', { data, isLoading, error });

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Course Management Debug</h2>
      <p>Data: {JSON.stringify(data, null, 2)}</p>
      <p>Data length: {Array.isArray(data) ? data.length : 'Not an array'}</p>
    </div>
  );
}

import { useParams } from 'react-router-dom';

export default function Project() {
  const { projectId } = useParams();

  return (
    <div>
      <h1>Project: {projectId}</h1>
      <p>Project tasks will be displayed here</p>
    </div>
  );
}

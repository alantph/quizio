import { useAdminStore } from "@quizio/web/features/admin/stores/admin";
import { Navigate, useParams } from "react-router";
import QuizEditorPage from "../_editor";

const AdminQuizEditPage = () => {
  const { token } = useAdminStore();
  const { id } = useParams<{ id: string }>();
  if (!token) return <Navigate to="/admin/login" replace />;
  if (!id) return <Navigate to="/admin/dashboard" replace />;
  return <QuizEditorPage mode="edit" id={id} />;
};

export default AdminQuizEditPage;

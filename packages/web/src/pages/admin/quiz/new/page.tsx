import { useAdminStore } from "@quizio/web/features/admin/stores/admin";
import { Navigate } from "react-router";
import QuizEditorPage from "../_editor";

const AdminQuizNewPage = () => {
  const { token } = useAdminStore();
  if (!token) return <Navigate to="/admin/login" replace />;
  return <QuizEditorPage mode="new" />;
};

export default AdminQuizNewPage;

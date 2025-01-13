import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
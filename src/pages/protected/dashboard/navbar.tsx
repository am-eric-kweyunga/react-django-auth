import viteLogo from "/react.svg";

const DashboardNavbar = () => {
  return (
    <div className="flex items-center">
      <img
        src={viteLogo}
        alt="Vite logo"
        style={{
          height: "5em",
          padding: "1.5em",
        }}
      />
    </div>
  );
};

export default DashboardNavbar;

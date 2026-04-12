import Footer from "./footer";
import Header from "./header";

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-column">
      <Header />
      <main className="flex-grow min-w-screen">{children}</main>
      <Footer />
    </div>
  );
};

export default UserLayout;

import doctor from "../assets/doctor.jpg";
import whyUs from "../assets/why us.jpg";
import { Card, Col, Row } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, theme } from "antd";
import { Button, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { useContext } from "react";
import logo from "../assets/logo.png";
const style = {
  background: "#ffff",
  padding: "2px 0",
  margin: "-8px 0px",
  fontSize: "16px",
  lineHeight: "1.1",
  color: "black",
};

const getItems = () => [
  {
    key: "1",
    label: <span className="text-lg text-black ">What is MediTrack?</span>,
    children: (
      <p className="text-gray-700 text-lg ">
        MediTrack is a secure platform where users can upload, store, manage,
        and share their medical documents anytime, anywhere.
      </p>
    ),
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
  {
    key: "2",
    label: (
      <span className="text-lg text-black ">
        Is my medical data safe on MediTrack?
      </span>
    ),
    children: (
      <p className="text-gray-700 text-lg">
        Yes. All your data is encrypted and securely stored. Only you control
        who can access your documents.
      </p>
    ),
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
  {
    key: "3",
    label: (
      <span className="text-lg text-black ">
        How can I share my documents with doctors?
      </span>
    ),
    children: (
      <p className="text-gray-700 text-lg">
        You can instantly share documents using a secure QR code or direct
        access link.
      </p>
    ),
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
  {
    key: "4",
    label: (
      <span className="text-lg text-black ">
        Can I set reminders for medicines and appointments?
      </span>
    ),
    children: (
      <p className="text-gray-700 text-lg">
        Absolutely. MediTrack allows you to set reminders for medications,
        doctor visits, and important health tasks.
      </p>
    ),
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
  {
    key: "5",
    label: (
      <span className="text-lg text-black ">
        Can I download my medical profile as a PDF?
      </span>
    ),
    children: (
      <p className="text-gray-700 text-lg">
        Yes. Your complete medical profile can be generated and downloaded
        instantly in PDF format.
      </p>
    ),
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
];

const features = [
  {
    title: "Secure Document Storage",
    desc: "Upload and safely store all your medical documents in one place, accessible anytime and from anywhere with full privacy protection.",
  },
  {
    title: "QR Code Sharing",
    desc: "Generate a unique QR code for your medical files and instantly share documents with doctors or hospitals in seconds.",
  },
  {
    title: "Smart Profile & Reminders",
    desc: "Create a personal health profile, set medicine or appointment reminders, and instantly generate a detailed medical report in PDF format.",
  },
];

const whyUsCards = [
  {
    title: "All Records in One Place",
    desc: "No more searching through papers or folders. Keep every medical document safely stored and organized.",
  },
  {
    title: "Instant Access Anywhere",
    desc: "Access your health records anytime, from any device — perfect for emergencies or travel.",
  },
  {
    title: "Easy & Secure Sharing",
    desc: "Share documents instantly with doctors through QR code or direct access — fast and safe.",
  },
  {
    title: "Time-Saving & Stress-Free",
    desc: "Automated reminders and instant PDF reports save time and remove the hassle of managing your medical data manually.",
  },
];

const footerLinks = [
  { label: "Home", href: "#hero" },
  { label: "Records", href: "/records" },
  { label: "Features", href: "#features" },
  { label: "Why Us", href: "#whyUs" },
  { label: "FAQs", href: "#faqs" },
  { label: "Get Started", href: "/records" },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  const handleGetStarted = async () => {
    try {
      //   const token = localStorage.getItem("token");

      //   const res = await fetch(`${backendUrl}/api/profile/check`, {
      //     headers: { Authorization: `Bearer ${token}` }
      //   });

      //   const data = await res.json();

      if (user) {
        navigate("/Records");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  return (
    <div id="dashboard">
      <section id="hero" className=" flex flex-row h-140">
        <div className="w-200 h-100 flex-col pl-40 pt-28 ">
          <h1 className="text-6xl font-bold">
            Your Personal <br />
            <span className="text-blue-600">Health</span> Companion
          </h1>
          <br />
          <p className=" font-medium text-xl font-acumin-pro">
            Meditrack makes managing your health simple.
            <br /> Monitor your wellness, keep track of appointments,
            <br /> and communicate with trusted healthcare providers
            <br /> anytime, anywhere.
          </p>
          <br />

          {/* <button className="border-2 bg-blue-600 text-white h-10 w-30 rounded-4xl mr-2 cursor-pointer" href="/Records">Get Started</button> */}
          <button
            // onClick={() => navigate("/Records")}
            onClick={handleGetStarted}
            className="border-2 bg-blue-600 text-white h-10 w-30 rounded-4xl cursor-pointer"
          >
            Get Started
          </button>

          <button
            // onClick={() => navigate("#featutes")}
            onClick={() =>
              document
                .getElementById("whyUs")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="border-blue-300 border-2 bg-white text-blue-600 h-10 w-30 rounded-4xl cursor-pointer"
          >
            Learn More
          </button>
        </div>
        <div>
          <img
            src={doctor}
            alt="doctor"
            loading="lazy"
            className="h-100 w-140 rounded-full object-fit shadow-[4px_4px_4px_rgba(10,10,10,3)] mt-28 ml-16"
          />
        </div>
      </section>

      <section id="features" className="mt-4 px-10 pt-16 h-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 p-8">
            Our <span className="text-blue-600">Key Features</span>
          </h1>
        </div>

        <Row gutter={22} className="flex justify-center">
          {features.map((f, idx) => (
            <Col key={idx} span={6}>
              <Card
                title={f.title}
                variant="borderless"
                className="shadow-lg rounded-2xl hover:shadow-2xl transition"
              >
                <p className="text-gray-600 h-20">{f.desc}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section id="whyUs" className="h-160 mb-10 flex">
        <div className="w-160">
          <img
            src={whyUs}
            alt="whyUs"
            loading="lazy"
            className="h-100 w-140 rounded-full object-fit shadow-[4px_4px_4px_rgba(10,10,10,3)] mt-[28%] ml-16"
          />
        </div>
        <div className="flex flex-col justify-center w-218 h-screen">
          <h1 className="text-4xl font-bold text-gray-800 p-8 text-center">
            Why Choose <span className="text-blue-600">MediTrack</span>?
          </h1>
          <div>
            <Row gutter={[18,40]} className="flex justify-center text-justify">
              {whyUsCards.map((w, index) => (
                <Col key={index} span={10}>
                  <Card
                    title={w.title}
                    variant="borderless"
                    className="shadow-lg rounded-2xl hover:shadow-2xl transition"
                  >
                    <p className="text-gray-600 h-16">{w.desc}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </section>

      <section id="faqs" className=" bg-white px-80 py-14">
        <h1 className="text-4xl font-bold text-gray-800 p-10 text-center">
          Frequently Asked Questions
        </h1>
        <Collapse
          accordion
          bordered={false}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              className={`transition-transform duration-300 text-gray-500 ${
                isActive ? "rotate-90 text-blue-500" : ""
              }`}
            />
          )}
          className="bg-white rounded-xl shadow-md p-4 [&_.ant-collapse-header]:border-0 [&_.ant-collapse-item]:border-0"
          items={getItems()}
        />
      </section>

      <section id="getStarted" className="flex justify-center py-20">
        <div className="h-70 w-330 rounded-2xl bg-blue-700 text-white  text-center px-80 py-10">
          <h1 className="text-3xl font-bold">Get Started with MediTrack</h1>
          <p className="mt-6">
           Easily organize your medical records, set reminders for medications and appointments, and access your health information anytime, anywhere—your personal health hub in one place.
          </p>
          <div className="my-10 rounded-4xl flex justify-center">
            <Flex gap="small" wrap>
              <Button
                // onClick={() => navigate("/records")}
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </Flex>
          </div>
        </div>
      </section>

      <footer id="footer" className="bg-white h-full py-10">
        <div className="flex">
          <div className="w-[50%] h-[100%] pl-[10%]">
            <img className="w-12 h-12 my-4 " src={logo} alt="" srcset="" />
            <p className="font-bold text-xl">Your Personal <br /> <span className="text-blue-600">Health</span> Companion</p>
                {/* <h1 className="py-10">@gauri nagariya</h1> */}
                <h1 className="py-10">@MediTrack</h1>
          </div>
          <div className="w-[50%] h-[100%] flex justify-around pr-[10%]">
           
              <Row gutter={22} className="flex justify-center pt-18">
          {footerLinks.map((f, idx) => (
            <Col key={idx} span={100}>
                <a className=" text-lg !text-black hover:!text-blue-600 hover:!underline" href={f.href}>{f.label}</a>
            </Col>
          ))}
        </Row>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

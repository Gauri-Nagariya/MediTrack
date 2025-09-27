import React from "react";
import doctor from "../assets/doctor.jpg";
import whyUs from "../assets/why us.jpg";
import { Card, Col, Row } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, theme } from "antd";
import { Button, Flex } from "antd";
import { Divider } from "antd";
const style = { background: "#ffff", padding: "2px 0", margin: "-8px 0px", fontSize: "16px", lineHeight: "1.1",  color:"black"};

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
const getItems = () => [
  {
    key: "1",
    label: (
      <span className="text-lg font-bold text-black font-acumin-pro">
        Panel 1
      </span>
    ),
    children: <p className="text-black font-acumin-pro ">{text}</p>,
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0", // Tailwind replaces panelStyle
  },
  {
    key: "2",
    label: (
      <span className="text-lg font-bold text-black font-acumin-pro">
        Panel 2
      </span>
    ),
    children: <p className="text-gray-700 font-acumin-pro">{text}</p>,
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
  {
    key: "3",
    label: (
      <span className="text-lg font-bold text-black font-acumin-pro">
        Panel 3
      </span>
    ),
    children: <p className="text-gray-700 font-acumin-pro">{text}</p>,
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
  {
    key: "4",
    label: (
      <span className="text-lg font-bold text-black font-acumin-pro">
        Panel 4
      </span>
    ),
    children: <p className="text-gray-700 font-acumin-pro">{text}</p>,
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
  {
    key: "5",
    label: (
      <span className="text-lg font-bold text-black font-acumin-pro">
        Panel 5
      </span>
    ),
    children: <p className="text-gray-700 font-acumin-pro">{text}</p>,
    className: "bg-[#f4f6f8] rounded-lg mb-4 border-0",
  },
];

const Home = () => {
  const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  return (
    <div id="dashboard">
      <section id="hero" className=" flex flex-row h-160">
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
          <button className="border-2 bg-blue-600 text-white h-10 w-30 rounded-4xl mr-2 cursor-pointer">Get Started</button>
          <button className="border-blue-300 border-2 bg-white text-blue-600 h-10 w-30 rounded-4xl cursor-pointer">Learn More</button>
        </div>
        <div>
          <img
            src={doctor}
            alt="doctor"
            className="h-100 w-140 rounded-full object-fit shadow-[4px_4px_4px_rgba(10,10,10,3)] mt-28 ml-16"
          />
        </div>
      </section>

      <section id="features" className="mt-4 mb-10 px-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 p-8">Our <span className="text-blue-600">Key Features</span></h1>
        </div>

        <Row gutter={22} className="flex justify-center">
          <Col span={6}>
            <Card
              title="Appointments"
              variant="borderless"
              className="shadow-lg rounded-2xl hover:shadow-2xl transition"
            >
              <p className="text-gray-600 h-20">
                Manage and track your doctor visits.
              </p>
            </Card>
          </Col>

          <Col span={6}>
            <Card
              title="Wellness Tracking"
              variant="borderless"
              className="shadow-lg rounded-2xl hover:shadow-2xl transition"
            >
              <p className="text-gray-600 h-20">
                Monitor daily habits and health progress.
              </p>
            </Card>
          </Col>

          <Col span={6}>
            <Card
              title="24/7 Access"
              variant="borderless"
              className="shadow-lg rounded-2xl hover:shadow-2xl transition"
            >
              <p className="text-gray-600 h-20">
                Connect with healthcare providers anytime.
              </p>
            </Card>
          </Col>
        </Row>
      </section>

      <section id="whyUs" className="h-160 flex">
        <div className="w-160">
          <img
            src={whyUs}
            alt="whyUs"
            className="h-100 w-140 rounded-full object-fit shadow-[4px_4px_4px_rgba(10,10,10,3)] mt-30 ml-16"
          />
        </div>
        <div className="flex flex-col justify-center w-218 ">
          <h1 className="text-4xl font-bold text-gray-800 p-8 text-center">
            Why Choose <span className="text-blue-600">MediTrack</span>?
          </h1>
          <div>
            <Row gutter={16} className="flex justify-center">
              <Col span={8}>
                <Card
                  title="Appointments"
                  variant="borderless"
                  className="shadow-lg rounded-2xl hover:shadow-2xl transition"
                >
                  <p className="text-gray-600 h-16">
                    Manage and track your doctor visits.
                  </p>
                </Card>
              </Col>

              <Col span={8}>
                <Card
                  title="24/7 Access"
                  variant="borderless"
                  className="shadow-lg rounded-2xl hover:shadow-2xl transition"
                >
                  <p className="text-gray-600 h-16">
                    Connect with healthcare providers anytime.
                  </p>
                </Card>
              </Col>
            </Row>
          </div>
          <br />
          <div>
            <Row gutter={16} className="flex justify-center">
              <Col span={8}>
                <Card
                  title="Appointments"
                  variant="borderless"
                  className="shadow-lg rounded-2xl hover:shadow-2xl transition"
                >
                  <p className="text-gray-600 h-16">
                    Manage and track your doctor visits.
                  </p>
                </Card>
              </Col>

              <Col span={8}>
                <Card
                  title="Wellness Tracking"
                  variant="borderless"
                  className="shadow-lg rounded-2xl hover:shadow-2xl transition"
                >
                  <p className="text-gray-600 h-16">
                    Monitor daily habits and health progress.
                  </p>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </section>

      <section id="faqs" className=" bg-white px-80 py-16">
        <h1 className="text-4xl font-bold text-gray-800 p-10 text-center">
          Frequently Asked Questions
        </h1>
        <Collapse
          bordered={false}
          // defaultActiveKey={["1"]}
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
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aspernatur
            labore, dolores, praesentium maiores sed libero provident vel.
          </p>
          <button className="my-10 rounded-4xl">
            <Flex gap="small" wrap>
              <Button>Default Button</Button>
            </Flex>
          </button>
        </div>
      </section>

      <footer id="footer" className="bg-white h-100 px-40 py-16 ">
        <>
          {/* <Divider orientation="left">Vertical</Divider> */}
          <Row gutter={[40, 20]}>
           
            <Col className="gutter-row" span={6}>
              <a href="#hero" className="font-semibold" style={style}>Home</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a className="font-semibold" style={style}>Recobfjbehbfhrds</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a className="font-semibold" style={style}>FAbfjbrehjfbQs</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a className="font-semibold" style={style}>Get Stajbfjgeyugrted</a>
            </Col>
             <Col className="gutter-row" span={6}>
              <a  href="#features" className="py-0" style={style}>Features</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
             <Col className="gutter-row" span={6}>
              <a href="#whyUs" style={style}>Why Us</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>hjguf</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
             <Col className="gutter-row" span={6}>
              <a href="#faqs" style={style}>FAQs</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a href="#getStarted" style={style}>Get Started</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
            <Col className="gutter-row" span={6}>
              <a style={style}>col-6</a>
            </Col>
          </Row>
        </>
<br />

        <h1 className="text-center py-8">@gauri nagariya</h1>
      </footer>
    </div>
  );
};

export default Home;

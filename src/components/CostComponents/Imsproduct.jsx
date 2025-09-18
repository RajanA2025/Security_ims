// File: src/components/Imsproduct.jsx
import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import securityimg from '../../assets/securityimg.avif';
import cloudimg from '../../assets/cloudimg.png';

const { Title, Text } = Typography;

const cardAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

const Imsproduct = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: '50px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Row gutter={32} justify="center">

        {/* Cost Card */}
        <Col>
          <motion.div
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            variants={cardAnimation}
            viewport={{ once: true }}
            onClick={() => navigate('/Dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <Card
              style={{
                width: 300,
                borderRadius: '15px',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '20px', backgroundColor: '#f9f4e4' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                  }}
                >
                  <img src="https://www.shutterstock.com/image-photo/cost-reduction-concept-wording-on-600nw-2405339143.jpg" alt="Cost Cloud" width="300px" height="230px" />
                </div>
                <Title level={4} style={{ margin: '20px 0' }}>Cost</Title>
                <Text>
                  Cost Cloud provides real-time visibility into your cloud expenses across all services.
                </Text>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Security Card */}
        <Link to='http://192.168.1.18:5173/Security'>

          <Col>
            <motion.div
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              variants={cardAnimation}
              viewport={{ once: true }}
              // onClick={() => navigate('http://192.168.1.18:5173/')}
              style={{ cursor: 'pointer' }}
            >
              <Card
                style={{
                  width: 300,
                  borderRadius: '15px',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: '20px', backgroundColor: '#f9f4e4' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                    }}
                  >
                    <img src={securityimg} alt="Security" width="300px" height="230px" />
                  </div>
                  <Title level={4} style={{ margin: '20px 0' }}>Security</Title>
                  <Text>
                    IMS security continuously monitors, detects, and safeguards your cloud infrastructure and data.
                  </Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Link>

        <Link to='http://192.168.1.18:5173/Operational'>

          <Col>
            <motion.div
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              variants={cardAnimation}
              viewport={{ once: true }}
              // onClick={() => navigate('http://192.168.1.18:5173/')}
              style={{ cursor: 'pointer' }}
            >
              <Card
                style={{
                  width: 300,
                  borderRadius: '15px',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: '20px', backgroundColor: '#f9f4e4' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                    }}
                  >
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRr8MIn0_lXk26lbBEqZzEWec1koj6Wy33mw&s" alt="Security" width="300px" height="230px" />
                  </div>
                  <Title level={4} style={{ margin: '20px 0' }}>operational excellence</Title>
                  <Text>
                    Our company strives for operational excellence by continuously improving processes, reducing waste, and delivering                  </Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Link>
      </Row>
    </div>
  );
};

export default Imsproduct;

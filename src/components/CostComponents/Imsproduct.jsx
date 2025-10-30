import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import axios from 'axios'; // ✅ Added axios import
import securityimg from '../../assets/securityimg.avif';

const { Title, Text } = Typography;

const cardAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

export default function Imsproduct() {
  const navigate = useNavigate();
  const [pillars, setPillars] = useState({
    cost: false,
    security: false,
    operational_excellence: false,
    performance: false,
  });
  const [hasAccount, setHasAccount] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ✅ Load pillars & check if account exists
  useEffect(() => {
    const storedPillars = JSON.parse(localStorage.getItem('pillars'));
    if (storedPillars) setPillars(storedPillars);

    const storedAccounts = JSON.parse(localStorage.getItem('account_ids'));
    if (storedAccounts && storedAccounts.length > 0) {
      setHasAccount(true);
    } else {
      setHasAccount(false);
      setIsModalVisible(true); // ✅ Show modal if no account found
    }
    console.log(storedAccounts);
  }, []);

  const handleCreateAccount = () => {
    setIsModalVisible(false);
    navigate('/imsproduct/accounts');
  };

  // ✅ Unified function for all cards
  const handleCardClick = async (pillar) => {
    const cid = localStorage.getItem('company_cid');
    if (!cid) {
      console.warn('No company_cid found in localStorage');
      return;
    }

    try {
      const url = `http://13.212.15.14:8005/api/accounts/${cid}/${pillar}`;
      console.log('Sending request to:', url);

      const response = await axios.get(url);
      console.log('API Response:', response.data);

      // ✅ Navigate after API success
      navigate(`/${pillar}`);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // ✅ Merge operational & performance
  const isOperationalActive = pillars.operational_excellence && pillars.performance;

  return (
    <div
      style={{
        padding: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ✅ Top Add Account Button */}
      {hasAccount && (
        <div className="w-full flex justify-end mb-10">
          <button
            onClick={() => navigate('/imsproduct/accounts')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-all duration-200"
          >
            <Plus size={18} />
            Add Account
          </button>
        </div>
      )}

      {/* ✅ Modal for Create Account */}
      <Modal
        title="No Account Found"
        open={isModalVisible}
        closable={false}
        footer={[
          <button
            key="create"
            onClick={handleCreateAccount}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg"
          >
            Create Account
          </button>,
        ]}
      >
        <p>You don’t have any accounts yet. Please create an account to continue.</p>
      </Modal>

      {/* ✅ Cards Section */}
      <Row gutter={32} justify="center">
        {/* COST CARD */}
        <Col>
          <motion.div
            initial="hidden"
            whileInView="visible"
            whileHover={pillars.cost ? 'hover' : ''}
            variants={cardAnimation}
            viewport={{ once: true }}
            onClick={() => pillars.cost && handleCardClick('cost')}
            style={{ cursor: pillars.cost ? 'pointer' : 'not-allowed' }}
          >
            <Card
              style={{
                width: 300,
                borderRadius: '15px',
                overflow: 'hidden',
                opacity: pillars.cost ? 1 : 0.5,
                filter: pillars.cost ? 'none' : 'grayscale(100%)',
              }}
              bodyStyle={{
                padding: '20px',
                backgroundColor: pillars.cost ? '#91caff' : '#d3d3d3',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <img
                  src="https://www.shutterstock.com/image-photo/cost-reduction-concept-wording-on-600nw-2405339143.jpg"
                  alt="Cost Cloud"
                  width="100%"
                  height="200px"
                />
                <Title level={4} style={{ margin: '20px 0' }}>
                  Cost
                </Title>
                <Text>
                  Cost Cloud provides real-time visibility into your cloud expenses across all
                  services.
                </Text>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* SECURITY CARD */}
        <Col>
          <motion.div
            initial="hidden"
            whileInView="visible"
            whileHover={pillars.security ? 'hover' : ''}
            variants={cardAnimation}
            viewport={{ once: true }}
            onClick={() => pillars.security && handleCardClick('security')}
            style={{ cursor: pillars.security ? 'pointer' : 'not-allowed' }}
          >
            <Card
              style={{
                width: 300,
                borderRadius: '15px',
                overflow: 'hidden',
                opacity: pillars.security ? 1 : 0.5,
                filter: pillars.security ? 'none' : 'grayscale(100%)',
              }}
              bodyStyle={{
                padding: '20px',
                backgroundColor: pillars.security ? '#91caff' : '#d3d3d3',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <img src={securityimg} alt="Security" width="100%" height="200px" />
                <Title level={4} style={{ margin: '20px 0' }}>
                  Security
                </Title>
                <Text>
                  IMS security continuously monitors, detects, and safeguards your cloud
                  infrastructure and data.
                </Text>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* OPERATIONAL EXCELLENCE CARD */}
        <Col>
          <motion.div
            initial="hidden"
            whileInView="visible"
            whileHover={isOperationalActive ? 'hover' : ''}
            variants={cardAnimation}
            viewport={{ once: true }}
            onClick={() => isOperationalActive && handleCardClick('operational')}
            style={{ cursor: isOperationalActive ? 'pointer' : 'not-allowed' }}
          >
            <Card
              style={{
                width: 300,
                borderRadius: '15px',
                overflow: 'hidden',
                opacity: isOperationalActive ? 1 : 0.5,
                filter: isOperationalActive ? 'none' : 'grayscale(100%)',
              }}
              bodyStyle={{
                padding: '20px',
                backgroundColor: isOperationalActive ? '#91caff' : '#d3d3d3',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRr8MIn0_lXk26lbBEqZzEWec1koj6Wy33mw&s"
                  alt="Operational Excellence"
                  width="100%"
                  height="200px"
                />
                <Title level={4} style={{ margin: '18px 0' }}>
                  Operational Excellence
                </Title>
                <Text>
                  Our company strives for Operational Excellence by continuously improving
                  processes.
                </Text>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}

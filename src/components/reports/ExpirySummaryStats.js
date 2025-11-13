import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const ExpirySummaryStats = ({ summary, loading }) => {
  if (!summary && !loading) return null;

  const stats = [
    {
      label: '7 Days (0-7)',
      count: summary?.expiring7 || 0,
      color: 'danger',
      icon: 'bi-exclamation-circle-fill'
    },
    {
      label: '15 Days (8-15)',
      count: summary?.expiring15 || 0,
      color: 'warning',
      icon: 'bi-exclamation-triangle-fill'
    },
    {
      label: '30 Days (16-30)',
      count: summary?.expiring30 || 0,
      color: 'info',
      icon: 'bi-info-circle-fill'
    },
    {
      label: 'Expired',
      count: summary?.expired || 0,
      color: 'dark',
      icon: 'bi-x-circle-fill'
    }
  ];

  return (
    <Row className="mb-4">
      {stats.map((stat, index) => (
        <Col md={3} key={index}>
          <Card className={`border-${stat.color}`}>
            <Card.Body className="text-center">
              <i className={`bi ${stat.icon} text-${stat.color}`} style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-0">{loading ? '...' : stat.count}</h4>
              <small className="text-muted">{stat.label}</small>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ExpirySummaryStats;

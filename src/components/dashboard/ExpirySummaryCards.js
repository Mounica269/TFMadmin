import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import './ExpirySummaryCards.scss';

const ExpirySummaryCards = ({ stats, loading, onCardClick }) => {
  const cards = [
    {
      label: 'Expiring in 0-7 Days',
      count: stats?.expiring7Days || 0,
      color: 'danger',
      icon: 'bi-exclamation-circle-fill',
      days: 7,
      description: 'Critical - Requires immediate attention'
    },
    {
      label: 'Expiring in 8-15 Days',
      count: stats?.expiring15Days || 0,
      color: 'warning',
      icon: 'bi-exclamation-triangle-fill',
      days: 15,
      description: 'Soon - Plan follow-up'
    },
    {
      label: 'Expiring in 16-30 Days',
      count: stats?.expiring30Days || 0,
      color: 'info',
      icon: 'bi-info-circle-fill',
      days: 30,
      description: 'Upcoming - Monitor closely'
    }
  ];

  return (
    <Row className="expiry-summary-cards mb-4">
      {cards.map((card, index) => (
        <Col md={4} key={index}>
          <Card
            className={`border-${card.color} cursor-pointer hover-shadow`}
            onClick={() => onCardClick && onCardClick(card.days)}
          >
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">{card.label}</div>
                  <h3 className={`mb-0 text-${card.color}`}>
                    {loading ? (
                      <span className="placeholder-glow">
                        <span className="placeholder col-3"></span>
                      </span>
                    ) : (
                      card.count
                    )}
                  </h3>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {card.description}
                  </div>
                </div>
                <div className={`text-${card.color} ms-3`}>
                  <i className={`bi ${card.icon}`} style={{ fontSize: '2.5rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ExpirySummaryCards;

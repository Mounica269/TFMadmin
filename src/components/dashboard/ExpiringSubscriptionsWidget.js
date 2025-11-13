import React, { useState, useEffect } from 'react';
import { Card, ButtonGroup, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import subscriptionService from 'core/services/subscription.service';
import ExpirySummaryCards from './ExpirySummaryCards';
import ExpiringSubscriptionsTable from './ExpiringSubscriptionsTable';
import './ExpiringSubscriptionsWidget.scss';

const ExpiringSubscriptionsWidget = () => {

  // State
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const LIMIT_PER_PAGE = 10;

  // Fetch expiry statistics
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await subscriptionService.getExpiryStats();
      if (response && response.success) {
        setStats(response.data);
      } else {
        console.error('Failed to fetch stats:', response);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Failed to fetch subscription statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch expiring subscriptions
  const fetchExpiringSubscriptions = async (days, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await subscriptionService.getExpiringSoon(
        days,
        page,
        LIMIT_PER_PAGE
      );

      if (response && response.success) {
        setSubscriptions(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err.message);
      toast.error('Failed to fetch expiring subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchExpiringSubscriptions(selectedDays, 1);
  }, []);

  // Handle filter change
  const handleFilterChange = (days) => {
    setSelectedDays(days);
    setCurrentPage(1);
    fetchExpiringSubscriptions(days, 1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchExpiringSubscriptions(selectedDays, page);
  };

  // Handle card click
  const handleCardClick = (days) => {
    handleFilterChange(days);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchStats();
    fetchExpiringSubscriptions(selectedDays, currentPage);
    toast.success('Data refreshed successfully!');
  };

  return (
    <div className="expiring-subscriptions-widget">
      {/* Summary Cards */}
      <ExpirySummaryCards
        stats={stats}
        loading={statsLoading}
        onCardClick={handleCardClick}
      />

      {/* Main Widget Card */}
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white">
          <div>
            <h5 className="mb-1">
              <i className="bi bi-calendar-x text-danger me-2"></i>
              Expiring Subscriptions
            </h5>
            <small className="text-muted">
              Members whose subscriptions are expiring soon
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i>
              Refresh
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Filter Buttons */}
          <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap">
            <ButtonGroup>
              <Button
                variant={selectedDays === 7 ? 'danger' : 'outline-danger'}
                onClick={() => handleFilterChange(7)}
                className="px-3"
              >
                <i className="bi bi-exclamation-circle me-1"></i>
                0-7 Days
              </Button>
              <Button
                variant={selectedDays === 15 ? 'warning' : 'outline-warning'}
                onClick={() => handleFilterChange(15)}
                className="px-3"
              >
                <i className="bi bi-exclamation-triangle me-1"></i>
                8-15 Days
              </Button>
              <Button
                variant={selectedDays === 30 ? 'info' : 'outline-info'}
                onClick={() => handleFilterChange(30)}
                className="px-3"
              >
                <i className="bi bi-info-circle me-1"></i>
                16-30 Days
              </Button>
            </ButtonGroup>

            <div className="text-muted small mt-2 mt-md-0">
              <i className="bi bi-funnel me-1"></i>
              Showing subscriptions expiring in{' '}
              <strong>
                {selectedDays === 7 ? '0-7 days' : selectedDays === 15 ? '8-15 days' : '16-30 days'}
              </strong>
            </div>
          </div>

          {/* Table */}
          <ExpiringSubscriptionsTable
            subscriptions={subscriptions}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExpiringSubscriptionsWidget;

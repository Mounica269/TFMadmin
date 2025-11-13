import React, { useState } from 'react';
import { Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import moment from 'moment';
import { subscriptionService } from 'core/services';
import SubscriptionExpiryFilters from './SubscriptionExpiryFilters';
import ExpirySummaryStats from './ExpirySummaryStats';
import ExportModal from './ExportModal';
import './SubscriptionExpiryReport.scss';

const SubscriptionExpiryReport = () => {
  // State
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch report data
  const fetchReport = async (currentFilters = filters, page = currentPage, pageLimit = limit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionService.getExpiryReport({
        ...currentFilters,
        page: page,
        limit: pageLimit
      });

      console.log('Subscription Expiry Report Response:', response);

      // Handle different response structures
      if (response) {
        // Check if response has meta.code (standard format)
        if (response.meta && response.meta.code === 200) {
          const data = response.data || [];
          console.log('Sample subscription data:', data[0]);
          setSubscriptions(data);
          setPagination(response.pagination || null);
          if (response.summary) {
            setSummary(response.summary);
          }
        }
        // Check if response has success property
        else if (response.success === true || response.success === 'true') {
          const data = response.data || [];
          console.log('Sample subscription data:', data[0]);
          setSubscriptions(data);
          setPagination(response.pagination || null);
          if (response.summary) {
            setSummary(response.summary);
          }
        }
        // If response has data directly
        else if (response.data) {
          const data = response.data || [];
          console.log('Sample subscription data:', data[0]);
          setSubscriptions(data);
          setPagination(response.pagination || null);
          if (response.summary) {
            setSummary(response.summary);
          }
        }
        // Response structure doesn't match expected format
        else {
          console.error('Unexpected response structure:', response);
          setError(response?.meta?.message || response?.message || 'Unexpected response format');
          toast.error('Failed to fetch subscription expiry report');
        }
      } else {
        setError('No response received from server');
        toast.error('Failed to fetch subscription expiry report');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('An error occurred while fetching the report');
      toast.error('Failed to fetch subscription expiry report');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchReport(newFilters, 1, limit);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
    setSubscriptions([]);
    setSummary(null);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReport(filters, page, limit);
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    const value = e.target.value;
    if (value === 'all') {
      // Fetch all data - set limit to a very large number or use pagination total
      const allLimit = pagination?.totalCount || 10000;
      setLimit(allLimit);
      setCurrentPage(1);
      fetchReport(filters, 1, allLimit);
    } else {
      const newLimit = parseInt(value);
      setLimit(newLimit);
      setCurrentPage(1);
      fetchReport(filters, 1, newLimit);
    }
  };

  // Handle export
  const handleExport = async (selectedColumns) => {
    setExporting(true);
    try {
      const response = await subscriptionService.exportExpiryReport(
        filters,
        selectedColumns
      );

      if (response && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `subscription-expiry-report-${moment().format('YYYY-MM-DD')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success('Report exported successfully!');
        setShowExportModal(false);
      } else {
        toast.error('Failed to export report');
      }
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  // Get badge for days remaining
  const getDaysBadge = (daysRemaining) => {
    if (daysRemaining < 0) {
      return <Badge bg="dark">Expired</Badge>;
    } else if (daysRemaining <= 7) {
      return <Badge bg="danger">{daysRemaining} days</Badge>;
    } else if (daysRemaining <= 15) {
      return <Badge bg="warning" text="dark">{daysRemaining} days</Badge>;
    } else if (daysRemaining <= 30) {
      return <Badge bg="info">{daysRemaining} days</Badge>;
    } else {
      return <Badge bg="success">{daysRemaining} days</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'EXPIRING_7': { bg: 'danger', text: '7 Days' },
      'EXPIRING_15': { bg: 'warning', text: '15 Days' },
      'EXPIRING_30': { bg: 'info', text: '30 Days' },
      'EXPIRED': { bg: 'dark', text: 'Expired' }
    };
    const statusConfig = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusConfig.bg}>{statusConfig.text}</Badge>;
  };

  return (
    <div className="subscription-expiry-report">
      {/* Filters */}
      <SubscriptionExpiryFilters
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        loading={loading}
      />

      {/* Summary Stats */}
      <ExpirySummaryStats summary={summary} loading={loading} />

      {/* Table Header Actions */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-0">Subscription Expiry Report</h5>
          <small className="text-muted">
            {pagination && pagination.totalCount > 0 && `Showing ${pagination.totalCount} records`}
          </small>
        </div>
        <div>
          <Button
            variant="success"
            onClick={() => setShowExportModal(true)}
            disabled={loading || subscriptions.length === 0}
          >
            <i className="bi bi-download me-2"></i>
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Table Controls */}
      {subscriptions.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-4 entries-control-bar">
          <div className="d-flex align-items-center entries-selector">
            <span className="entries-label">Show</span>
            <Form.Select
              className="entries-dropdown"
              size="sm"
              value={limit > 1000 ? 'all' : limit}
              onChange={handleLimitChange}
              disabled={loading}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">All</option>
            </Form.Select>
            <span className="entries-label">entries</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading report data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && subscriptions.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="mt-3 text-muted">
            {Object.keys(filters).length > 0
              ? 'No subscriptions found matching your filters.'
              : 'Apply filters to view subscription expiry data.'}
          </p>
          {Object.keys(filters).length > 0 && (
            <Button variant="outline-primary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && subscriptions.length > 0 && (
        <>
          <Table responsive hover className="report-table">
            <thead>
              <tr>
                <th>Matri ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, index) => (
                <tr key={sub._id || index}>
                  <td><strong>{sub.matriId || sub.profileId || sub.matriID || sub.userID || sub.userId || sub.profile?.matriId || 'N/A'}</strong></td>
                  <td>{sub.name || sub.firstName || sub.profile?.firstName || 'N/A'}</td>
                  <td className="text-muted small">{sub.email || sub.profile?.email || 'N/A'}</td>
                  <td className="text-muted small">{sub.phone || sub.mobileNo || sub.profile?.mobileNo || 'N/A'}</td>
                  <td><Badge bg="secondary">{sub.planName || sub.plan?.name || 'N/A'}</Badge></td>
                  <td>{sub.planPrice || sub.plan?.price ? `₹${sub.planPrice || sub.plan?.price}` : 'N/A'}</td>
                  <td>{sub.startAt ? moment(sub.startAt).format('MMM DD, YYYY') : 'N/A'}</td>
                  <td>{sub.expiresAt ? moment(sub.expiresAt).format('MMM DD, YYYY') : 'N/A'}</td>
                  <td>{sub.daysRemaining !== undefined ? getDaysBadge(sub.daysRemaining) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalCount > limit && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted small">
                Showing {((currentPage - 1) * limit) + 1} to{' '}
                {Math.min(currentPage * limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} entries
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(Math.min(Math.ceil(pagination.totalCount / limit), 10))].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}
                  <li className={`page-item ${currentPage === Math.ceil(pagination.totalCount / limit) ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === Math.ceil(pagination.totalCount / limit)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Export Modal */}
      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exporting}
      />
    </div>
  );
};

export default SubscriptionExpiryReport;

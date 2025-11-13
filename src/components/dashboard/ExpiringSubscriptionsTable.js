import React from 'react';
import { Table, Badge, Spinner } from 'react-bootstrap';
import moment from 'moment';
import './ExpiringSubscriptionsTable.scss';

const ExpiringSubscriptionsTable = ({
  subscriptions,
  loading,
  error,
  pagination,
  onPageChange
}) => {
  const getDaysBadge = (daysRemaining) => {
    if (daysRemaining === null || daysRemaining === undefined) {
      return <Badge bg="secondary">No Data</Badge>;
    }

    if (daysRemaining < 0) {
      return <Badge bg="danger">Expired {Math.abs(daysRemaining)}d ago</Badge>;
    } else if (daysRemaining === 0) {
      return <Badge bg="danger">Expires Today</Badge>;
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading expiring subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Failed to load expiring subscriptions. Please try again.
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
        <p className="mt-3 text-muted fw-bold">No subscriptions expiring in the selected period.</p>
        <p className="text-muted small">Great news! All members have active subscriptions.</p>
      </div>
    );
  }

  return (
    <div className="expiring-subscriptions-table">
      <Table responsive hover className="mb-0">
        <thead>
          <tr>
            <th>Matri ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Expiry Date</th>
            <th>Days Remaining</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub._id || sub.matriId}>
              <td>
                <strong className="text-primary">{sub.matriId || 'N/A'}</strong>
              </td>
              <td>{sub.name || 'N/A'}</td>
              <td className="text-muted small">{sub.email || 'N/A'}</td>
              <td>
                <Badge bg="secondary">{sub.planName || 'N/A'}</Badge>
              </td>
              <td>{sub.expiresAt ? moment(sub.expiresAt).format('MMM DD, YYYY') : 'N/A'}</td>
              <td>{getDaysBadge(sub.daysRemaining)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <div className="text-muted small">
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <i className="bi bi-chevron-left"></i> Previous
                </button>
              </li>
              {[...Array(Math.min(pagination.pages, 5))].map((_, index) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = index + 1;
                } else if (pagination.page <= 3) {
                  pageNum = index + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + index;
                } else {
                  pageNum = pagination.page - 2 + index;
                }

                return (
                  <li
                    key={pageNum}
                    className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}
              <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ExpiringSubscriptionsTable;

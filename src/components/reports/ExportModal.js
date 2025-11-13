import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Card } from 'react-bootstrap';
import './ExportModal.scss';

const ExportModal = ({ show, onHide, onExport, loading }) => {
  const [selectedColumns, setSelectedColumns] = useState([
    'matriId',
    'name',
    'email',
    'phone',
    'planName',
    'expiresAt',
    'daysRemaining',
    'expiryStatus'
  ]);

  // Grouped columns by category for better organization
  const columnGroups = [
    {
      title: 'Profile Information',
      icon: 'bi-person-circle',
      columns: [
        { key: 'matriId', label: 'Matri ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' }
      ]
    },
    {
      title: 'Subscription Details',
      icon: 'bi-calendar-check',
      columns: [
        { key: 'planName', label: 'Plan Name' },
        { key: 'planPrice', label: 'Plan Price' },
        { key: 'startAt', label: 'Subscription Start' },
        { key: 'expiresAt', label: 'Expiry Date' },
        { key: 'daysRemaining', label: 'Days Remaining' },
        { key: 'expiryStatus', label: 'Expiry Status' }
      ]
    },
    {
      title: 'Location Information',
      icon: 'bi-geo-alt',
      columns: [
        { key: 'branch', label: 'Branch' },
        { key: 'country', label: 'Country' },
        { key: 'state', label: 'State' },
        { key: 'city', label: 'City' }
      ]
    }
  ];

  // Flatten all columns for easy access
  const allColumns = columnGroups.flatMap(group => group.columns);

  const handleColumnToggle = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(c => c !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const handleSelectAll = () => {
    setSelectedColumns(allColumns.map(col => col.key));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleSelectGroup = (groupColumns) => {
    const groupKeys = groupColumns.map(col => col.key);
    const allSelected = groupKeys.every(key => selectedColumns.includes(key));

    if (allSelected) {
      // Deselect all in this group
      setSelectedColumns(selectedColumns.filter(key => !groupKeys.includes(key)));
    } else {
      // Select all in this group
      const newSelected = [...new Set([...selectedColumns, ...groupKeys])];
      setSelectedColumns(newSelected);
    }
  };

  const isGroupFullySelected = (groupColumns) => {
    return groupColumns.every(col => selectedColumns.includes(col.key));
  };

  const handleExport = () => {
    onExport(selectedColumns);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="export-modal" centered>
      <Modal.Header className="border-0">
        <Modal.Title className="d-flex align-items-center w-100">
          <i className="bi bi-file-earmark-spreadsheet text-success me-2" style={{ fontSize: '1.5rem' }}></i>
          <span>Export to Excel</span>
        </Modal.Title>
        <button
          type="button"
          className="custom-close-btn"
          onClick={onHide}
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Modal.Header>

      <Modal.Body className="pt-2">
        <div className="export-modal-description mb-3">
          <p className="text-muted mb-2">
            <i className="bi bi-info-circle me-1"></i>
            Select the columns you want to include in your export file.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleSelectAll}
              className="me-2"
            >
              <i className="bi bi-check-all me-1"></i>
              Select All
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleDeselectAll}
            >
              <i className="bi bi-x-circle me-1"></i>
              Clear All
            </Button>
          </div>
          <div className="selected-count-badge">
            <span className="badge bg-primary">
              {selectedColumns.length} / {allColumns.length} selected
            </span>
          </div>
        </div>

        {/* Column Groups */}
        <div className="column-groups">
          {columnGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="mb-3 border-0 shadow-sm">
              <Card.Header className="bg-light border-0 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className={`bi ${group.icon} text-primary me-2`}></i>
                  <strong className="mb-0">{group.title}</strong>
                  <span className="badge bg-secondary ms-2">{group.columns.length}</span>
                </div>
                <Button
                  variant={isGroupFullySelected(group.columns) ? "success" : "outline-primary"}
                  size="sm"
                  onClick={() => handleSelectGroup(group.columns)}
                  className="btn-sm"
                >
                  {isGroupFullySelected(group.columns) ? (
                    <>
                      <i className="bi bi-check-circle me-1"></i>
                      Selected
                    </>
                  ) : (
                    <>
                      <i className="bi bi-circle me-1"></i>
                      Select All
                    </>
                  )}
                </Button>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  {group.columns.map((column) => (
                    <Col md={6} key={column.key}>
                      <div className="custom-checkbox-wrapper">
                        <input
                          type="checkbox"
                          id={`column-${column.key}`}
                          checked={selectedColumns.includes(column.key)}
                          onChange={() => handleColumnToggle(column.key)}
                          className="custom-checkbox-input"
                        />
                        <label htmlFor={`column-${column.key}`} className="custom-checkbox-label">
                          {column.label}
                        </label>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedColumns.length === 0 && (
          <div className="alert alert-warning d-flex align-items-center mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Please select at least one column to export.
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handleExport}
          disabled={selectedColumns.length === 0 || loading}
          className="px-4"
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                className="me-2"
              />
              Exporting...
            </>
          ) : (
            <>
              <i className="bi bi-download me-2"></i>
              Export to Excel
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportModal;

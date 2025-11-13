import React, { useState } from 'react';
import { Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { masterService } from 'core/services';
import {
  PLAN_URL,
  COUNTRY_PATH,
  STATE_PATH,
  CITY_PATH
} from 'core/services/apiURL.service';
import './SubscriptionExpiryFilters.scss';

const SubscriptionExpiryFilters = ({
  onFilterChange,
  onClearFilters,
  loading
}) => {
  const { register, handleSubmit, reset } = useForm();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [selectedState, setSelectedState] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);
  const [countryIds, setCountryIds] = useState([]);
  const [stateIds, setStateIds] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  const filter = { skip: 0, limit: 100 };

  // Expiry status options
  const expiryStatusOptions = [
    { value: 'EXPIRING_7', label: '7 Days (0-7 days)', color: 'danger' },
    { value: 'EXPIRING_15', label: '15 Days (8-15 days)', color: 'warning' },
    { value: 'EXPIRING_30', label: '30 Days (16-30 days)', color: 'info' },
    { value: 'EXPIRED', label: 'Expired', color: 'dark' }
  ];

  // Load plans
  const loadPlans = async (inputValue) => {
    const searchFilter = { ...filter, filter: { status: 10 } };
    if (inputValue) {
      searchFilter.search = inputValue;
    }
    const resp = await masterService.getAllPost(PLAN_URL + '/filter', searchFilter);
    let planFilterArr = [];
    if (resp && resp.meta.code === 200) {
      const { data } = resp;
      // Exclude free plans (planId = "PLAN0")
      planFilterArr = data
        .filter((ele) => ele.planId !== 'PLAN0')
        .map((ele) => ({
          value: ele._id,
          label: ele.name,
        }));
    }
    return planFilterArr;
  };

  // Load countries
  const loadCountry = async (inputValue) => {
    const searchFilter = { ...filter, filter: {} };
    if (inputValue) {
      searchFilter.search = inputValue;
    }
    const resp = await masterService.getAllPost(COUNTRY_PATH + '/filter', searchFilter);
    let countryFilterArr = [];
    if (resp && resp.meta.code === 200) {
      const { data } = resp;
      countryFilterArr = data.map((ele) => ({
        value: ele._id,
        label: ele.name,
      }));
    }
    return countryFilterArr;
  };

  // Load states
  const loadStates = async (inputValue) => {
    if (countryIds.length === 0) {
      return [];
    }
    const searchFilter = { ...filter, filter: { country: countryIds } };
    if (inputValue) {
      searchFilter.search = inputValue;
    }
    const resp = await masterService.getAllPost(STATE_PATH + '/filter', searchFilter);
    let stateFilterArr = [];
    if (resp && resp.meta.code === 200) {
      const { data } = resp;
      stateFilterArr = data.map((ele) => ({
        value: ele._id,
        label: ele.name,
      }));
    }
    return stateFilterArr;
  };

  // Load cities
  const loadCity = async (inputValue) => {
    if (stateIds.length === 0) {
      return [];
    }
    const searchFilter = { ...filter, filter: { state: stateIds } };
    if (inputValue) {
      searchFilter.search = inputValue;
    }
    const resp = await masterService.getAllPost(CITY_PATH + '/filter', searchFilter);
    let cityFilterArr = [];
    if (resp && resp.meta.code === 200) {
      const { data } = resp;
      cityFilterArr = data.map((ele) => ({
        value: ele._id,
        label: ele.name,
      }));
    }
    return cityFilterArr;
  };

  // Handle country change
  const handleCountryChange = (values) => {
    if (values && values.length > 0) {
      const countryArrIds = values.map(ele => ele.value);
      setCountryIds(countryArrIds);
      setSelectedCountry(values);
      setSelectedState([]);
      setSelectedCity([]);
      setStateIds([]);
    } else {
      setSelectedCountry([]);
      setCountryIds([]);
      setSelectedState([]);
      setSelectedCity([]);
      setStateIds([]);
    }
  };

  // Handle state change
  const handleStateChange = (values) => {
    if (values && values.length > 0) {
      const stateArrIds = values.map(ele => ele.value);
      setStateIds(stateArrIds);
      setSelectedState(values);
      setSelectedCity([]);
    } else {
      setStateIds([]);
      setSelectedState([]);
      setSelectedCity([]);
    }
  };

  // Handle city change
  const handleCityChange = (values) => {
    if (values && values.length > 0) {
      setSelectedCity(values);
    } else {
      setSelectedCity([]);
    }
  };

  // Handle form submission
  const onSubmit = (data) => {
    const filters = {
      from: fromDate || undefined,
      to: toDate || undefined,
      expiryStatus: selectedStatus.map(s => s.value),
      plans: selectedPlans.map(p => p.value),
      country: selectedCountry.map(c => c.value),
      state: selectedState.map(s => s.value),
      city: selectedCity.map(c => c.value),
      search: data.search || undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || (Array.isArray(filters[key]) && filters[key].length === 0)) {
        delete filters[key];
      }
    });

    // Build active filters array for display
    const active = [];
    if (fromDate) active.push({ label: 'From Date', value: fromDate });
    if (toDate) active.push({ label: 'To Date', value: toDate });
    if (selectedStatus.length) active.push({ label: 'Status', value: `${selectedStatus.length} selected` });
    if (selectedPlans.length) active.push({ label: 'Plans', value: `${selectedPlans.length} selected` });
    if (selectedCountry.length) active.push({ label: 'Country', value: `${selectedCountry.length} selected` });
    if (data.search) active.push({ label: 'Search', value: data.search });

    setActiveFilters(active);
    onFilterChange(filters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedPlans([]);
    setSelectedStatus([]);
    setSelectedCountry([]);
    setSelectedState([]);
    setSelectedCity([]);
    setCountryIds([]);
    setStateIds([]);
    setActiveFilters([]);
    reset();
    onClearFilters();
  };

  return (
    <div className="subscription-expiry-filters mb-4">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="filter-panel">
          <Row>
            {/* Date Range */}
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="Select start date"
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="Select end date"
                  min={fromDate}
                  disabled={!fromDate}
                />
              </Form.Group>
            </Col>

            {/* Expiry Status */}
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Expiry Status</Form.Label>
                <Select
                  isMulti
                  options={expiryStatusOptions}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="Select status..."
                  className="react-select"
                />
              </Form.Group>
            </Col>

            {/* Plans */}
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Plans</Form.Label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  loadOptions={loadPlans}
                  value={selectedPlans}
                  onChange={setSelectedPlans}
                  placeholder="Select plans..."
                  className="react-select"
                />
              </Form.Group>
            </Col>

            {/* Country */}
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  loadOptions={loadCountry}
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  placeholder="Select country..."
                  className="react-select"
                />
              </Form.Group>
            </Col>

            {/* State */}
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  loadOptions={loadStates}
                  value={selectedState}
                  onChange={handleStateChange}
                  placeholder="Select state..."
                  isDisabled={countryIds.length === 0}
                  key={countryIds.join(',')}
                  className="react-select"
                />
              </Form.Group>
            </Col>

            {/* City */}
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  loadOptions={loadCity}
                  value={selectedCity}
                  onChange={handleCityChange}
                  placeholder="Select city..."
                  isDisabled={stateIds.length === 0}
                  key={stateIds.join(',')}
                  className="react-select"
                />
              </Form.Group>
            </Col>

            {/* Search */}
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by Name, Email, or Matri ID..."
                  {...register('search')}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                variant="outline-secondary"
                onClick={handleClearFilters}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-1"></i>
                Clear Filters
              </Button>
            </div>
            <div>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                <i className="bi bi-funnel me-1"></i>
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="active-filters mt-3">
              <span className="text-muted me-2">Active Filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge bg="info" key={index} className="me-2">
                  {filter.label}: {filter.value}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Form>
    </div>
  );
};

export default SubscriptionExpiryFilters;

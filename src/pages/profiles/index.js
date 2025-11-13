import { Button, Card, Col, Row } from "react-bootstrap";
import DataTableRemote from "components/data-table";
import { Fragment, useEffect, useRef, useState } from "react";
import { commonService, masterService } from "core/services";
import Actions from "components/actions";
import { VIEW_PROFILE, ADD_PROFILE, EDIT_PROFILE } from "pages/routes/routes";
import BreadCrumb from "components/common/breadcrumb";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  COUPON_ISVALID,
  PAYMENT,
  PLAN_URL,
  PROFILE_URL,
  USER_SUBSCRIBE,
} from "core/services/apiURL.service";
import { CONST, utils } from "core/helper";
import { connect } from "react-redux";
import ModalCommon from "components/modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import AsyncSelect from "react-select/async";
import { getProfileID, setProfileID } from "core/helper/localstorage";
import moment from "moment";
import { getFirstCaps } from "core/helper/utils";

const validationSchema = Yup.object().shape({
  status: Yup.number().required("Status is required"),
});

const planUpgradeValidationSchema = Yup.object().shape({
  paymentType: Yup.string(),
  paymentThrough: Yup.string().label("Payment Through").required(),
  // transactionId: Yup.string().when("paymentType", {
  //   is: (val) => val !== "10",
  //   then: Yup.string().label("Transaction Id").required(),
  // }),
});

const Profiles = (props) => {
  const { commonData } = props;

  const columns = [
    {
      name: "Matri ID",
      selector: (row) => row?.profileID,
    },
    {
      name: "Name",
      selector: (row) => (row.name ? row?.name : row.user?.name),
    },
    {
      name: "Phone",
      selector: (row) => row.user?.phone,
    },
    {
      name: "Email",
      selector: (row) => row.user?.email,
    },
    {
      name: "Created At",
      selector: (row) =>
        row?.createdAt ? moment(row?.createdAt).format("DD-MM-YYYY") : " --- ",
    },
    {
      name: "Plan",
      selector: (row) => row.plan?.name,
    },
    {
      name: "Expiry Date",
      selector: (row) => {
        return row.subscription?.expiresAt
          ? moment(row.subscription.expiresAt).format('MMM DD, YYYY')
          : 'N/A';
      },
    },
    {
      name: "Days Remaining",
      selector: (row) => {
        const daysRemaining = row.subscription?.daysRemaining;
        if (daysRemaining === null || daysRemaining === undefined) {
          return 'No Plan';
        }
        if (daysRemaining < 0) {
          return `Expired ${Math.abs(daysRemaining)}d ago`;
        }
        if (daysRemaining === 0) {
          return 'Expires Today';
        }
        return `${daysRemaining} days`;
      },
    },
    {
      name: "Created By",
      selector: (row) => row?.createdBy,
    },
    {
      name: "Created For",
      selector: (row) =>
        getCommonDataVal("profileCreatedBy", row.basic?.profileCreatedBy),
    },

    {
      name: "Status",
      selector: (row) => {
        const { status } = row.user;
        const { userStatus } = commonData;
        const data = userStatus
          ? userStatus.find((ele) => ele.code === status)
          : {};
        let class_name = "";
        switch (data.code) {
          case 10:
            class_name = "btn-success";
            break;
          case 20:
            class_name = "btn-danger";
            break;
          case 30:
            class_name = "btn-info";
            break;

          default:
            class_name = "btn-primary";
            break;
        }
        return (
          <button
            type="button"
            onClick={() => handleStatusChange(row)}
            className={`btn ${class_name} btn-sm`}
          >
            {data.label}
          </button>
        );
      },
    },
    {
      name: "Action",
      cell: (row) => {
        const isDeleted = row.user?.status === 30;
        return (
          <Actions
            viewUrl={VIEW_PROFILE + "/" + row.profileID}
            editUrl={EDIT_PROFILE + "/" + row.profileID}
            updateOnClick={() => handlePlanUpdate(row.profileID)}
            revertOnClick={isDeleted ? () => handleRevertProfile(row) : null}
            rowId={row._id}
          />
        );
      },
      ignoreRowClick: true,
      grow: 1,
    },
  ];

  const subscribeColumns = [
    {
      name: "Plan Name",
      selector: (row) => row.plan?.name,
    },
    {
      name: "Plan Amount",
      selector: (row) => row.plan?.price,
    },
    {
      name: "Start Date",
      selector: (row) => moment(row.startAt).format("YYYY-MM-DD"),
    },
    {
      name: "End Date",
      selector: (row) => moment(row.expiresAt).format("YYYY-MM-DD"),
    },
    {
      name: "Payment Type",
      selector: (row) =>
        getCommonDataVal("paymentType", row?.payment?.paymentType),
    },
    {
      name: "Payment Mode",
      selector: (row) => row?.payment?.paymentMode,
    },
    {
      name: "Status",
      selector: (row) => {
        const { status } = row;
        const { userStatusUI } = commonData;
        const data = userStatusUI
          ? userStatusUI.find((ele) => ele.code === status)
          : {};
        let class_name = "";
        switch (data.code) {
          case 10:
            class_name = "btn-success";
            break;
          case 20:
            class_name = "btn-danger";
            break;
          case 30:
            class_name = "btn-info";
            break;

          default:
            class_name = "btn-primary";
            break;
        }
        return (
          <button
            type="button"
            // onClick={() => handleStatusChange(row)}
            className={`btn ${class_name} btn-sm`}
          >
            {data.label}
          </button>
        );
      },
    },
  ];

  const getCommonDataVal = (key, value) => {
    const data = commonData[key]?.find((ele) => ele.code === value);
    return data ? data?.label : "";
  };

  const [pageFor] = useState("Profile List");
  const [dataSource, setDataSource] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(CONST.DEFAULT_PER_PAGE);
  const [filter, setFilter] = useState({ ...CONST.DEFAULT_ADV_FILTER });
  const [subScribeFilter, setSubscribeFilter] = useState({
    ...CONST.DEFAULT_FILTER,
  });
  const [spinner, setSpinner] = useState(true);
  const [mobileVal, setMobileVal] = useState("");
  const [planUpdateShow, setPlanUpdateShow] = useState(false);
  const [planSelected, setPlanSelected] = useState(null);
  const [isPlanSelected, setIsPlanSelected] = useState(false);
  const [plan, setPlan] = useState(null);
  const [isApplyCoupon, setIsApplyCoupon] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [couponResp, setCouponResp] = useState(null);
  const [isCouponeAvail, setIsCouponAvail] = useState(false);

  const [planFilter] = useState({ ...CONST.DEFAULT_ADV_FILTER });

  const [subscribesTotalRows, setSubscribesTotalRows] = useState(0);
  const [subscribePerPage, setSubscribesPerPage] = useState(
    CONST.DEFAULT_PER_PAGE
  );
  const [subscribes, setSubscribes] = useState([]);
  const [subscribeFilter, setSubscribesFilter] = useState({
    ...CONST.DEFAULT_FILTER,
  });
  const [user, setUser] = useState(null);
  const [planSubscribeReload, setPlanSubscribeReload] = useState(false);

  const [modalShow, setModalShow] = useState(false);
  const [profile, setProfile] = useState({});
  const [modalTitle, setModalTitle] = useState("");
  const [planUpgradeUserId, setPlanUpgradeUserId] = useState("");

  const handleModalShow = () => setModalShow(true);
  const handleModalClose = () => {
    setModalShow(false);
  };

  const handlePlanUpdateShow = () => {
    setModalTitle("Plan Upgrade");
    setPlanUpdateShow(true);
    getUser();
  };

  const handlePlanUpdateClose = () => {
    setPlanUpdateShow(false);
    setIsPlanSelected(false);
    planUpdateReset();
    setPlanSelected(null);
    setIsApplyCoupon(false);
    setUser(null);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const {
    register: search,
    handleSubmit: searchHandleSubmit,
    reset: searchFromReset,
    setValue: searchSetValue,
    formState: { isDirty, isSubmitting: searchIsSubmitting },
  } = useForm();

  const {
    register: planUpdateRegister,
    handleSubmit: planUpdateHandleSubmit,
    reset: planUpdateReset,
    setValue: planUpgradeValue,
    formState: {
      isSubmitting: planUpdateIsSubmitting,
      errors: planUpgradeErrors,
    },
    resetField,
  } = useForm({
    resolver: yupResolver(planUpgradeValidationSchema),
    defaultValues: {
      paymentTypeVal: paymentType,
    },
  });

  const handleStatusChange = (profile) => {
    setModalTitle("Change Profile Status");
    setProfile(profile);
    setValue("status", profile.user.status.toString());
    handleModalShow();
  };

  const handlePlanUpdate = (profileId) => {
    // const resp = await masterService.getById();
    setProfileID(profileId);
    setPlanUpgradeUserId(profileId);
    handlePlanUpdateShow();
  };

  const handleRevertProfile = async (profile) => {
    const confirmRevert = window.confirm(
      `Are you sure you want to revert the profile ${profile.profileID}?`
    );
    
    if (confirmRevert) {
      try {
        const resp = await commonService.create(
          PROFILE_URL + "/revert-delete/" + profile.profileID,
          {}
        );
        
        if (resp && resp.meta.code === 200) {
          utils.showSuccessMsg(resp.meta.message || `Profile ${profile.profileID} has been successfully reverted.`);
          
          // Refresh the data
          setFilter({
            ...filter,
            filter: {},
          });
        } else {
          utils.showErrMsg(resp?.meta?.message || "Failed to revert profile. Please try again.");
        }
      } catch (error) {
        utils.showErrMsg("Failed to revert profile. Please try again.");
      }
    }
  };

  const getUser = async () => {
    const resp = await masterService.getById(PROFILE_URL);
    if (resp && resp.meta.code === 200) {
      const { data } = resp;
      setUser(data);
    }
  };

  const loadPlans = async (inputValue) =>
    new Promise(async (resolve) => {
      planFilter.filter = {
        status: 10,
      };
      if (inputValue) {
        planFilter.search = inputValue;
      }
      let planFilterArr = [];
      const resp = await masterService.getAllPost(
        PLAN_URL + "/filter",
        planFilter
      );
      if (resp && resp.meta.code === 200) {
        const { data } = resp;
        planFilterArr = data.map((ele) => ({
          value: ele._id,
          label: ele.name,
          ...ele,
        }));
      }
      resolve(planFilterArr);
    });

  const handlePlanChange = (value) => {
    if (value) {
      planUpgradeValue("planId", value?._id);
      setPlanSelected({
        label: value?.label,
        value: value?._id,
      });
      loadPlan(value?._id);
    } else {
      planUpgradeValue("planId", "");
      setPlanSelected(null);
      setIsPlanSelected(false);
      setPaymentType("");
      planUpdateReset();
    }
  };

  const loadPlan = async (planId) => {
    const resp = await masterService.getById(PLAN_URL + "/" + planId);
    if (resp && resp.meta.code === 200) {
      const { data } = resp;
      setIsPlanSelected(true);
      setPlan(data);
    }
  };

  const handleApplyCoupon = () => {
    setIsApplyCoupon(true);
  };

  const handleCancelCoupon = () => {
    setIsApplyCoupon(false);
    setIsCouponAvail(false);
    resetField("couponId");
  };

  const handlePaymentTypeChange = (e) => {
    const { value } = e.target;
    // planUpgradeValue("paymentType", value, { shouldValidate: true });
    planUpgradeValue("paymentTypeVal", value);
    setPaymentType(value);
  };

  const couponIsValid = async (e) => {
    const { value } = e.target;
    if (value.length === 6) {
      planUpgradeValue("couponId", value);
      const resp = await masterService.getAllPost(COUPON_ISVALID, {
        couponCode: value,
      });
      if (resp && resp.meta.code === 200) {
        const { data } = resp;
        if (data) {
          utils.showSuccessMsg(resp.meta.message);
          setCouponResp(data);
          setIsCouponAvail(true);
        } else {
          utils.showErrMsg("Coupon is not valid");
          setCouponResp(null);
          setIsCouponAvail(false);
        }
      }
    }
  };

  const onPlanUpdateSubmit = async (values) => {
    const {
      // paymentType: paymentMethod,
      planId,
      transactionId,
      couponId,
      paymentThrough,
    } = values;
    const payload = {
      paymentType: 20,
      planId,
      transactionId,
      // paymentThrough: paymentMethod === "10" ? 10 : undefined,
      paymentThrough,
      couponId: couponId && couponId,
    };
    const resp = await masterService.getAllPost(PAYMENT, payload);
    if (resp && resp.meta.code === 200) {
      utils.showSuccessMsg(resp.meta.message);
      handlePlanUpdateClose();
      // loadSubscribes(planUpgradeUserId);
      setFilter({
        ...filter,
        filter: {},
      });
      setPlanSubscribeReload(!planSubscribeReload);
    } else if (resp && resp.meta.code === 1020) {
      utils.showErrMsg(resp.meta.message);
    } else if (resp && resp.meta.code === 1025) {
      utils.showErrMsg(resp.meta.message);
    }
  };

  const onSubmit = async (value) => {
    console.log("value::", value);
    const resp = await commonService.create(
      PROFILE_URL + "/change-status/" + profile.profileID,
      value
    );
    if (resp && resp.meta.code === 200) {
      utils.showSuccessMsg(resp.meta.message);
      reset();
      handleModalClose();
      setFilter({
        ...filter,
        filter: {},
      });
    }
  };

  const handlePageChange = (page) => {
    setFilter({
      ...filter,
      skip: page > 1 ? (page - 1) * perPage : 0,
    });
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setFilter({
      ...filter,
      skip: page > 1 ? (page - 1) * perPage : 0,
      limit: newPerPage,
    });
  };

  const handleSubscribePageChange = (page) => {
    setSubscribesFilter({
      ...subScribeFilter,
      skip: page > 1 ? (page - 1) * subscribePerPage : 0,
    });
  };

  const handleSubscribePerRowsChange = (newPerPage, page) => {
    setSubscribesPerPage(newPerPage);
    setSubscribesFilter({
      ...subScribeFilter,
      skip: page > 1 ? (page - 1) * subscribePerPage : 0,
      limit: newPerPage,
    });
  };

  const searchReset = () => {
    searchFromReset();
    setFilter({
      ...filter,
      filter: {},
    });
    setMobileVal("");
  };

  const handleChangeMobileNo = (e) => {
    const { value: phoneValue } = e.target;
    console.log("phoneValue::", phoneValue);
    console.log("typeof phoneValue::", typeof phoneValue);
    const regex = /^[0-9\b]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      // setMobileVal(phoneValue);
      searchSetValue("phone", phoneValue);
    }
  };

  const onSubmitSearch = async (values) => {
    const { name, profileID, phone, email, status } = values;
    console.log("status ::", status);
    console.log("status ::", typeof status);
    if ((email || profileID || phone || name || status) === "") {
      utils.showErrMsg("Atleast minimum field is required");
      return false;
    }

    const filterObj = {};
    if (email !== "") {
      filterObj.email = email;
    }
    if (name !== "") {
      filterObj.name = name;
    }
    if (phone !== "") {
      filterObj.phone = phone;
    }
    if (profileID !== "") {
      filterObj.profileID = profileID;
    }
    if (status !== "") {
      filterObj.status = Number(status);
    }

    if (status === "All" || status === "") {
      // filterObj.status = undefined
      delete filterObj.status;
      setFilter({
        ...filter,
        filter: filterObj,
      });
    }

    setFilter({
      skip: 0,
      limit: 10,
      sortBy: "_id",
      sort: -1,
      filter: filterObj,
    });
  };

  const [isComponentMounted, setComponentMounted] = useState(false);
  useEffect(() => {
    const loadUsers = async () => {
      setSpinner(true);
      const resp = await commonService.profileFilter(
        PROFILE_URL + "/filter",
        filter
      );
      if (resp && resp.meta.code === 200) {
        const { data, pagination } = resp;
        setTotalRows(data.length > 0 ? pagination.totalCount : 0);
        setDataSource(data.length > 0 ? data : []);
        setSpinner(false);
      }
    };
    const handleChange = async () => {
      await loadUsers();
    };
    if (isComponentMounted) {
      handleChange();
    }
  }, [isComponentMounted, filter]);

  useEffect(() => {
    const loadSubscribes = async (planUpgradeUserId, subFilter) => {
      setSpinner(true);
      const resp = await masterService.getAll(
        USER_SUBSCRIBE + planUpgradeUserId,
        subFilter
      );
      if (resp && resp.meta.code === 200) {
        const { data, pagination } = resp;
        setSubscribesTotalRows(data.length > 0 ? pagination.totalCount : 0);
        setSubscribes(data.length > 0 ? data : []);
        setSpinner(false);
      } else {
        setSpinner(false);
      }
    };
    if (planUpgradeUserId || planSubscribeReload) {
      console.log("planUpgradeUserId::", planUpgradeUserId);
      loadSubscribes(planUpgradeUserId, subscribeFilter);
    }
  }, [planUpgradeUserId, planSubscribeReload, subscribeFilter]);

  useEffect(() => {
    setComponentMounted(true);
  }, []);

  console.log("couponResp::", couponResp);
  const getCalculateTotalAmount = (discountType, discountVal, price) => {
    if (discountType === 20) {
      const discountAmount = (discountVal / 100) * price;
      return Math.round(price - discountAmount);
    } else {
      return Math.round(price - discountVal);
    }
  };

  const getCalculateTotalAmountWithCounponAmount = (
    couponAmount,
    discountType,
    discountVal,
    price
  ) => {
    if (discountType === 20 && couponAmount) {
      const discountAmount = (discountVal / 100) * price;
      const totalAmount = Math.round(price - (discountAmount + couponAmount));
      return totalAmount;
    } else {
      const totalAmount = Math.round(price - (discountVal + couponAmount));
      return totalAmount;
    }
  };

  return (
    <div>
      <BreadCrumb pageFor={pageFor} />
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body>
              <Row className="m-2">
                <Col md={6}></Col>
                <Col
                  md={6}
                  className="ml-lg-auto d-flex pt-2 pt-md-0 align-items-stretch justify-content-end"
                >
                  <Link className="nav-link" to={ADD_PROFILE}>
                    <button className="btn btn-rounded btn-success">
                      + Add
                    </button>
                  </Link>
                </Col>
              </Row>
              <Form
                className="forms-sample"
                onSubmit={searchHandleSubmit(onSubmitSearch)}
              >
                <Row>
                  <Col md={2}>
                    <Form.Group className="form-group">
                      <Form.Control
                        type="text"
                        placeholder="Matri Id"
                        size="md"
                        {...search("profileID")}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="form-group">
                      <Form.Control
                        {...search("phone")}
                        type="text"
                        size="md"
                        placeholder="Phone"
                        className="custome_num_input"
                        pattern="[0-9]*"
                        // value={mobileVal}
                        onChange={handleChangeMobileNo}
                        maxLength={10}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="form-group">
                      <Form.Control
                        type="text"
                        placeholder="Enter Username"
                        size="md"
                        {...search("name")}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="form-group">
                      <Form.Control
                        type="text"
                        placeholder="Enter Useremail"
                        size="md"
                        {...search("email")}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="form-group">
                      <Form.Select
                        className="form-control"
                        {...search("status")}
                      >
                        <option value={"All"}>All</option>
                        {commonData?.userStatus?.map((ele, ind) => (
                          <option key={ind} value={ele.code}>
                            {ele.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="pb-2 d-flex justify-content-end">
                  {isDirty && (
                    <button
                      onClick={searchReset}
                      type="reset"
                      className="btn btn-gradient-danger mr-2"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    disabled={searchIsSubmitting}
                    type="submit"
                    className="btn btn-gradient-primary mr-2"
                  >
                    Search
                  </button>
                </div>
              </Form>
              <DataTableRemote
                noHeader={true}
                subHeader={false}
                columns={columns}
                data={dataSource}
                totalRows={totalRows}
                handlePageChange={handlePageChange}
                handlePerRowsChange={handlePerRowsChange}
                progressPending={spinner}
                conditionalRowStyles={[
                  {
                    when: row => {
                      const daysRemaining = row.subscription?.daysRemaining;
                      if (daysRemaining === null || daysRemaining === undefined) return false;
                      return daysRemaining < 0 || daysRemaining <= 7;
                    },
                    style: {
                      backgroundColor: '#FFE0B2',
                      borderLeft: '4px solid #FB8C00'
                    }
                  },
                  {
                    when: row => {
                      const daysRemaining = row.subscription?.daysRemaining;
                      return daysRemaining > 7 && daysRemaining <= 15;
                    },
                    style: {
                      backgroundColor: '#FFF9C4',
                      borderLeft: '4px solid #FDD835'
                    }
                  },
                  {
                    when: row => {
                      const daysRemaining = row.subscription?.daysRemaining;
                      return daysRemaining > 15 && daysRemaining <= 30;
                    },
                    style: {
                      backgroundColor: '#F1F8E9',
                      borderLeft: '4px solid #AED581'
                    }
                  }
                ]}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {modalShow && (
        <ModalCommon
          show={modalShow}
          handleClose={handleModalClose}
          size="md"
          modalTitle={modalTitle}
        >
          {modalTitle && modalTitle === "Change Profile Status" && (
            <Form onSubmit={handleSubmit(onSubmit)} className="pt-3">
              <Form.Group className="search-field form-group">
                <div className="d-flex">
                  {commonData.userStatusUI &&
                    commonData.userStatusUI.map((ele, ind) => {
                      return (
                        <Form.Check className="mx-1" key={ind}>
                          <Form.Check.Label>
                            <Form.Check.Input
                              type="radio"
                              name="status"
                              value={ele.code}
                              {...register("status")}
                            />
                            <i className="input-helper"></i> {ele.label}
                          </Form.Check.Label>
                        </Form.Check>
                      );
                    })}
                </div>
                <p className="text-danger">{errors.status?.message}</p>
              </Form.Group>
              <div className="mt-3">
                <Button
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm font-weight-medium auth-form-btn"
                  type="submit"
                >
                  Submit
                </Button>
                <Button
                  className="btn btn-danger btn-sm"
                  onClick={handleModalClose}
                >
                  Close
                </Button>
              </div>
            </Form>
          )}
        </ModalCommon>
      )}
      {planUpdateShow && (
        <ModalCommon
          show={planUpdateShow}
          handleClose={handlePlanUpdateClose}
          size="lg"
          modalTitle={modalTitle}
        >
          {modalTitle && modalTitle === "Plan Upgrade" && (
            <Fragment>
              {user === null && <h3 className="py-5 text-center">Loading</h3>}
              {user !== null && (
                <Fragment>
                  <Row>
                    <Col md={12}>
                      <Row>
                        <Col xl={12}>
                          <h5>
                            <u>User Details</u>
                          </h5>
                        </Col>
                        <Col xl={12}>
                          <Row>
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-2 col-form-label">
                                  Name
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  {user?.name
                                    ? getFirstCaps(user?.name)
                                    : getFirstCaps(user?.user?.name)}
                                </Form.Label>
                              </div>
                            </Col>
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-2 col-form-label">
                                  Email
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  {user?.user?.email}
                                </Form.Label>
                              </div>
                            </Col>
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-2 col-form-label">
                                  Phone
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  {user?.user?.phone}
                                </Form.Label>
                              </div>
                            </Col>
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-2 col-form-label">
                                  Gender
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  {getCommonDataVal(
                                    "gender",
                                    user?.basic?.gender
                                  )}
                                </Form.Label>
                              </div>
                            </Col>
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-2 col-form-label">
                                  Profile ID
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  {user?.profileID}
                                </Form.Label>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Form
                    onSubmit={planUpdateHandleSubmit(onPlanUpdateSubmit)}
                    className="pt-3"
                  >
                    <Row>
                      <Col md={6}>
                        <h5>
                          <u>Select Plan</u>
                        </h5>
                        <Row>
                          <Col xl={12} lg={6}>
                            <div className="row mt-2">
                              <Form.Label className="col-sm-4 col-form-label">
                                Plans
                              </Form.Label>
                              <div className="col-sm-8">
                                <AsyncSelect
                                  cacheOptions
                                  defaultOptions
                                  loadOptions={loadPlans}
                                  onChange={handlePlanChange}
                                  value={planSelected}
                                  isClearable
                                />
                                {isApplyCoupon && (
                                  <h6
                                    onClick={handleCancelCoupon}
                                    className="mt-2 d-flex justify-content-end plan_update_apply_coupon"
                                  >
                                    Cancel Coupon
                                  </h6>
                                )}
                                {!isApplyCoupon && (
                                  <h6
                                    onClick={handleApplyCoupon}
                                    className="mt-2 d-flex justify-content-end plan_update_apply_coupon"
                                  >
                                    Apply Coupon
                                  </h6>
                                )}
                              </div>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          {isPlanSelected && isApplyCoupon && (
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-4 col-form-label">
                                  Coupon
                                </Form.Label>
                                <div className="col-sm-8">
                                  <Form.Control
                                    onChange={(e) => couponIsValid(e)}
                                    className="form-control"
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter Coupon Code"
                                    disabled={isCouponeAvail}
                                  />
                                </div>
                              </div>
                            </Col>
                          )}
                        </Row>
                        {/* {isPlanSelected && (
                      <Row>
                        <Col xl={12} lg={6}>
                          <div className="row">
                            <Form.Label className="col-sm-3 col-form-label">
                              Payment Type
                            </Form.Label>
                            <div className="col-sm-9">
                              <div className="d-flex">
                                {commonData.paymentType &&
                                  commonData.paymentType.map((ele, ind) => (
                                    <Form.Check className="mx-1" key={ind}>
                                      <Form.Check.Label>
                                        <Form.Check.Input
                                          type="radio"
                                          value={ele.code}
                                          {...planUpdateRegister("paymentType")}
                                          onChange={(e) =>
                                            handlePaymentTypeChange(e)
                                          }
                                        />
                                        <i className="input-helper"></i>{" "}
                                        {ele.label}
                                      </Form.Check.Label>
                                    </Form.Check>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    )} */}
                        {isPlanSelected && (
                          <Row>
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-4 col-form-label">
                                  Payment Through
                                </Form.Label>
                                <div className="col-sm-8">
                                  <Form.Select
                                    className="form-control mt-2"
                                    {...planUpdateRegister("paymentThrough")}
                                    onChange={(e) => handlePaymentTypeChange(e)}
                                  >
                                    <option value={""}>Select</option>
                                    {commonData.paymentThrough &&
                                      commonData.paymentThrough.map(
                                        (ele, ind) => (
                                          <option value={ele.label} key={ind}>
                                            {ele.label}
                                          </option>
                                        )
                                      )}
                                  </Form.Select>
                                  <p className="text-danger">
                                    {planUpgradeErrors?.paymentThrough?.message}
                                  </p>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        )}
                        {/* {isPlanSelected && getPaymentType !== "10" && (
                      <Row>
                        <Col xl={12} lg={6}>
                          <div className="row mt-2">
                            <Form.Label className="col-sm-4 col-form-label">
                              Transaction ID
                            </Form.Label>
                            <div className="col-sm-8">
                              <Form.Control
                                {...planUpdateRegister("transactionId")}
                                className="form-control"
                                type="text"
                                placeholder="Enter Transaction ID"
                              />
                              <span className="text-danger">
                                {planUpgradeErrors?.transactionId?.message}
                              </span>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    )} */}
                      </Col>
                      {isPlanSelected && (
                        <Col md={6}>
                          <h5>
                            <u>Plan Details</u>
                          </h5>
                          <Row>
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-4 col-form-label">
                                  Plan Name
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  {plan?.name}
                                </Form.Label>
                              </div>
                            </Col>
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-4 col-form-label">
                                  Plan Amount
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  ₹{plan.price}
                                </Form.Label>
                              </div>
                            </Col>
                            {plan?.discountValue !== 0 && (
                              <Col xl={12} lg={6}>
                                <div className="row">
                                  <Form.Label className="col-sm-4 col-form-label">
                                    Discount Amount
                                  </Form.Label>
                                  <Form.Label className="col-sm-8 col-form-label">
                                    {plan?.discountValue}
                                  </Form.Label>
                                </div>
                              </Col>
                            )}
                            {plan?.discountValue !== 0 && (
                              <Col xl={12} lg={6}>
                                <div className="row">
                                  <Form.Label className="col-sm-4 col-form-label">
                                    Discount Type
                                  </Form.Label>
                                  <Form.Label className="col-sm-8 col-form-label">
                                    {getCommonDataVal(
                                      "discountType",
                                      plan?.discountType
                                    )}
                                  </Form.Label>
                                </div>
                              </Col>
                            )}
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-4 col-form-label">
                                  Validity
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  {plan?.validity + " months"}
                                </Form.Label>
                              </div>
                            </Col>
                            {isCouponeAvail && (
                              <Col xl={12} lg={6}>
                                <div className="row">
                                  <Form.Label className="col-sm-4 col-form-label">
                                    Coupon Amount
                                  </Form.Label>
                                  <Form.Label className="col-sm-8 col-form-label">
                                    {"₹" + couponResp?.amount}
                                  </Form.Label>
                                </div>
                              </Col>
                            )}
                            <Col xl={12} lg={6}>
                              <div className="row">
                                <Form.Label className="col-sm-4 col-form-label">
                                  Total Amount
                                </Form.Label>
                                <Form.Label className="col-sm-8 col-form-label">
                                  ₹
                                  {/* {couponResp?.amount
                                    ? plan?.price - couponResp?.amount
                                    : plan?.price} */}
                                  {couponResp
                                    ? getCalculateTotalAmountWithCounponAmount(
                                        couponResp?.amount,
                                        plan?.discountType,
                                        plan?.discountValue,
                                        plan?.price
                                      )
                                    : getCalculateTotalAmount(
                                        plan?.discountType,
                                        plan?.discountValue,
                                        plan?.price
                                      )}
                                </Form.Label>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                      )}
                    </Row>
                    {isPlanSelected && (
                      <div className="row justify-content-center mt-3">
                        <Button
                          disabled={planUpdateIsSubmitting}
                          className="btn btn-primary btn-sm font-weight-medium auth-form-btn"
                          type="submit"
                        >
                          Pay
                        </Button>
                        <Button
                          className="btn btn-danger btn-sm"
                          onClick={handlePlanUpdateClose}
                        >
                          Close
                        </Button>
                      </div>
                    )}
                  </Form>
                  <Row>
                    <Col xl={12}>
                      <Row>
                        <Col xl={12}>
                          <h5>
                            <u>User Subscribed Plans</u>
                          </h5>
                        </Col>
                        <Col xl={12}>
                          <DataTableRemote
                            noHeader={true}
                            subHeader={false}
                            columns={subscribeColumns}
                            data={subscribes}
                            totalRows={subscribesTotalRows}
                            handlePageChange={handleSubscribePageChange}
                            handlePerRowsChange={handleSubscribePerRowsChange}
                            progressPending={spinner}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Fragment>
              )}
            </Fragment>
          )}
        </ModalCommon>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    commonData: state?.common?.commonData,
    user: state?.account?.authUser,
  };
};

export default connect(mapStateToProps, null)(Profiles);
